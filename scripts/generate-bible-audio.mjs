import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

const API_BASE = process.env.VOICESTUDIO_URL || 'http://127.0.0.1:3900';
const DASHBOARD_PORT = Number(process.env.AUDIO_DASHBOARD_PORT || 3950);
const DEFAULT_VOICE = '66be4cf8'; // Perfil "Lucas"
const MAX_CHUNK_CHARS = 650; // Tamanho de Salmos 23 (~2 min por bloco, nunca estoura os 641s)
const MAX_RETRIES_PER_CHUNK = 3;

function parseArgs(argv) {
  const args = {
    version: 'naa',
    book: '',
    chapter: 0,
    limit: 0,
    voice: DEFAULT_VOICE,
    speed: 1.0,
    out: 'generated-audio',
    panelOnly: false,
    once: false,
  };

  for (const raw of argv) {
    if (!raw.startsWith('--')) continue;
    const [k, v = ''] = raw.slice(2).split('=');
    if (k === 'version') args.version = v.toLowerCase();
    else if (k === 'book') args.book = v;
    else if (k === 'chapter') args.chapter = Number(v) || 0;
    else if (k === 'limit') args.limit = Number(v) || 0;
    else if (k === 'voice') args.voice = v;
    else if (k === 'speed') args.speed = Number(v) || 1.0;
    else if (k === 'out') args.out = v;
    else if (k === 'panel') args.panelOnly = true;
    else if (k === 'once') args.once = true;
  }
  return args;
}

