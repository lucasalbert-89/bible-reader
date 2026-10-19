import React, { useState } from 'react';
import { DayReading } from '../types';
import { X, Share2, Check, CheckCircle2, Bookmark, BookOpen, Quote, ShieldCheck } from 'lucide-react';

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
    const solaText = reading.sola ? `\n🏷️ ${reading.sola}\n` : '';
    const citeText = reading.authorOrCatechism ? `\n📜 ${reading.authorOrCatechism}\n` : '';

    const textToShare = `📖 *Leitura Bíblica Reformada - Dia ${reading.day}*\n\n` +
      reading.segments.map(s => `• ${s.title}: ${s.chapters}`).join('\n') +
      `\n\n"${reading.verse}"\n— ${reading.reference}\n` +
      solaText +
      `\n*Meditação:* ${reading.reflection}\n` +
      citeText +
      `\nSoli Deo Gloria • Bíblia Planos`;

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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-parchment-50 dark:bg-reformedNavy-900 rounded-t-[32px] sm:rounded-[32px] w-full max-w-lg shadow-2xl transition-all border border-reformedGold-300/60 dark:border-reformedGold-600/30 max-h-[92dvh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Indicator */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-reformedNavy-700 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-reformedGold-200/60 dark:border-reformedNavy-800 flex justify-between items-center bg-white/60 dark:bg-reformedNavy-950/80 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] sm:text-[11px] font-black uppercase text-reformedGold-600 dark:text-reformedGold-400 tracking-[0.2em]">
                Dia {reading.day}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-[11px] sm:text-xs font-serif italic text-slate-500 dark:text-slate-400">
                {planTitle}
              </span>
              {reading.sola && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-reformedGold-100 dark:bg-reformedNavy-800 text-reformedGold-800 dark:text-reformedGold-300 border border-reformedGold-300/50">
                  {reading.sola}
                </span>
              )}
            </div>
            <h4 className="display-title text-xl sm:text-2xl font-bold text-slate-900 dark:text-reformedGold-100 tracking-tight">
              A Porção da Aliança
            </h4>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-10 h-10 rounded-xl hover:bg-slate-200/60 dark:hover:bg-reformedNavy-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors flex items-center justify-center active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto overscroll-contain flex-1">
          
          {/* Reading Segments */}
          <div className="space-y-2.5">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block font-sans">
              Leitura das Sagradas Escrituras:
            </span>

            <div className="grid grid-cols-1 gap-2">
              {reading.segments.map((seg, idx) => {
                let badgeClass = "bg-white dark:bg-reformedNavy-800/80 border-slate-200/80 dark:border-reformedNavy-700";
                if (seg.category === 'ot') {
                  badgeClass = "bg-reformedGold-50/70 dark:bg-reformedNavy-800/90 border-reformedGold-200/80 dark:border-reformedGold-700/50";
                } else if (seg.category === 'sapiential') {
                  badgeClass = "bg-amber-50/70 dark:bg-reformedNavy-800/90 border-amber-200/80 dark:border-amber-700/50";
                } else if (seg.category === 'nt') {
                  badgeClass = "bg-reformedGreen-50/70 dark:bg-reformedNavy-800/90 border-reformedGreen-200/80 dark:border-reformedGreen-700/50";
                }

                return (
                  <div
                    key={idx}
                    className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between hover:border-reformedGold-400 transition-all ${badgeClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-parchment-100 dark:bg-reformedNavy-950 flex items-center justify-center text-reformedGold-600 dark:text-reformedGold-400 shadow-sm shrink-0 border border-reformedGold-200/50 dark:border-reformedNavy-700">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-sans">
                          {seg.title}
                        </span>
                        <p className="bible-text text-lg sm:text-xl font-bold text-slate-900 dark:text-reformedGold-100">
                          {seg.chapters}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Featured Verse & Reformed Meditation */}
          <div className="pt-3 border-t border-reformedGold-200/60 dark:border-reformedNavy-800 space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="display-title font-bold text-slate-900 dark:text-reformedGold-200 uppercase text-xs tracking-wider">
                Meditação & Palavra
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs font-bold text-reformedGold-600 dark:text-reformedGold-400 hover:opacity-80 active:scale-95 transition-all font-sans"
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
            <div className="bg-gradient-to-br from-reformedNavy-900 to-reformedNavy-950 dark:from-reformedNavy-950 dark:to-reformedNavy-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-xl border-l-4 border-reformedGold-500 relative overflow-hidden">
              <Quote className="w-7 h-7 sm:w-8 sm:h-8 text-reformedGold-400 opacity-30 mb-1" />
              <p className="bible-text text-lg sm:text-2xl italic font-semibold leading-relaxed mb-2.5 text-reformedGold-100">
                "{reading.verse}"
              </p>
              <p className="text-right text-xs sm:text-sm font-bold text-reformedGold-400 uppercase tracking-wider font-sans">
                — {reading.reference}
              </p>
            </div>

            {/* Reflection Text */}
            <div className="p-4 rounded-2xl bg-white dark:bg-reformedNavy-800/60 border border-reformedGold-200/60 dark:border-reformedNavy-700 space-y-2">
              <span className="text-[10px] font-bold uppercase text-reformedGold-700 dark:text-reformedGold-400 tracking-wider block font-sans">
                Meditação Teológica
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-serif leading-relaxed">
                {reading.reflection}
              </p>

              {/* Historical Catechism / Reformer Quote */}
              {reading.authorOrCatechism && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-reformedNavy-700/80 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 italic font-serif">
                  <ShieldCheck className="w-4 h-4 text-reformedGold-500 shrink-0 mt-0.5" />
                  <span>{reading.authorOrCatechism}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Sticky Action Footer */}
        <div className="p-3.5 sm:p-5 border-t border-reformedGold-200/60 dark:border-reformedNavy-800 bg-white/95 dark:bg-reformedNavy-950/95 backdrop-blur-md shrink-0">
          <button
            onClick={() => onToggleComplete(reading.day)}
            className={`w-full py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 ${
              isCompleted
                ? 'bg-parchment-100 dark:bg-reformedNavy-800 text-reformedGold-700 dark:text-reformedGold-400 border border-reformedGold-400/50'
                : 'bg-reformedGold-600 hover:bg-reformedGold-700 text-white shadow-reformedGold-600/30 hover:scale-[1.01]'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-reformedGold-600 dark:text-reformedGold-400" />
                <span className="font-sans uppercase tracking-wider text-xs">Meditação Concluída (Desmarcar)</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-sans uppercase tracking-wider text-xs">Concluir Leitura • Soli Deo Gloria</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
