import React from 'react';
import { ReadingPlanInfo } from '../types';
import { CheckCircle2, Flame, BookCheck, ShieldAlert } from 'lucide-react';
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
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2.5 text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
            <div>
              <span className="font-bold">Modo Visitante:</span> Salvo localmente neste aparelho.
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="w-full xs:w-auto text-center px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-[11px] uppercase tracking-wider transition-all shadow-sm active:scale-95"
          >
            Salvar na Nuvem
          </button>
        </div>
      )}

      {/* Main Stats Card */}
      <div className="p-5 sm:p-8 rounded-[28px] sm:rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl transition-all relative overflow-hidden">
        
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 sm:w-64 h-48 sm:h-64 bg-emerald-500/10 dark:bg-neonGreen/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          
          {/* Left Column */}
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-neonOrange">
                Progresso Bíblico
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {planInfo.title}
              </span>
            </div>

            <div className="flex items-baseline gap-2.5">
              <span className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
                {percentage}%
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                concluído
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md">
              {percentage === 100
                ? 'Glória a Deus! Você completou toda a jornada deste plano!'
                : percentage > 50
                ? 'Mais da metade da caminhada realizada! Continue firme.'
                : 'Cada dia lido fortalece sua intimidade com Deus.'}
            </p>
          </div>

          {/* Right Column: Key Metrics in cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full md:w-auto">
            
            {/* Metric 1: Completed days */}
            <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-neonGreen mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                {completedCount}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Lidos
              </span>
            </div>

            {/* Metric 2: Remaining days */}
            <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="p-1.5 sm:p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-neonOrange mb-1">
                <Flame className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                {remainingDays}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Restam
              </span>
            </div>

            {/* Metric 3: Total */}
            <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="p-1.5 sm:p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 mb-1">
                <BookCheck className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                {totalDays}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Total
              </span>
            </div>

          </div>

        </div>

        {/* Progress Bar with smooth glow */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 sm:h-3 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 dark:from-neonGreen dark:to-emerald-400 transition-all duration-700 ease-out shadow-sm dark:shadow-neon-green"
              style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};