function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function slugifyBook(bookName) {
  return normalize(bookName)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function splitChapterIntoChunks(header, verses, maxChars = MAX_CHUNK_CHARS) {
  const chunks = [];
  let current = header;

  for (const verse of verses) {
    const clean = verse.trim();
    if (!clean) continue;

    if (`${current} ${clean}`.length > maxChars) {
      if (current) chunks.push(current);
      if (clean.length > maxChars) {
        // Quebra versículos muito longos por pontuação (; : . ,) antes de recorrer a corte por espaço
        const clauses = clean.split(/(?<=[.;:,])\s+/);
        let sub = '';
        for (const clause of clauses) {
          if (`${sub} ${clause}`.trim().length > maxChars) {
            if (sub) chunks.push(sub);
            sub = clause;
          } else {
            sub = sub ? `${sub} ${clause}` : clause;
          }
        }
        current = sub;
      } else {
        current = clean;
      }
    } else {
      current = current ? `${current} ${clean}` : clean;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

function synthesizeChunk(text, { voice, speed }) {
  return new Promise((resolve, reject) => {
    const target = new URL(`${API_BASE}/v1/audio/speech`);
    const payload = JSON.stringify({
      model: 'omnivoice',
      input: text,
      voice,
      language: 'pt',
      response_format: 'mp3',
      speed,
    });

    const req = http.request(
      {
        hostname: target.hostname,
        port: target.port || 80,
        path: target.pathname,
        method: 'POST',
        timeout: 0,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (d) => chunks.push(d));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(buf);
          } else {
            reject(new Error(`VoiceStudio HTTP ${res.statusCode}: ${buf.toString('utf8')}`));
          }
        });
      }
    );

    req.setTimeout(0);
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function flushGpuModel() {
  try {
    await fetch(`${API_BASE}/model/unload/tts`, { method: 'POST' });
  } catch {
    // ignore
  }
}

async function synthesizeChunkWithRetry(text, args, label) {
  for (let attempt = 1; attempt <= MAX_RETRIES_PER_CHUNK; attempt++) {
    try {
      return await synthesizeChunk(text, args);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`Aviso em ${label} (tentativa ${attempt}/${MAX_RETRIES_PER_CHUNK}): ${msg.slice(0, 120)}`);
      if (attempt === MAX_RETRIES_PER_CHUNK) {
        throw err;
      }
      // Aguarda eventual job preso terminar, limpa VRAM da GPU e tenta novamente
      const waitSec = msg.includes('503') ? 45 : 10;
      addLog(`Limpando VRAM da GPU e aguardando ${waitSec}s antes de tentar o bloco novamente...`);
      await new Promise((r) => setTimeout(r, waitSec * 1000));
      await flushGpuModel();
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

// Estado global para o painel visual
const liveState = {
  status: 'idle', // 'idle' | 'running' | 'stopping' | 'done' | 'error'
  stopRequested: false,
  version: 'naa',
  filterBook: '',
  filterChapter: 0,
  limit: 0,
  currentBook: '',
  currentChapter: 0,
  currentChunk: 0,
  totalChunksInChapter: 0,
  chapterStartedAt: null,
  sessionStartedAt: null,
  sessionGenerated: 0,
  recentDurationsSec: [],
  recentLogs: [],
  lastError: '',
};

function addLog(msg) {
  const time = new Date().toLocaleTimeString('pt-BR');
  liveState.recentLogs.unshift(`[${time}] ${msg}`);
  if (liveState.recentLogs.length > 30) liveState.recentLogs.pop();
}

const bibleStructureCache = {};
function getBibleBooks(version) {
  if (!bibleStructureCache[version]) {
    const p = path.resolve('public', 'bibles', `${version}.json`);
    bibleStructureCache[version] = JSON.parse(fs.readFileSync(p, 'utf8'));
  }
  return bibleStructureCache[version];
}

function scanProgress(outRoot, version) {
  const books = getBibleBooks(version);
  const verDir = path.resolve(outRoot, version);
  const existingFiles = new Map();

  if (fs.existsSync(verDir)) {
    for (const file of fs.readdirSync(verDir)) {
      if (!file.endsWith('.mp3')) continue;
      const full = path.join(verDir, file);
      const stat = fs.statSync(full);
      if (stat.size > 0) {
        existingFiles.set(file, { size: stat.size, mtimeMs: stat.mtimeMs });
      }
    }
  }

  let totalChapters = 0;
  let completedChapters = 0;
  let totalBytes = 0;

  const bookStats = books.map((b) => {
    const slug = slugifyBook(b.name);
    const total = b.chapters.length;
    let done = 0;
    const chaptersDone = [];

    for (let c = 1; c <= total; c++) {
      const fname = `${slug}-${c}.mp3`;
      const info = existingFiles.get(fname);
      if (info) {
        done++;
        totalBytes += info.size;
        chaptersDone.push(c);
      }
    }

    totalChapters += total;
    completedChapters += done;

    return {
      name: b.name,
      slug,
      total,
      done,
      chaptersDone,
    };
  });

  const avgSec =
    liveState.recentDurationsSec.length > 0
      ? liveState.recentDurationsSec.reduce((a, b) => a + b, 0) / liveState.recentDurationsSec.length
      : 150;

  const remainingChapters = Math.max(0, totalChapters - completedChapters);

  return {
    version,
    totalChapters,
    completedChapters,
    remainingChapters,
    percent: totalChapters ? Number(((completedChapters / totalChapters) * 100).toFixed(2)) : 0,
    totalSizeMB: Number((totalBytes / (1024 * 1024)).toFixed(2)),
    avgSecondsPerChapter: Math.round(avgSec),
    etaHoursTotal: Number(((remainingChapters * avgSec) / 3600).toFixed(1)),
    live: {
      ...liveState,
      chapterElapsedSec: liveState.chapterStartedAt
        ? Math.round((Date.now() - liveState.chapterStartedAt) / 1000)
        : 0,
    },
    books: bookStats,
  };
}

async function runGenerationJob(args) {
  if (liveState.status === 'running') return;

  liveState.status = 'running';
  liveState.stopRequested = false;
  liveState.version = args.version;
  liveState.filterBook = args.book || '';
  liveState.filterChapter = args.chapter || 0;
  liveState.limit = args.limit || 0;
  liveState.sessionStartedAt = Date.now();
  liveState.sessionGenerated = 0;
  liveState.lastError = '';

  try {
    const health = await fetch(`${API_BASE}/health`).catch(() => null);
    if (!health || !health.ok) {
      throw new Error(`VoiceStudio não respondeu em ${API_BASE}. Verifique se ele está aberto.`);
    }

    const books = getBibleBooks(args.version);
    const outDir = path.resolve(args.out, args.version);
    fs.mkdirSync(outDir, { recursive: true });

    const targetBookNorm = args.book ? normalize(args.book) : '';
    let generated = 0;
    let skipped = 0;

    addLog(`Iniciando geração (${args.version.toUpperCase()})${args.book ? ` • Livro: ${args.book}` : ''}${args.limit ? ` • Limite: ${args.limit}` : ''}`);

    for (const book of books) {
      if (targetBookNorm && normalize(book.name) !== targetBookNorm) {
        continue;
      }

      const slug = slugifyBook(book.name);

      for (let i = 0; i < book.chapters.length; i++) {
        if (liveState.stopRequested) {
          addLog('Pausa solicitada pelo usuário. Geração interrompida com segurança.');
          liveState.status = 'idle';
          liveState.currentBook = '';
          liveState.currentChapter = 0;
          liveState.chapterStartedAt = null;
          return;
        }

        const chapterNum = i + 1;
        if (args.chapter && chapterNum !== args.chapter) continue;

        const outFile = path.join(outDir, `${slug}-${chapterNum}.mp3`);
        if (fs.existsSync(outFile) && fs.statSync(outFile).size > 0) {
          skipped++;
          continue;
        }

        const verses = book.chapters[i];
        const header = `${book.name}, capítulo ${chapterNum}.`;
        const chunks = splitChapterIntoChunks(header, verses);

        liveState.currentBook = book.name;
        liveState.currentChapter = chapterNum;
        liveState.totalChunksInChapter = chunks.length;
        liveState.currentChunk = 1;
        liveState.chapterStartedAt = Date.now();

        const t0 = Date.now();
        process.stdout.write(`Gerando ${args.version.toUpperCase()} • ${book.name} ${chapterNum} (${chunks.length} bloco${chunks.length > 1 ? 's' : ''})... `);

        const chunksCacheDir = path.join(outDir, '.chunks', `${slug}-${chapterNum}`);
        fs.mkdirSync(chunksCacheDir, { recursive: true });

        const buffers = [];
        for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
          if (liveState.stopRequested) {
            addLog('Pausa solicitada pelo usuário. Os blocos já gerados deste capítulo foram salvos.');
            liveState.status = 'idle';
            liveState.currentBook = '';
            liveState.currentChapter = 0;
            liveState.chapterStartedAt = null;
            return;
          }
          liveState.currentChunk = cIdx + 1;
          const partFile = path.join(chunksCacheDir, `part-${cIdx + 1}.mp3`);

          if (fs.existsSync(partFile) && fs.statSync(partFile).size > 0) {
            buffers.push(fs.readFileSync(partFile));
            continue;
          }

          const partBuf = await synthesizeChunkWithRetry(
            chunks[cIdx],
            args,
            `${book.name} ${chapterNum} [${cIdx + 1}/${chunks.length}]`
          );
          fs.writeFileSync(partFile, partBuf);
          buffers.push(partBuf);

          // Pequena pausa entre blocos para liberar VRAM da GPU
          if (cIdx + 1 < chunks.length) {
            await new Promise((r) => setTimeout(r, 1500));
          }
        }

        const finalMp3 = Buffer.concat(buffers);
        fs.writeFileSync(outFile, finalMp3);
        fs.rmSync(chunksCacheDir, { recursive: true, force: true });

        const secsNum = (Date.now() - t0) / 1000;
        const secs = secsNum.toFixed(1);
        const kb = (finalMp3.length / 1024).toFixed(0);
        console.log(`OK (${kb} KB em ${secs}s) -> ${path.relative(process.cwd(), outFile)}`);

        liveState.recentDurationsSec.push(secsNum);
        if (liveState.recentDurationsSec.length > 20) liveState.recentDurationsSec.shift();

        generated++;
        liveState.sessionGenerated = generated;
        addLog(`Concluído: ${book.name} ${chapterNum} (${args.version.toUpperCase()}) • ${kb} KB em ${secs}s`);

        if (args.limit && generated >= args.limit) {
          addLog(`Limite de ${args.limit} capítulo(s) atingido.`);
          liveState.status = 'done';
          liveState.currentBook = '';
          liveState.currentChapter = 0;
          liveState.chapterStartedAt = null;
          return;
        }
      }
    }

    addLog(`Finalizado! Gerados nesta sessão: ${generated}, pulados: ${skipped}.`);
    liveState.status = 'done';
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('\nErro durante a geração:', msg);
    liveState.lastError = msg;
    liveState.status = 'error';
    addLog(`ERRO: ${msg}`);
  } finally {
    liveState.currentBook = '';
    liveState.currentChapter = 0;
    liveState.chapterStartedAt = null;
  }
}

function renderDashboardHtml() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Painel de Geração de Áudio Bíblico</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen font-sans">
  <div class="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
    <!-- Cabeçalho -->
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-amber-400">Painel de Geração de Áudio Bíblico</h1>
        <p class="text-xs sm:text-sm text-slate-400">Acompanhamento em tempo real • VoiceStudio Local (Biblia Masculino)</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <select id="voiceSelect" class="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold">
          <option value="66be4cf8" selected>Voz: Lucas (Clonada)</option>
          <option value="c06e2c8d">Voz: Biblia Masculino</option>
        </select>
        <select id="versionSelect" class="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold">
          <option value="naa" selected>Versão: NAA</option>
          <option value="nvi">Versão: NVI</option>
          <option value="acf">Versão: ACF</option>
        </select>
        <input id="bookInput" type="text" placeholder="Livro (vazio = todos)" class="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm w-40" />
        <input id="limitInput" type="number" min="0" placeholder="Limite (0 = tudo)" class="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm w-36" />
        <button id="startBtn" onclick="startJob()" class="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm transition">
          Iniciar / Continuar
        </button>
        <button id="stopBtn" onclick="stopJob()" class="hidden bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition">
          Pausar após atual
        </button>
      </div>
    </header>

    <!-- Status Atual ao Vivo -->
    <section id="liveCard" class="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span id="statusBadge" class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-slate-800 text-slate-300">Aguardando</span>
            <span id="currentTask" class="text-base sm:text-lg font-bold text-white">Nenhuma geração em andamento</span>
          </div>
          <p id="currentSub" class="text-xs text-slate-400">Os arquivos já gerados são pulados automaticamente.</p>
        </div>
        <div class="text-right">
          <div id="elapsedTimer" class="text-2xl font-mono font-bold text-amber-400">00:00</div>
          <div class="text-[11px] text-slate-400">Tempo no capítulo atual</div>
        </div>
      </div>
    </section>

    <!-- Métricas Gerais -->
    <section class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div class="text-xs text-slate-400">Capítulos Prontos</div>
        <div id="metricChapters" class="text-2xl font-bold text-white mt-1">0 / 1189</div>
        <div id="metricPercent" class="text-xs text-amber-400 mt-1">0% concluído</div>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div class="text-xs text-slate-400">Faltam Gerar</div>
        <div id="metricRemaining" class="text-2xl font-bold text-white mt-1">1189</div>
        <div id="metricSession" class="text-xs text-emerald-400 mt-1">0 gerados nesta sessão</div>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div class="text-xs text-slate-400">Espaço em Disco</div>
        <div id="metricSize" class="text-2xl font-bold text-white mt-1">0 MB</div>
        <div class="text-xs text-slate-400 mt-1">Pasta generated-audio/</div>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div class="text-xs text-slate-400">Média / Estimativa</div>
        <div id="metricAvg" class="text-2xl font-bold text-white mt-1">~150s / cap</div>
        <div id="metricEta" class="text-xs text-slate-400 mt-1">Restante: -- h</div>
      </div>
    </section>

    <!-- Barra de Progresso Geral -->
    <section class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
      <div class="flex justify-between text-xs font-semibold">
        <span>Progresso Total da Versão</span>
        <span id="barPercentText">0%</span>
      </div>
      <div class="w-full h-4 bg-slate-800 rounded-full overflow-hidden">
        <div id="barFill" class="h-full bg-amber-500 transition-all duration-500" style="width: 0%"></div>
      </div>
    </section>

    <!-- Player de Teste Rápido -->
    <section id="playerSection" class="hidden bg-slate-900 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="text-sm font-semibold text-amber-300" id="playerLabel">Ouvindo capítulo</div>
      <audio id="audioPlayer" controls class="w-full sm:w-96 h-10"></audio>
    </section>

    <!-- Grade dos 66 Livros -->
    <section class="space-y-3">
      <h2 class="text-sm font-bold uppercase tracking-wider text-slate-400">Progresso por Livro (clique em um capítulo verde para ouvir)</h2>
      <div id="booksGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"></div>
    </section>

    <!-- Log Recente -->
    <section class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
      <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400">Histórico Recente</h2>
      <pre id="logsBox" class="text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-xl max-h-48 overflow-y-auto">Sem registros ainda.</pre>
    </section>
  </div>

  <script>
    let selectedVersion = 'naa';
    const versionSelect = document.getElementById('versionSelect');
    versionSelect.addEventListener('change', () => {
      selectedVersion = versionSelect.value;
      fetchStatus();
    });

    function fmtTime(sec) {
      const m = String(Math.floor(sec / 60)).padStart(2, '0');
      const s = String(sec % 60).padStart(2, '0');
      return m + ':' + s;
    }

    function playChapter(version, slug, chapter, bookName) {
      const sec = document.getElementById('playerSection');
      const player = document.getElementById('audioPlayer');
      const label = document.getElementById('playerLabel');
      sec.classList.remove('hidden');
      label.textContent = bookName + ' ' + chapter + ' (' + version.toUpperCase() + ')';
      player.src = '/audio/' + version + '/' + slug + '-' + chapter + '.mp3?t=' + Date.now();
      player.play();
    }

    async function startJob() {
      const voice = document.getElementById('voiceSelect').value;
      const version = versionSelect.value;
      const book = document.getElementById('bookInput').value.trim();
      const limit = Number(document.getElementById('limitInput').value || 0);
      await fetch('/api/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice, version, book, limit })
      });
      fetchStatus();
    }

    async function stopJob() {
      await fetch('/api/stop', { method: 'POST' });
      fetchStatus();
    }

    async function fetchStatus() {
      try {
        const res = await fetch('/api/status?version=' + encodeURIComponent(selectedVersion));
        const data = await res.json();

        document.getElementById('metricChapters').textContent = data.completedChapters + ' / ' + data.totalChapters;
        document.getElementById('metricPercent').textContent = data.percent + '% concluído';
        document.getElementById('metricRemaining').textContent = data.remainingChapters;
        document.getElementById('metricSession').textContent = data.live.sessionGenerated + ' gerados nesta sessão';
        document.getElementById('metricSize').textContent = data.totalSizeMB + ' MB';
        document.getElementById('metricAvg').textContent = '~' + data.avgSecondsPerChapter + 's / cap';
        document.getElementById('metricEta').textContent = 'Restante total: ~' + data.etaHoursTotal + ' h';

        document.getElementById('barPercentText').textContent = data.percent + '%';
        document.getElementById('barFill').style.width = data.percent + '%';

        const badge = document.getElementById('statusBadge');
        const task = document.getElementById('currentTask');
        const sub = document.getElementById('currentSub');
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');

        if (data.live.status === 'running') {
          badge.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
          badge.textContent = data.live.stopRequested ? 'Pausando...' : 'Gerando ao vivo';
          task.textContent = data.live.currentBook
            ? (data.live.version.toUpperCase() + ' • ' + data.live.currentBook + ' ' + data.live.currentChapter + ' (Bloco ' + data.live.currentChunk + '/' + data.live.totalChunksInChapter + ')')
            : 'Preparando próximo capítulo...';
          sub.textContent = data.live.stopRequested
            ? 'Vai pausar assim que terminar o capítulo atual.'
            : 'Gerando no VoiceStudio local (GTX 1660 SUPER)...';
          document.getElementById('elapsedTimer').textContent = fmtTime(data.live.chapterElapsedSec || 0);
          startBtn.classList.add('hidden');
          stopBtn.classList.remove('hidden');
        } else {
          badge.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-slate-800 text-slate-300';
          badge.textContent = data.live.status === 'done' ? 'Concluído' : data.live.status === 'error' ? 'Erro' : 'Parado';
          task.textContent = data.live.lastError ? ('Erro: ' + data.live.lastError) : 'Nenhuma geração em andamento';
          sub.textContent = 'Clique em "Iniciar / Continuar" no topo para gerar os próximos capítulos.';
          document.getElementById('elapsedTimer').textContent = '00:00';
          startBtn.classList.remove('hidden');
          stopBtn.classList.add('hidden');
        }

        const logsBox = document.getElementById('logsBox');
        if (data.live.recentLogs && data.live.recentLogs.length > 0) {
          logsBox.textContent = data.live.recentLogs.join('\\n');
        }

        const grid = document.getElementById('booksGrid');
        grid.innerHTML = data.books.map(b => {
          const pct = b.total ? Math.round((b.done / b.total) * 100) : 0;
          const isCurrentBook = data.live.status === 'running' && data.live.currentBook === b.name && data.live.version === selectedVersion;
          const borderClass = isCurrentBook ? 'border-amber-400 ring-1 ring-amber-400/50' : b.done === b.total ? 'border-emerald-600/50' : 'border-slate-800';
          const doneSet = new Set(b.chaptersDone);

          let pills = '';
          for (let c = 1; c <= b.total; c++) {
            const isDone = doneSet.has(c);
            const isNow = isCurrentBook && data.live.currentChapter === c;
            if (isDone) {
              pills += '<button onclick="playChapter(\\'' + selectedVersion + '\\',\\'' + b.slug + '\\',' + c + ',\\'' + b.name.replace(/'/g, "\\\\'") + '\\')" title="Ouvir ' + b.name + ' ' + c + '" class="w-6 h-6 rounded text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white">' + c + '</button>';
            } else if (isNow) {
              pills += '<span class="w-6 h-6 rounded text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse inline-flex items-center justify-center">' + c + '</span>';
            } else {
              pills += '<span class="w-6 h-6 rounded text-[10px] bg-slate-800/70 text-slate-500 inline-flex items-center justify-center">' + c + '</span>';
            }
          }

          return '<div class="bg-slate-900 border ' + borderClass + ' rounded-xl p-3 space-y-2">' +
            '<div class="flex justify-between items-center text-xs font-bold">' +
              '<span class="text-slate-100">' + b.name + '</span>' +
              '<span class="' + (b.done === b.total ? 'text-emerald-400' : 'text-slate-400') + '">' + b.done + '/' + b.total + ' (' + pct + '%)</span>' +
            '</div>' +
            '<div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">' +
              '<div class="h-full ' + (b.done === b.total ? 'bg-emerald-500' : 'bg-amber-500') + '" style="width:' + pct + '%"></div>' +
            '</div>' +
            '<div class="flex flex-wrap gap-1 pt-1 max-h-24 overflow-y-auto">' + pills + '</div>' +
          '</div>';
        }).join('');
      } catch (e) {
        console.error(e);
      }
    }

    fetchStatus();
    setInterval(fetchStatus, 2000);
  </script>
</body>
</html>`;
}

function getLocalLanIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

function startDashboardServer(baseArgs) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://localhost:${DASHBOARD_PORT}`);

    if (req.method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderDashboardHtml());
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/status') {
      const version = (url.searchParams.get('version') || liveState.version || 'nvi').toLowerCase();
      const stats = scanProgress(baseArgs.out, version);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(stats));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/start') {
      let body = '';
      req.on('data', (d) => (body += d));
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          const jobArgs = {
            ...baseArgs,
            voice: parsed.voice || baseArgs.voice || DEFAULT_VOICE,
            version: (parsed.version || baseArgs.version || 'naa').toLowerCase(),
            book: parsed.book || '',
            chapter: Number(parsed.chapter || 0),
            limit: Number(parsed.limit || 0),
          };
          runGenerationJob(jobArgs);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: String(err) }));
        }
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/stop') {
      liveState.stopRequested = true;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    if (req.method === 'GET' && url.pathname.startsWith('/audio/')) {
      const rel = url.pathname.slice('/audio/'.length).replace(/\.\./g, '');
      const filePath = path.resolve(baseArgs.out, rel);
      if (fs.existsSync(filePath) && filePath.endsWith('.mp3')) {
        const stat = fs.statSync(filePath);
        res.writeHead(200, {
          'Content-Type': 'audio/mpeg',
          'Content-Length': stat.size,
        });
        fs.createReadStream(filePath).pipe(res);
        return;
      }
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  });

  server.listen(DASHBOARD_PORT, '0.0.0.0', () => {
    const lanIp = getLocalLanIp();
    console.log(`\n=============================================================`);
    console.log(`📊 Painel Visual de Progresso ativo!`);
    console.log(`👉 No computador: http://localhost:${DASHBOARD_PORT}`);
    if (lanIp) {
      console.log(`📱 No celular (mesmo Wi-Fi): http://${lanIp}:${DASHBOARD_PORT}`);
    }
    console.log(`=============================================================\n`);
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  liveState.version = args.version;

  if (!args.once) {
    startDashboardServer(args);
  }

  if (!args.panelOnly) {
    await runGenerationJob(args);
  }
}

main().catch((err) => {
  console.error('\nErro fatal:', err);
  process.exit(1);
});
