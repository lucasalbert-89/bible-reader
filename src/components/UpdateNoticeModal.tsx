import React, { useState, useEffect } from 'react';
import { X, BookOpen, Layers, ListOrdered, HeartHandshake } from 'lucide-react';

const NOTICE_STORAGE_KEY = 'biblia_update_notice_v2_dismissed';

export const UpdateNoticeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(NOTICE_STORAGE_KEY);
    if (!dismissed) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(NOTICE_STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-backdrop-enter"
      onClick={handleClose}
    >
      <div
        className="bg-parchment-50 dark:bg-reformedNavy-900 rounded-3xl w-full max-w-lg shadow-2xl border border-reformedGold-300/70 dark:border-reformedGold-600/40 max-h-[90dvh] flex flex-col overflow-hidden animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-reformedGold-200/60 dark:border-reformedNavy-800 flex justify-between items-center bg-white/70 dark:bg-reformedNavy-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-reformedGold-100 dark:bg-reformedNavy-800 flex items-center justify-center text-reformedGold-600 dark:text-reformedGold-400 border border-reformedGold-300/50 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-reformedGold-700 dark:text-reformedGold-400 tracking-widest block font-sans">
                Comunicado aos Leitores
              </span>
              <h3 className="display-title text-base sm:text-lg font-bold text-slate-900 dark:text-reformedGold-100">
                Atualização nos Planos de Leitura
              </h3>
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="Fechar aviso"
            className="w-9 h-9 rounded-xl hover:bg-slate-200/60 dark:hover:bg-reformedNavy-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors flex items-center justify-center active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <p className="font-serif text-sm sm:text-base text-slate-800 dark:text-slate-200">
            A paz do Senhor! Realizamos um importante ajuste na estrutura dos nossos planos de leitura (<strong>365, 180 e 90 dias</strong>) para oferecer uma distribuição bíblica ainda mais fiel e acrescentamos uma nova modalidade de leitura:
          </p>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-reformedNavy-800/80 border border-reformedGold-200/70 dark:border-reformedNavy-700 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-reformedGold-100 dark:bg-reformedNavy-900 text-reformedGold-700 dark:text-reformedGold-400 shrink-0 mt-0.5">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-reformedGold-100 text-xs sm:text-sm mb-0.5">
                  1. Modo AT + Salmos e Provérbios + NT (365, 180 e 90 dias)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  O <strong>Antigo Testamento</strong> é percorrido de forma contínua do início ao fim (incluindo Jó, Eclesiastes e Cantares na ordem bíblica), enquanto <strong>Salmos e Provérbios</strong> e o <strong>Novo Testamento</strong> repetem 1 vez (2 ciclos completos ao longo do plano).
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-reformedNavy-800/80 border border-reformedGold-200/70 dark:border-reformedNavy-700 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-reformedGold-100 dark:bg-reformedNavy-900 text-reformedGold-700 dark:text-reformedGold-400 shrink-0 mt-0.5">
                <ListOrdered className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-reformedGold-100 text-xs sm:text-sm mb-0.5">
                  2. Novo Modo Direto: Gênesis a Apocalipse (365, 180 e 90 dias)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Agora você também pode optar pela leitura sequencial direta de <strong>Gênesis a Apocalipse</strong> sem alternar entre Antigo Testamento, Poéticos e Novo Testamento, em qualquer plano de dias.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-reformedGold-50/80 dark:bg-reformedNavy-950/90 border border-reformedGold-300/60 dark:border-reformedGold-600/30 flex items-start gap-2.5">
            <HeartHandshake className="w-4 h-4 text-reformedGold-600 dark:text-reformedGold-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700 dark:text-reformedGold-200 font-serif italic">
              Pedimos sinceras desculpas por qualquer inconveniência que esta atualização nas porções diárias possa causar no seu acompanhamento atual. Seu progresso de dias concluídos permanece salvo!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-reformedGold-200/60 dark:border-reformedNavy-800 bg-white/90 dark:bg-reformedNavy-950/90">
          <button
            onClick={handleClose}
            className="w-full py-3 rounded-2xl bg-reformedGold-600 hover:bg-reformedGold-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-reformedGold-600/25 transition-all active:scale-95"
          >
            Entendi • Continuar Leitura
          </button>
        </div>
      </div>
    </div>
  );
};
