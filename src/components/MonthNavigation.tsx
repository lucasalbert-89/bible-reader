import React from 'react';
import { PlanId } from '../types';
import { CheckCircle2, ChevronRight, ArrowLeft, Sparkles, Calendar } from 'lucide-react';
import { getTodayCalendarInfo, MONTH_NAMES_365, DAYS_PER_MONTH_365 } from '../lib/dateUtils';

interface MonthData {
  index: number;
  name: string;
  daysCount: number;
  startGlobalDay: number;
  endGlobalDay: number;
}

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
  const todayInfo = getTodayCalendarInfo();

  // If a month is selected, show its days grid
  if (activeMonthIndex !== null && months[activeMonthIndex]) {
    const activeMonth = months[activeMonthIndex];
    const monthDays = Array.from(
      { length: activeMonth.daysCount },
      (_, i) => ({
        dayOfMonth: i + 1,
        globalDay: activeMonth.startGlobalDay + i,
        indexInMonth: i,
      })
    );

    const completedInMonth = monthDays.filter(d => completedDays.includes(d.globalDay)).length;
    const monthPercentage = Math.round((completedInMonth / activeMonth.daysCount) * 100);
    const isCurrentCalendarMonth = planId === 'plano-365' && activeMonthIndex === todayInfo.monthIndex;

    return (
      <div className="space-y-4 sm:space-y-6 animate-fade-in-stagger">
        
        {/* Navigation Bar back to months */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-reformedNavy-900 border border-reformedGold-200/60 dark:border-reformedNavy-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => onSelectMonth(null)}
              className="p-2 sm:p-2.5 bg-parchment-100 hover:bg-parchment-200 dark:bg-reformedNavy-800 dark:hover:bg-reformedNavy-700 rounded-xl text-slate-700 dark:text-reformedGold-200 transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95 shrink-0 border border-reformedGold-200/50 dark:border-reformedNavy-600"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden xs:inline">Voltar aos Meses</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="display-title text-lg sm:text-2xl font-bold text-slate-900 dark:text-reformedGold-100 uppercase tracking-wide">
                  {activeMonth.name}
                </h3>
                {isCurrentCalendarMonth && (
                  <span className="px-2 py-0.5 rounded-full bg-reformedGold-100 dark:bg-reformedNavy-800 text-reformedGold-800 dark:text-reformedGold-300 text-[9px] font-black uppercase tracking-wider border border-reformedGold-300/40">
                    Mês Atual
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-serif italic">
                {planId === 'plano-365'
                  ? `Dias 1 ao ${activeMonth.daysCount} de ${activeMonth.name} • Dias ${activeMonth.startGlobalDay} ao ${activeMonth.endGlobalDay} do Ano`
                  : `Dias ${activeMonth.startGlobalDay} ao ${activeMonth.endGlobalDay} do Plano`} • {completedInMonth}/{activeMonth.daysCount} meditados ({monthPercentage}%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick jump to Today if viewing current month */}
            {isCurrentCalendarMonth && (
              <button
                onClick={() => onSelectDay(todayInfo.today365GlobalDay)}
                className="px-3 py-1.5 rounded-xl bg-reformedGold-500 hover:bg-reformedGold-600 text-white font-bold text-[11px] sm:text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pular para Hoje (Dia {todayInfo.dayOfMonth})</span>
              </button>
            )}

            {/* Month progress mini bar */}
            <div className="w-full sm:w-36 bg-slate-100 dark:bg-reformedNavy-800 h-2 rounded-full overflow-hidden shrink-0 hidden md:block">
              <div
                className="bg-reformedGold-500 h-full transition-all duration-500"
                style={{ width: `${monthPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Days Grid: Prominent Day of Month + Day of Year underneath */}
        <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3">
          {monthDays.map(({ dayOfMonth, globalDay, indexInMonth }) => {
            const isCompleted = completedDays.includes(globalDay);
            const isToday = planId === 'plano-365' && activeMonthIndex === todayInfo.monthIndex && dayOfMonth === todayInfo.dayOfMonth;

            return (
              <button
                key={globalDay}
                onClick={() => onSelectDay(globalDay)}
                className={`min-h-[72px] sm:min-h-[82px] rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center p-2 border-2 transition-all duration-200 relative group active:scale-95 hover:-translate-y-0.5 hover:shadow-md animate-day-fade-in ${
                  isToday
                    ? 'ring-2 ring-reformedGold-500 border-reformedGold-500 bg-reformedGold-50/90 dark:bg-reformedNavy-800 text-slate-900 dark:text-reformedGold-100 shadow-gold-glow animate-today-halo'
                    : isCompleted
                    ? 'bg-reformedGold-50/80 dark:bg-reformedNavy-800/90 border-reformedGold-400 dark:border-reformedGold-500/80 text-reformedGold-900 dark:text-reformedGold-200 shadow-sm'
                    : 'bg-white dark:bg-reformedNavy-900 border-slate-200/80 dark:border-reformedNavy-800 text-slate-700 dark:text-slate-300 hover:border-reformedGold-400 dark:hover:border-reformedNavy-600 shadow-sm'
                }`}
                style={{ animationDelay: `${Math.min(indexInMonth * 10, 250)}ms` }}
              >
                {/* Today Badge */}
                {isToday && (
                  <span className="absolute -top-2 px-2 py-0.5 rounded-full bg-reformedGold-500 text-white font-sans text-[8px] font-black uppercase tracking-wider shadow-sm animate-badge-pop">
                    Hoje
                  </span>
                )}

                {/* Primary Number: Day of the Month */}
                <span className="display-title text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-none mb-1">
                  {dayOfMonth}
                </span>

                {/* Sub-label: Day of the Year (365) or Global Plan Day */}
                <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider font-sans ${
                  isToday 
                    ? 'text-reformedGold-700 dark:text-reformedGold-400 font-black' 
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-reformedGold-600 dark:group-hover:text-reformedGold-400'
                }`}>
                  Dia {globalDay}
                </span>

                {/* Completed Checkmark Badge */}
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
    <div className="space-y-3.5 sm:space-y-5">
      
      {/* Today Quick Banner (for 365 plan) */}
      {planId === 'plano-365' && (
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-reformedGold-500/15 via-reformedGold-500/5 to-transparent dark:from-reformedNavy-900 dark:via-reformedNavy-900/60 dark:to-reformedNavy-950 border border-reformedGold-300/60 dark:border-reformedGold-600/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-reformedGold-500 to-reformedGold-600 text-white flex flex-col items-center justify-center font-bold shadow-md shrink-0">
              <span className="text-[9px] uppercase tracking-wider leading-none font-sans opacity-90">Hoje</span>
              <span className="text-xl leading-none font-bold display-title mt-0.5">{todayInfo.dayOfMonth}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-black uppercase text-reformedGold-700 dark:text-reformedGold-400 tracking-widest font-sans">
                  {todayInfo.formattedDate} • Dia {todayInfo.today365GlobalDay} de 365
                </span>
                {completedDays.includes(todayInfo.today365GlobalDay) && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                    <CheckCircle2 className="w-3 h-3" />
                    Concluído
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-serif italic">
                {completedDays.includes(todayInfo.today365GlobalDay) 
                  ? "Você já cumpriu a porção das Escrituras de hoje. Soli Deo Gloria!" 
                  : "Acesse diretamente o texto bíblico de hoje para sua meditação e oração."}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              onSelectMonth(todayInfo.monthIndex);
              onSelectDay(todayInfo.today365GlobalDay);
            }}
            className="px-4 py-2.5 rounded-xl bg-reformedGold-600 hover:bg-reformedGold-500 text-white font-bold text-xs shadow-md shadow-reformedGold-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Abrir Leitura de Hoje ({todayInfo.dayOfMonth} de {todayInfo.monthName})</span>
          </button>
        </div>
      )}

      {/* Header */}
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

      {/* Months Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {months.map((month) => {
          const monthDays = Array.from(
            { length: month.daysCount },
            (_, i) => month.startGlobalDay + i
          );
          const completedCount = monthDays.filter(d => completedDays.includes(d)).length;
          const percentage = Math.round((completedCount / month.daysCount) * 100);
          const isFinished = percentage === 100;
          const isCurrentMonth = planId === 'plano-365' && month.index === todayInfo.monthIndex;

          return (
            <button
              key={month.index}
              onClick={() => onSelectMonth(month.index)}
              className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-reformedNavy-900 border text-left transition-all shadow-sm group flex flex-col justify-between active:scale-[0.98] relative ${
                isCurrentMonth
                  ? 'border-reformedGold-400 dark:border-reformedGold-500/80 shadow-sacred-glow ring-1 ring-reformedGold-400/40'
                  : 'border-reformedGold-200/60 dark:border-reformedNavy-700 hover:border-reformedGold-400 dark:hover:border-reformedGold-500/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider font-sans">
                    Dias {month.startGlobalDay} - {month.endGlobalDay}
                  </span>
                  
                  {isCurrentMonth ? (
                    <span className="flex items-center gap-1 text-[9px] font-black text-reformedGold-800 dark:text-reformedGold-300 bg-reformedGold-100 dark:bg-reformedNavy-800 px-2 py-0.5 rounded-full border border-reformedGold-300/50">
                      <Calendar className="w-2.5 h-2.5 text-reformedGold-600" />
                      Mês Atual
                    </span>
                  ) : isFinished ? (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-reformedGold-700 dark:text-reformedGold-400 bg-reformedGold-100 dark:bg-reformedNavy-800 px-2 py-0.5 rounded-full border border-reformedGold-300/40">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      100%
                    </span>
                  ) : null}
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
