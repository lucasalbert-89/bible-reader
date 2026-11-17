import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import WebSocket from 'npm:ws@8';
import { AUDIO_BUCKET, getTtlDays, purgeExpiredAudioCache } from '../_shared/audioCache.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VALID_VERSIONS = new Set(['acf', 'naa', 'nvi']);
const MAX_TEXT_CHARS = 30000;
const MAX_CHUNK_BYTES = 4000;

const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const DEFAULT_CHROMIUM_VERSION = '143.0.3650.75';
const DEFAULT_VOICE = 'pt-BR-AntonioNeural';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function slugifyBook(bookName: string): string {
  return bookName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function splitTextByUtf8Bytes(text: string, maxBytes = MAX_CHUNK_BYTES): string[] {
  const encoder = new TextEncoder();
  const sentences = text.split(/(?<=[.!?;:\n])\s+/);
  const chunks: string[] = [];
  let current = '';

  const pushWordByWord = (segment: string) => {
    const words = segment.split(/\s+/);
    let buf = '';
    for (const word of words) {
      const candidate = buf ? `${buf} ${word}` : word;
      if (encoder.encode(candidate).length > maxBytes) {
        if (buf) chunks.push(buf);
        buf = word;
      } else {
        buf = candidate;
      }
    }
    if (buf) chunks.push(buf);
  };

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (encoder.encode(trimmed).length > maxBytes) {
      if (current) {
        chunks.push(current);
        current = '';
      }
      pushWordByWord(trimmed);
      continue;
    }

    const candidate = current ? `${current} ${trimmed}` : trimmed;
    if (encoder.encode(candidate).length > maxBytes) {
      if (current) chunks.push(current);
      current = trimmed;
    } else {
      current = candidate;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

async function generateSecMsGec(): Promise<string> {
  const WINDOWS_FILE_TIME_EPOCH = 11644473600n;
  const nowSecs = BigInt(Math.floor(Date.now() / 1000));
  const ticks = (nowSecs + WINDOWS_FILE_TIME_EPOCH) * 10000000n;
  const roundedTicks = ticks - (ticks % 3000000000n);
  const stringToHash = `${roundedTicks}${TRUSTED_CLIENT_TOKEN}`;
  const data = new TextEncoder().encode(stringToHash);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

function formatRate(speakingRate: number): string {
  const pct = Math.round((speakingRate - 1) * 100);
  return `${pct >= 0 ? '+' : ''}${pct}%`;
}

async function synthesizeEdgeTtsChunk(
  text: string,
  voiceName: string,
  speakingRate: number,
  chromiumVersion: string
): Promise<Uint8Array> {
  const gecToken = await generateSecMsGec();
  const connectionId = crypto.randomUUID().replace(/-/g, '');
  const requestId = crypto.randomUUID().replace(/-/g, '');
  const url =
    `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1` +
    `?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}` +
    `&Sec-MS-GEC=${gecToken}` +
    `&Sec-MS-GEC-Version=1-${chromiumVersion}` +
    `&ConnectionId=${connectionId}`;

  return await new Promise<Uint8Array>((resolve, reject) => {
    const audioChunks: Uint8Array[] = [];
    let settled = false;

    const ws = new WebSocket(url, {
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        'Origin': 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromiumVersion} Safari/537.36 Edg/${chromiumVersion}`,
      },
    });

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        ws.close();
        reject(new Error('Timeout ao sintetizar áudio.'));
      }
    }, 25000);

    const finish = (err?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      try { ws.close(); } catch { /* ignore */ }
      if (err) reject(err);
      else resolve(concatUint8Arrays(audioChunks));
    };

    ws.on('open', () => {
      const timestamp = new Date().toString();
      const configMsg =
        `X-Timestamp:${timestamp}\r\n` +
        `Content-Type:application/json; charset=utf-8\r\n` +
        `Path:speech.config\r\n\r\n` +
        JSON.stringify({
          context: {
            synthesis: {
              audio: {
                metadataoptions: {
                  sentenceBoundaryEnabled: 'false',
                  wordBoundaryEnabled: 'false',
                },
                outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
              },
            },
          },
        });
      ws.send(configMsg);

      const ssml =
        `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='pt-BR'>` +
        `<voice name='${voiceName}'>` +
        `<prosody pitch='+0Hz' rate='${formatRate(speakingRate)}' volume='+0%'>` +
        `${escapeXml(text)}` +
        `</prosody></voice></speak>`;

      const ssmlMsg =
        `X-RequestId:${requestId}\r\n` +
        `Content-Type:application/ssml+xml\r\n` +
        `X-Timestamp:${timestamp}Z\r\n` +
        `Path:ssml\r\n\r\n` +
        ssml;
      ws.send(ssmlMsg);
    });

    ws.on('message', (data: Uint8Array | string, isBinary: boolean) => {
      if (!isBinary) {
        const msg = typeof data === 'string' ? data : new TextDecoder().decode(data);
        if (msg.includes('Path:turn.end')) {
          finish();
        }
        return;
      }

      const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
      if (bytes.length < 2) return;
      const headerLen = (bytes[0] << 8) | bytes[1];
      const payloadStart = 2 + headerLen;
      if (payloadStart >= bytes.length) return;

      const headerStr = new TextDecoder().decode(bytes.subarray(2, payloadStart));
      if (headerStr.includes('Path:audio')) {
        audioChunks.push(bytes.subarray(payloadStart));
      }
    });

    ws.on('error', (err: Error) => {
      finish(err instanceof Error ? err : new Error('Erro no WebSocket de TTS.'));
    });

    ws.on('close', () => {
      if (!settled) {
        if (audioChunks.length > 0) finish();
        else finish(new Error('Conexão TTS encerrada sem áudio.'));
      }
    });
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Método não permitido.' }, 405);
  }

  try {
    const { version, bookName, chapter, text } = await req.json();

    if (
      typeof version !== 'string' ||
      !VALID_VERSIONS.has(version) ||
      typeof bookName !== 'string' ||
      !bookName.trim() ||
      typeof chapter !== 'number' ||
      !Number.isInteger(chapter) ||
      chapter < 1 ||
      typeof text !== 'string' ||
      !text.trim()
    ) {
      return jsonResponse({ error: 'Parâmetros inválidos para geração de áudio.' }, 400);
    }

    if (text.length > MAX_TEXT_CHARS) {
      return jsonResponse({ error: 'Capítulo excede o tamanho máximo permitido.' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const voiceName = Deno.env.get('TTS_VOICE') || DEFAULT_VOICE;
    const chromiumVersion = Deno.env.get('EDGE_CHROMIUM_VERSION') || DEFAULT_CHROMIUM_VERSION;
    const speakingRateRaw = Number(Deno.env.get('TTS_SPEAKING_RATE') || '1.0');
    const speakingRate = Number.isFinite(speakingRateRaw) && speakingRateRaw >= 0.5 && speakingRateRaw <= 2.0
      ? speakingRateRaw
      : 1.0;

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: 'Supabase não configurado na Edge Function.' }, 500);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const slug = slugifyBook(bookName);
    const cacheKey = `${voiceName}:${version}:${slug}:${chapter}`;
    const filePath = `${voiceName}/${version}/${slug}-${chapter}.mp3`;
    const ttlDays = getTtlDays();

    // 1. Verifica se já existe no cache dentro da janela de 20 dias
    const { data: existing } = await admin
      .from('bible_audio_cache')
      .select('cache_key, file_path, last_accessed_at')
      .eq('cache_key', cacheKey)
      .maybeSingle();

    if (existing) {
      const ageMs = Date.now() - new Date(existing.last_accessed_at).getTime();
      const maxAgeMs = ttlDays * 24 * 60 * 60 * 1000;

      if (ageMs < maxAgeMs) {
        await admin
          .from('bible_audio_cache')
          .update({ last_accessed_at: new Date().toISOString() })
          .eq('cache_key', cacheKey);

        const { data: publicUrlData } = admin.storage.from(AUDIO_BUCKET).getPublicUrl(existing.file_path);
        return jsonResponse({
          url: publicUrlData.publicUrl,
          cached: true,
          voice: voiceName,
        });
      }
    }

    // 2. Sintetiza o capítulo em blocos usando voz Neural gratuita (pt-BR-AntonioNeural)
    const chunks = splitTextByUtf8Bytes(text.trim());
    const audioBuffers: Uint8Array[] = [];

    for (const chunk of chunks) {
      const mp3Chunk = await synthesizeEdgeTtsChunk(chunk, voiceName, speakingRate, chromiumVersion);
      if (mp3Chunk.length === 0) {
        return jsonResponse({ error: 'Áudio vazio retornado pelo serviço de voz.' }, 502);
      }
      audioBuffers.push(mp3Chunk);
    }

    const fullMp3 = concatUint8Arrays(audioBuffers);

    // 3. Salva no Supabase Storage e registra no índice de cache
    const { error: uploadError } = await admin.storage
      .from(AUDIO_BUCKET)
      .upload(filePath, fullMp3, {
        contentType: 'audio/mpeg',
        upsert: true,
        cacheControl: `${ttlDays * 24 * 60 * 60}`,
      });

    if (uploadError) {
      console.error('Erro ao salvar MP3 no Storage:', uploadError.message);
      return jsonResponse({ error: 'Falha ao salvar áudio em cache.' }, 500);
    }

    const nowIso = new Date().toISOString();
    await admin.from('bible_audio_cache').upsert({
      cache_key: cacheKey,
      version,
      book_name: bookName,
      chapter,
      voice_name: voiceName,
      file_path: filePath,
      char_count: text.length,
      created_at: nowIso,
      last_accessed_at: nowIso,
    });

    purgeExpiredAudioCache(admin, ttlDays, 10).catch((err) =>
      console.warn('Falha na limpeza oportunista:', err)
    );

    const { data: publicUrlData } = admin.storage.from(AUDIO_BUCKET).getPublicUrl(filePath);

    return jsonResponse({
      url: publicUrlData.publicUrl,
      cached: false,
      voice: voiceName,
    });
  } catch (err) {
    console.error('Erro inesperado em bible-tts:', err);
    return jsonResponse({
      error: 'Erro interno ao processar áudio.',
      details: err instanceof Error ? err.message : String(err),
    }, 500);
  }
});
