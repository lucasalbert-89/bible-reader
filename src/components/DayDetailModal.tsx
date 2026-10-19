import React, { useState } from 'react';
import { DayReading } from '../types';
import { X, Share2, Check, CheckCircle2, Bookmark, BookOpen, Quote } from 'lucide-react';

interface DayDetailModalProps {
  reading: DayReading | null;
  planTitle: string;
  isCompleted: boolean;
  onToggleComplete: (day: number) => void;
  onClose: () => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  reading,
  planTitle,
  isCompleted,
  onToggleComplete,
  onClose,
}) => {
  const [copyFeedback, setCopyFeedback] = useState(false);

  if (!reading) return null;

  const handleShare = async () => {
    const textToShare = `📖 *Leitura Bíblica - Dia ${reading.day}*\n\n` +
      reading.segments.map(s => `• ${s.title}: ${s.chapters}`).join('\n') +
      `\n\n"${reading.verse}"\n— ${reading.reference}\n\n` +
      `*Reflexão:* ${reading.reflection}\n\nAcompanhe seu plano em: Bíblia Planos`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Leitura Bíblica - Dia ${reading.day}`,
          text: textToShare,
        });
      } catch (err) {
        copyToClipboard(textToShare);
      }
    } else {
      copyToClipboard(textToShare);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] w-full max-w-lg shadow-2xl transition-all border border-slate-200 dark:border-slate-800 max-h-[92dvh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Indicator */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/70 dark:bg-slate-950/60 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] sm:text-[11px] font-black uppercase text-emerald-600 dark:text-neonOrange tracking-[0.2em]">
                Dia {reading.day}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                {planTitle}
              </span>
            </div>
            <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Leitura de Hoje
            </h4>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-10 h-10 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors flex items-center justify-center active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto overscroll-contain flex-1">
          
          {/* Reading Segments */}
          <div className="space-y-2.5">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              Passagens para ler hoje:
            </span>

            <div className="grid grid-cols-1 gap-2">
              {reading.segments.map((seg, idx) => {
                let badgeClass = "bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800";
                if (seg.category === 'ot') {
                  badgeClass = "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/60";
                } else if (seg.category === 'sapiential') {
                  badgeClass = "bg-amber-50/50 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/60";
                } else if (seg.category === 'nt') {
                  badgeClass = "bg-blue-50/50 dark:bg-blue-950/30 border-blue-200/80 dark:border-blue-800/60";
                }

                return (
                  <div
                    key={idx}
                    className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between hover:border-emerald-300 dark:hover:border-neonGreen/40 transition-all ${badgeClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-emerald-600 dark:text-neonGreen shadow-sm shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                          {seg.title}
                        </span>
                        <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          {seg.chapters}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Featured Verse & Reflection ("A Mensagem") */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest">
                A Mensagem
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-neonGreen hover:opacity-80 active:scale-95 transition-all"
              >
                {copyFeedback ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>COPIADO!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>COMPARTILHAR</span>
                  </>
                )}
              </button>
            </div>

            {/* Verse Card */}
            <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 dark:from-slate-800 dark:to-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-xl dark:border-l-4 dark:border-neonGreen relative overflow-hidden">
              <Quote className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-300 dark:text-neonGreen opacity-30 mb-1" />
              <p className="bible-text text-lg sm:text-2xl italic font-semibold leading-relaxed mb-2.5">
                "{reading.verse}"
              </p>
              <p className="text-right text-xs sm:text-sm font-black text-emerald-200 dark:text-neonOrange uppercase tracking-tight">
                — {reading.reference}
              </p>
            </div>

            {/* Reflection Text */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider block mb-1">
                Reflexão Diária
              </span>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {reading.reflection}
              </p>
            </div>
          </div>

        </div>

        {/* Sticky Action Footer (Always within thumb reach) */}
        <div className="p-3.5 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shrink-0">
          <button
            onClick={() => onToggleComplete(reading.day)}
            className={`w-full py-3.5 sm:py-4 rounded-2xl font-black text-sm sm:text-base transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 ${
              isCompleted
                ? 'bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-neonGreen border border-emerald-200 dark:border-neonGreen/40'
                : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-neonGreen dark:hover:bg-emerald-400 text-white dark:text-black dark:shadow-neon-green hover:scale-[1.01]'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-neonGreen" />
                <span>LEITURA CONCLUÍDA (DESMARCAR)</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>MARCAR COMO CONCLUÍDO</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
