import React from 'react';
import { ReadingPlanInfo } from '../types';
import { BookOpen, Flame, Scroll, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProgressDashboardProps {
  planInfo: ReadingPlanInfo;
  completedCount: number;
  totalDays: number;
  percentage: number;
  onOpenAuth: () => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  planInfo,
  completedCount,
  totalDays,
  percentage,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const remainingDays = Math.max(0, totalDays - completedCount);

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      {/* Guest Mode Advisory Banner */}
      {!user && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-reformedGold-500/30 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2.5 text-amber-950 dark:text-reformedGold-200 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-reformedGold-600 shrink-0" />
            <div>
              <span className="font-bold">Modo Visitante:</span> Seu progresso está guardado localmente neste dispositivo.
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="w-full xs:w-auto text-center px-3.5 py-1.5 rounded-xl bg-reformedGold-600 hover:bg-reformedGold-700 text-white font-bold text-[11px] uppercase tracking-wider transition-all shadow-sm active:scale-95"
          >
            Salvar na Nuvem
          </button>
        </div>
      )}

      {/* Main Stats Card */}
      <div className="p-5 sm:p-8 rounded-[28px] sm:rounded-[32px] bg-white dark:bg-reformedNavy-900 border border-reformedGold-200/60 dark:border-reformedNavy-700 shadow-xl dark:shadow-reformed-card transition-all relative overflow-hidden">
        
        {/* Soft Golden Ambient Light */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-52 sm:w-72 h-52 sm:h-72 bg-reformedGold-500/10 dark:bg-reformedGold-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          
          {/* Left Column */}
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-reformedGold-700 dark:text-reformedGold-400">
                Soli Deo Gloria
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs font-serif italic text-slate-500 dark:text-slate-400">
                {planInfo.title}
              </span>
            </div>

            <div className="flex items-baseline gap-2.5">
              <span className="display-title text-4xl sm:text-6xl font-black text-slate-900 dark:text-reformedGold-100 tracking-tight">
                {percentage}%
              </span>
              <span className="text-xs sm:text-sm font-serif italic text-slate-500 dark:text-slate-400">
                percorrido
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-serif leading-relaxed max-w-md">
              {percentage === 100
                ? 'Soli Deo Gloria! Você completou toda a Escritura sagrada para a glória de Deus!'
                : percentage > 50
                ? 'Mais da metade da caminhada bíblica cumprida com fidelidade e perseverança nos meios de graça.'
                : 'A fé vem pelo ouvir, e o ouvir pela palavra de Cristo (Romanos 10:17). Siga firme nas Escrituras.'}
            </p>
          </div>

          {/* Right Column: Key Metrics in cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full md:w-auto">
            
            {/* Metric 1: Completed days */}
            <div className="p-3 sm:p-4 rounded-2xl bg-parchment-100/70 dark:bg-reformedNavy-800/80 border border-reformedGold-200/50 dark:border-reformedNavy-700 flex flex-col items-center justify-center text-center">
              <div className="p-1.5 sm:p-2 rounded-xl bg-reformedGold-100 dark:bg-reformedNavy-700 text-reformedGold-700 dark:text-reformedGold-400 mb-1">
                <BookOpen className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <span className="display-title text-lg sm:text-2xl font-bold text-slate-900 dark:text-reformedGold-100">
                {completedCount}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Meditados
              </span>
            </div>

            {/* Metric 2: Remaining days */}
            <div className="p-3 sm:p-4 rounded-2xl bg-parchment-100/70 dark:bg-reformedNavy-800/80 border border-reformedGold-200/50 dark:border-reformedNavy-700 flex flex-col items-center justify-center text-center">
              <div className="p-1.5 sm:p-2 rounded-xl bg-amber-100 dark:bg-reformedNavy-700 text-amber-700 dark:text-amber-400 mb-1">
                <Flame className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <span className="display-title text-lg sm:text-2xl font-bold text-slate-900 dark:text-reformedGold-100">
                {remainingDays}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Restantes
              </span>
            </div>

            {/* Metric 3: Total */}
            <div className="p-3 sm:p-4 rounded-2xl bg-parchment-100/70 dark:bg-reformedNavy-800/80 border border-reformedGold-200/50 dark:border-reformedNavy-700 flex flex-col items-center justify-center text-center">
              <div className="p-1.5 sm:p-2 rounded-xl bg-reformedGreen-100 dark:bg-reformedNavy-700 text-reformedGreen-700 dark:text-emerald-400 mb-1">
                <Scroll className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <span className="display-title text-lg sm:text-2xl font-bold text-slate-900 dark:text-reformedGold-100">
                {totalDays}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Total
              </span>
            </div>

          </div>

        </div>

        {/* Progress Bar with Sacred Gold Gradient */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-100 dark:border-reformedNavy-800">
          <div className="w-full bg-slate-100 dark:bg-reformedNavy-800 h-2.5 sm:h-3 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-reformedGold-600 via-reformedGold-500 to-reformedGold-400 transition-all duration-700 ease-out shadow-sm shadow-reformedGold-500/30"
              style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};
