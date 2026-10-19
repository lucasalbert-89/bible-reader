import React from 'react';
import { PlanId } from '../types';
import { CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';

interface MonthData {
  index: number;
  name: string;
  daysCount: number;
  startGlobalDay: number;
  endGlobalDay: number;
}

const MONTH_NAMES_365 = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
const DAYS_PER_MONTH_365 = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function getPlanMonths(planId: PlanId): MonthData[] {
  if (planId === 'plano-365') {
    let currentStart = 1;
    return DAYS_PER_MONTH_365.map((count, idx) => {
      const start = currentStart;
      const end = currentStart + count - 1;
      currentStart += count;
      return {
        index: idx,
        name: MONTH_NAMES_365[idx],
        daysCount: count,
        startGlobalDay: start,
        endGlobalDay: end,
      };
    });
  }

  if (planId === 'plano-180') {
    return Array.from({ length: 6 }, (_, idx) => ({
      index: idx,
      name: `Mês ${idx + 1} (Dias ${idx * 30 + 1}-${(idx + 1) * 30})`,
      daysCount: 30,
      startGlobalDay: idx * 30 + 1,
      endGlobalDay: (idx + 1) * 30,
    }));
  }

  return Array.from({ length: 3 }, (_, idx) => ({
    index: idx,
    name: `Mês ${idx + 1} (Dias ${idx * 30 + 1}-${(idx + 1) * 30})`,
    daysCount: 30,
    startGlobalDay: idx * 30 + 1,
    endGlobalDay: (idx + 1) * 30,
  }));
}

interface MonthNavigationProps {
  planId: PlanId;
  completedDays: number[];
  activeMonthIndex: number | null;
  onSelectMonth: (index: number | null) => void;
  onSelectDay: (globalDay: number) => void;
}

export const MonthNavigation: React.FC<MonthNavigationProps> = ({
  planId,
  completedDays,
  activeMonthIndex,
  onSelectMonth,
  onSelectDay,
}) => {
  const months = getPlanMonths(planId);

  // If a month is selected, show its days grid
  if (activeMonthIndex !== null && months[activeMonthIndex]) {
    const activeMonth = months[activeMonthIndex];
    const monthDays = Array.from(
      { length: activeMonth.daysCount },
      (_, i) => activeMonth.startGlobalDay + i
    );

    const completedInMonth = monthDays.filter(d => completedDays.includes(d)).length;
    const monthPercentage = Math.round((completedInMonth / activeMonth.daysCount) * 100);

    return (
      <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
        
        {/* Navigation Bar back to months */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-reformedNavy-900 border border-reformedGold-200/60 dark:border-reformedNavy-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => onSelectMonth(null)}
              className="p-2 sm:p-2.5 bg-parchment-100 hover:bg-parchment-200 dark:bg-reformedNavy-800 dark:hover:bg-reformedNavy-700 rounded-xl text-slate-700 dark:text-reformedGold-200 transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95 shrink-0 border border-reformedGold-200/50 dark:border-reformedNavy-600"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden xs:inline">Voltar aos Meses</span>
            </button>
            <div>
              <h3 className="display-title text-lg sm:text-2xl font-bold text-slate-900 dark:text-reformedGold-100 uppercase tracking-wide">
                {activeMonth.name}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-serif italic">
                Dias {activeMonth.startGlobalDay} ao {activeMonth.endGlobalDay} • {completedInMonth}/{activeMonth.daysCount} meditados ({monthPercentage}%)
              </p>
            </div>
          </div>

          {/* Month progress mini bar */}
          <div className="w-full sm:w-44 bg-slate-100 dark:bg-reformedNavy-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-reformedGold-500 h-full transition-all duration-500"
              style={{ width: `${monthPercentage}%` }}
            />
          </div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3">
          {monthDays.map((globalDay) => {
            const isCompleted = completedDays.includes(globalDay);

            return (
              <button
                key={globalDay}
                onClick={() => onSelectDay(globalDay)}
                className={`min-h-[64px] sm:min-h-[72px] rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center border-2 transition-all relative group active:scale-90 ${
                  isCompleted
                    ? 'bg-reformedGold-50 dark:bg-reformedNavy-800/90 border-reformedGold-400 dark:border-reformedGold-500/80 text-reformedGold-900 dark:text-reformedGold-200 shadow-sm'
                    : 'bg-white dark:bg-reformedNavy-900 border-slate-200/80 dark:border-reformedNavy-800 text-slate-700 dark:text-slate-300 hover:border-reformedGold-300 dark:hover:border-reformedNavy-600 shadow-sm'
                }`}
              >
                <span className="text-[9px] font-bold uppercase opacity-50 font-sans">
                  Dia
                </span>
                <span className="display-title text-base sm:text-xl font-bold tracking-tight">
                  {globalDay}
                </span>

                {isCompleted && (
                  <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 bg-white dark:bg-reformedNavy-950 rounded-full p-0.5 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-reformedGold-600 dark:text-reformedGold-400" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

      </div>
    );
  }

  // Otherwise, show Month Overview Cards
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="display-title text-lg sm:text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-reformedGold-100">
            Meses da Aliança
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-serif italic">
            Selecione uma estação para meditar nos textos bíblicos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {months.map((month) => {
          const monthDays = Array.from(
            { length: month.daysCount },
            (_, i) => month.startGlobalDay + i
          );
          const completedCount = monthDays.filter(d => completedDays.includes(d)).length;
          const percentage = Math.round((completedCount / month.daysCount) * 100);
          const isFinished = percentage === 100;

          return (
            <button
              key={month.index}
              onClick={() => onSelectMonth(month.index)}
              className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-reformedNavy-900 border border-reformedGold-200/60 dark:border-reformedNavy-700 hover:border-reformedGold-400 dark:hover:border-reformedGold-500/60 text-left transition-all shadow-sm group flex flex-col justify-between active:scale-[0.98]"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider font-sans">
                    Dias {month.startGlobalDay} - {month.endGlobalDay}
                  </span>
                  {isFinished && (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-reformedGold-700 dark:text-reformedGold-400 bg-reformedGold-100 dark:bg-reformedNavy-800 px-2 py-0.5 rounded-full border border-reformedGold-300/40">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      100%
                    </span>
                  )}
                </div>

                <h4 className="display-title text-base sm:text-lg font-bold text-slate-900 dark:text-reformedGold-100 group-hover:text-reformedGold-600 dark:group-hover:text-reformedGold-400 transition-colors mb-1">
                  {month.name}
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-serif italic">
                  {completedCount} de {month.daysCount} dias meditados
                </p>
              </div>

              <div>
                <div className="w-full bg-slate-100 dark:bg-reformedNavy-800 h-1.5 sm:h-2 rounded-full overflow-hidden mb-2.5">
                  <div
                    className="bg-reformedGold-500 h-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-reformedGold-600 dark:group-hover:text-reformedGold-400 font-sans">
                  <span>Abrir Mês</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
