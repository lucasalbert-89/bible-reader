import { useEffect, useRef, useState } from 'react';
import { Volume2, Pause, Play, Square } from 'lucide-react';
import { getChapterData } from '../services/bibleService';
import { BibleVersionId } from '../types';

interface Portion { bookName: string; chapter: number }
interface SpeechPart { text: string; label: string }

export function ReadingAudio({ version, portions, daily }: {
  version: BibleVersionId; portions: Portion[]; daily: boolean;
}) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const [availability, setAvailability] = useState<'loading' | 'ready' | 'missing' | 'unsupported'>(supported ? 'loading' : 'unsupported');
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'paused'>('idle');
  const [message, setMessage] = useState('');
  const voice = useRef<SpeechSynthesisVoice>();
  const generation = useRef(0);
  const utterance = useRef<SpeechSynthesisUtterance>();
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
      voices.sort((a, b) => Number(b.localService) - Number(a.localService) || Number(/^pt[-_]BR$/i.test(b.lang)) - Number(/^pt[-_]BR$/i.test(a.lang)));
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

  useEffect(() => {
    setStatus('idle');
    setMessage('');
    return () => {
      generation.current++;
      paused.current = false;
      if (supported) window.speechSynthesis.cancel();
      utterance.current = undefined;
    };
  }, [version, signature, supported]);

  const stop = () => {
    generation.current++;
    paused.current = false;
    window.speechSynthesis.cancel();
    utterance.current = undefined;
    setStatus('idle');
    setMessage('');
  };

  const speak = (token: number) => {
    if (generation.current !== token || paused.current) return;
    const part = queue.current[cursor.current];
    if (!part) {
      setStatus('idle');
      setMessage(daily ? 'Leitura do dia finalizada.' : 'Leitura do capítulo finalizada.');
      utterance.current = undefined;
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
      speak(token);
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

  const start = async () => {
    if (!voice.current) return;
    stop();
    const token = generation.current;
    setStatus('loading');
    try {
      const chapters = await Promise.all(portions.map(p => getChapterData(version, p.bookName, p.chapter)));
      if (generation.current !== token) return;
      queue.current = chapters.flatMap(chapter => {
        const label = `${chapter.bookName} ${chapter.chapter} • ${version.toUpperCase()}`;
        return [{ text: `${chapter.bookName}, capítulo ${chapter.chapter}.`, label },
          ...chapter.verses.flatMap((text, index) => {
            // Short utterances keep long chapters reliable on mobile engines.
            const chunks = text.match(/.{1,200}(?:\s|$)|\S{1,200}/g) || [text];
            return chunks.map(chunk => ({ text: chunk, label: `${label} • Versículo ${index + 1}` }));
          })];
      });
      cursor.current = 0;
      setStatus('playing');
      speak(token);
    } catch {
      if (generation.current !== token) return;
      setStatus('idle');
      setMessage('Não foi possível carregar a leitura. Tente novamente.');
    }
  };

  const togglePause = () => {
    if (status === 'playing') {
      // Cancel and replay the current short passage: native pause is unreliable on Android.
      paused.current = true;
      generation.current++;
      window.speechSynthesis.cancel();
      setStatus('paused');
    } else {
      paused.current = false;
      setStatus('playing');
      speak(generation.current);
    }
  };

  const hint = availability === 'loading' ? 'Verificando as vozes disponíveis…'
    : availability === 'unsupported' ? 'A leitura em voz não está disponível neste navegador.'
    : availability === 'missing' ? 'Não encontramos uma voz em português. Confira as configurações de voz do aparelho ou tente outro navegador.'
    : 'Grátis • Usa a voz do seu aparelho ou navegador. Ao continuar, o trecho atual pode ser repetido.';
  const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold bg-reformedGold-600 text-white hover:bg-reformedGold-700 disabled:opacity-50 disabled:cursor-not-allowed';
  return (
    <section aria-label="Leitura em voz" className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        {status === 'idle' || status === 'loading' ? (
          <button className={buttonClass} disabled={availability !== 'ready' || status === 'loading'} onClick={start}>
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
