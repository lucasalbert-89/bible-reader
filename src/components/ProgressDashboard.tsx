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
    <div className="w-full space-y-4">
      {/* Guest Mode Advisory Banner */}
      {!user && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200 text-sm">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <span className="font-bold">Modo Visitante Ativo:</span> Seu progresso está sendo salvo somente neste navegador.
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap shadow-sm"
          >
            Salvar no Supabase
          </button>
        </div>
      )}

      {/* Main Stats Card */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl transition-all relative overflow-hidden">
        
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 dark:bg-neonGreen/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          {/* Left Column: Plan name & percentage */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-neonOrange">
                Meu Progresso Bíblico
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {planInfo.title}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
                {percentage}%
              </span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                concluído
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md">
              {percentage === 100
                ? 'Glória a Deus! Você completou toda a jornada deste plano com perseverança!'
                : percentage > 50
                ? 'Mais da metade da caminhada realizada! Continue firme na presença da Palavra.'
                : 'Cada capítulo lido é um tijolo a mais no seu alicerce de fé e intimidade com Deus.'}
            </p>
          </div>

          {/* Right Column: Key Metrics in cards */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 w-full md:w-auto">
            
            {/* Metric 1: Completed days */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-neonGreen mb-1">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {completedCount}
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Lidos
              </span>
            </div>

            {/* Metric 2: Remaining days */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-neonOrange mb-1">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {remainingDays}
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Restantes
              </span>
            </div>

            {/* Metric 3: Total */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 mb-1">
                <BookCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {totalDays}
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Total
              </span>
            </div>

          </div>

        </div>

        {/* Progress Bar with smooth glow */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
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
