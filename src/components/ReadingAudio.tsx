import { useEffect, useRef, useState } from 'react';
import { Volume2, Pause, Play, Square } from 'lucide-react';
import { getChapterData } from '../services/bibleService';
import { BibleVersionId } from '../types';

interface Portion { bookName: string; chapter: number }
interface SpeechPart { text: string; label: string }
interface ChapterPayload {
  bookName: string;
  chapter: number;
  slug: string;
  label: string;
  verses: string[];
}

const HF_AUDIO_BASE =
  import.meta.env.VITE_BIBLE_AUDIO_BASE_URL ||
  'https://huggingface.co/datasets/lucasalbert89/bible-audio/resolve/main';

const MALE_VOICE_HINT = /\b(daniel|antonio|antônio|ricardo|felipe|tiago|paulo|rodrigo|lucas|male|homem|masculin[ao])\b/i;

function slugifyBook(bookName: string): string {
  return bookName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ReadingAudio({ version, portions, daily }: {
  version: BibleVersionId; portions: Portion[]; daily: boolean;
}) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const [availability, setAvailability] = useState<'loading' | 'ready' | 'missing' | 'unsupported'>(supported ? 'loading' : 'unsupported');
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'paused'>('idle');
  const [engine, setEngine] = useState<'recorded' | 'browser'>('recorded');
  const [message, setMessage] = useState('');

  const voice = useRef<SpeechSynthesisVoice>();
  const generation = useRef(0);
  const utterance = useRef<SpeechSynthesisUtterance>();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queue = useRef<SpeechPart[]>([]);
  const cursor = useRef(0);
  const paused = useRef(false);
  const signature = JSON.stringify(portions);

  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    let waited = false;
    const check = () => {
      const voices = synth.getVoices().filter(v => /^pt(?:[-_]|$)/i.test(v.lang));
      voices.sort((a, b) =>
        Number(MALE_VOICE_HINT.test(b.name)) - Number(MALE_VOICE_HINT.test(a.name)) ||
        Number(b.localService) - Number(a.localService) ||
        Number(/^pt[-_]BR$/i.test(b.lang)) - Number(/^pt[-_]BR$/i.test(a.lang))
      );
      voice.current = voices[0];
      setAvailability(voices.length ? 'ready' : waited ? 'missing' : 'loading');
    };
    check();
    const timer = window.setTimeout(() => { waited = true; check(); }, 3000);
    synth.addEventListener('voiceschanged', check);
    window.addEventListener('focus', check);
    return () => {
      clearTimeout(timer);
      synth.removeEventListener('voiceschanged', check);
      window.removeEventListener('focus', check);
    };
  }, [supported]);

  const stopAudioElement = () => {
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
  };

  useEffect(() => {
    setStatus('idle');
    setMessage('');
    return () => {
      generation.current++;
      paused.current = false;
      stopAudioElement();
      if (supported) window.speechSynthesis.cancel();
      utterance.current = undefined;
    };
  }, [version, signature, supported]);

  const stop = () => {
    generation.current++;
    paused.current = false;
    stopAudioElement();
    if (supported) window.speechSynthesis.cancel();
    utterance.current = undefined;
    setStatus('idle');
    setMessage('');
  };

  const speakBrowser = (token: number, onAllDone?: () => void) => {
    if (generation.current !== token || paused.current) return;
    const part = queue.current[cursor.current];
    if (!part) {
      utterance.current = undefined;
      if (onAllDone) {
        onAllDone();
      } else {
        setStatus('idle');
        setMessage(daily ? 'Leitura do dia finalizada.' : 'Leitura do capítulo finalizada.');
      }
      return;
    }
    const item = new SpeechSynthesisUtterance(part.text);
    item.voice = voice.current || null;
    item.lang = voice.current?.lang || 'pt-BR';
    utterance.current = item;
    setMessage(part.label);
    item.onend = () => {
      if (generation.current !== token) return;
      cursor.current++;
      speakBrowser(token, onAllDone);
    };
    item.onerror = () => {
      if (generation.current !== token) return;
      generation.current++;
      window.speechSynthesis.cancel();
      setStatus('idle');
      setMessage('Não foi possível reproduzir a voz. Tente novamente ou use outro navegador.');
    };
    try { window.speechSynthesis.speak(item); } catch { item.onerror?.(new Event('error') as SpeechSynthesisErrorEvent); }
  };

  const playChapterFallbackBrowser = (chapters: ChapterPayload[], index: number, token: number) => {
    const ch = chapters[index];
    if (!ch || !supported || !voice.current) {
      setStatus('idle');
      setMessage('Áudio deste capítulo ainda não disponível.');
      return;
    }
    setEngine('browser');
    queue.current = [
      { text: `${ch.bookName}, capítulo ${ch.chapter}.`, label: ch.label },
      ...ch.verses.flatMap((text, vIdx) => {
        const chunks = text.match(/.{1,200}(?:\s|$)|\S{1,200}/g) || [text];
        return chunks.map(chunk => ({ text: chunk, label: `${ch.label} • Versículo ${vIdx + 1}` }));
      }),
    ];
    cursor.current = 0;
    setStatus('playing');
    speakBrowser(token, () => {
      playChapterAt(chapters, index + 1, token);
    });
  };

  const playChapterAt = (chapters: ChapterPayload[], index: number, token: number) => {
    if (generation.current !== token || paused.current) return;
    const current = chapters[index];
    if (!current) {
      setStatus('idle');
      setMessage(daily ? 'Leitura do dia finalizada.' : 'Leitura do capítulo finalizada.');
      return;
    }

    setStatus('loading');
    setMessage(`Carregando áudio • ${current.label}`);

    const mp3Url = `${HF_AUDIO_BASE}/${version}/${current.slug}-${current.chapter}.mp3`;
    const audio = new Audio(mp3Url);
    audioRef.current = audio;

    audio.onended = () => {
      if (generation.current !== token) return;
      stopAudioElement();
      playChapterAt(chapters, index + 1, token);
    };

    audio.onerror = () => {
      if (generation.current !== token) return;
      stopAudioElement();
      // Se o MP3 ainda não foi gerado no Hugging Face, usa a voz do navegador neste capítulo
      playChapterFallbackBrowser(chapters, index, token);
    };

    audio.play().then(() => {
      if (generation.current !== token) {
        stopAudioElement();
        return;
      }
      setEngine('recorded');
      setStatus('playing');
      setMessage(`${current.label} • Voz Narrada`);
    }).catch(() => {
      if (generation.current !== token) return;
      stopAudioElement();
      playChapterFallbackBrowser(chapters, index, token);
    });
  };

  const start = async () => {
    stop();
    const token = generation.current;
    setStatus('loading');
    try {
      const loaded = await Promise.all(portions.map(p => getChapterData(version, p.bookName, p.chapter)));
      if (generation.current !== token) return;

      const chapters: ChapterPayload[] = loaded.map(ch => ({
        bookName: ch.bookName,
        chapter: ch.chapter,
        slug: slugifyBook(ch.bookName),
        label: `${ch.bookName} ${ch.chapter} • ${version.toUpperCase()}`,
        verses: ch.verses,
      }));

      playChapterAt(chapters, 0, token);
    } catch {
      if (generation.current !== token) return;
      setStatus('idle');
      setMessage('Não foi possível carregar a leitura. Tente novamente.');
    }
  };

  const togglePause = () => {
    if (engine === 'recorded' && audioRef.current) {
      if (status === 'playing') {
        paused.current = true;
        audioRef.current.pause();
        setStatus('paused');
      } else {
        paused.current = false;
        audioRef.current.play().then(() => setStatus('playing')).catch(() => {
          setStatus('idle');
          setMessage('Não foi possível retomar o áudio.');
        });
      }
      return;
    }

    if (status === 'playing') {
      paused.current = true;
      generation.current++;
      window.speechSynthesis.cancel();
      setStatus('paused');
    } else {
      paused.current = false;
      setStatus('playing');
      speakBrowser(generation.current);
    }
  };

  const hint = engine === 'recorded'
    ? 'Narração padronizada em alta qualidade (com fallback automático para a voz do navegador nos capítulos em geração).'
    : availability === 'loading' ? 'Verificando as vozes disponíveis…'
    : availability === 'unsupported' ? 'A leitura em voz não está disponível neste navegador.'
    : availability === 'missing' ? 'Não encontramos uma voz em português. Confira as configurações de voz do aparelho ou tente outro navegador.'
    : 'Grátis • Usa a voz do seu aparelho ou navegador para capítulos ainda em geração.';
  const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold bg-reformedGold-600 text-white hover:bg-reformedGold-700 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <section aria-label="Leitura em voz" className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        {status === 'idle' || status === 'loading' ? (
          <button className={buttonClass} disabled={status === 'loading'} onClick={start}>
            <Volume2 className="w-4 h-4" />{status === 'loading' ? 'Preparando leitura…' : daily ? 'Ouvir leitura do dia' : 'Ouvir capítulo'}
          </button>
        ) : (
          <button className={buttonClass} onClick={togglePause}>
            {status === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {status === 'paused' ? 'Continuar' : 'Pausar'}
          </button>
        )}
        {status !== 'idle' && <button className={buttonClass} onClick={stop}><Square className="w-4 h-4" />Parar</button>}
        <span role="status" className="text-xs text-reformedGold-700 dark:text-reformedGold-300">{status === 'paused' ? 'Pausado • ' : ''}{message}</span>
      </div>
      <p role="status" className="text-[11px] text-slate-600 dark:text-slate-400">{hint}</p>
    </section>
  );
}
