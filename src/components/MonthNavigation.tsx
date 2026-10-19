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
      name: `Mês ${idx + 1} • Dias ${idx * 30 + 1} a ${(idx + 1) * 30}`,
      daysCount: 30,
      startGlobalDay: idx * 30 + 1,
      endGlobalDay: (idx + 1) * 30,
    }));
  }

  return Array.from({ length: 3 }, (_, idx) => ({
    index: idx,
    name: `Mês ${idx + 1} • Dias ${idx * 30 + 1} a ${(idx + 1) * 30}`,
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
      <div className="space-y-6 animate-in fade-in duration-300">
        
        {/* Navigation Bar back to months */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectMonth(null)}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ver Todos os Meses</span>
            </button>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {activeMonth.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dias {activeMonth.startGlobalDay} ao {activeMonth.endGlobalDay} • {completedInMonth} de {activeMonth.daysCount} concluídos ({monthPercentage}%)
              </p>
            </div>
          </div>

          {/* Month progress mini bar */}
          <div className="w-full sm:w-48 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 dark:bg-neonGreen h-full transition-all duration-500"
              style={{ width: `${monthPercentage}%` }}
            />
          </div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3">
          {monthDays.map((globalDay) => {
            const isCompleted = completedDays.includes(globalDay);

            return (
              <button
                key={globalDay}
                onClick={() => onSelectDay(globalDay)}
                className={`aspect-square rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center border-2 transition-all relative group active:scale-95 ${
                  isCompleted
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-300 dark:border-neonGreen/80 text-emerald-800 dark:text-neonGreen shadow-sm dark:shadow-neon-green'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-neonOrange shadow-sm hover:scale-[1.02]'
                }`}
              >
                <span className="text-[10px] font-bold uppercase opacity-50 mb-0.5">
                  Dia
                </span>
                <span className="text-lg sm:text-2xl font-black tracking-tight">
                  {globalDay}
                </span>

                {isCompleted && (
                  <div className="absolute top-1.5 right-1.5 bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-neonGreen" />
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
          Meses do Plano
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Selecione um mês para ver os dias
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-neonGreen/60 text-left transition-all shadow-sm hover:shadow-md group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    Dias {month.startGlobalDay} - {month.endGlobalDay}
                  </span>
                  {isFinished && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-neonGreen bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      100%
                    </span>
                  )}
                </div>

                <h4 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-neonGreen transition-colors mb-2">
                  {month.name}
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  {completedCount} de {month.daysCount} dias lidos
                </p>
              </div>

              {/* Progress bar */}
              <div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className="bg-emerald-500 dark:bg-neonGreen h-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-neonGreen">
                  <span>Abrir Mês</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
