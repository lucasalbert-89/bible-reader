import React, { useState, useEffect } from 'react';
import { X, Volume2 } from 'lucide-react';

const NOTICE_STORAGE_KEY = 'biblia_update_notice_v3_audio_dismissed';

export const UpdateNoticeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try { setIsOpen(!localStorage.getItem(NOTICE_STORAGE_KEY)); }
    catch { setIsOpen(true); }
  }, []);

  const handleClose = () => {
    try { localStorage.setItem(NOTICE_STORAGE_KEY, 'true'); } catch { /* Storage may be disabled. */ }
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
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-reformedGold-700 dark:text-reformedGold-400 tracking-widest block font-sans">
                Comunicado aos Leitores
              </span>
              <h3 className="display-title text-base sm:text-lg font-bold text-slate-900 dark:text-reformedGold-100">
                Agora você pode ouvir a leitura do dia!
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

        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>Abra a leitura de um dia do seu plano e toque em <strong>“Ouvir leitura do dia”</strong>. A voz lê os capítulos daquele dia, do início ao fim, na versão bíblica que você escolheu.</p>
          <p>A função é <strong>gratuita</strong> e usa as vozes disponíveis no seu celular, computador ou navegador. A voz e a qualidade podem variar conforme o aparelho; algumas vozes precisam de internet.</p>
          <p>Você pode pausar, continuar ou parar. Ao continuar, o trecho atual pode ser repetido. Ao fechar o leitor ou trocar de capítulo ou versão, a narração para.</p>
          <div className="p-3.5 rounded-2xl bg-reformedGold-50 dark:bg-reformedNavy-950 border border-reformedGold-300/60 dark:border-reformedGold-600/30">
            Se não houver uma voz em português disponível, ou se o navegador não oferecer esse recurso, o leitor mostrará um aviso. A leitura do texto continua disponível normalmente.
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
