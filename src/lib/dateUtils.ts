import { PlanId } from '../types';

export const MONTH_NAMES_365 = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
] as const;

export const DAYS_PER_MONTH_365 = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

export interface DayInfo {
  monthIndex: number;
  monthName: string;
  dayOfMonth: number;
  daysInMonth: number;
  globalDay: number;
  totalDays: number;
  isToday: boolean;
  formattedDate: string;
  fullLabel: string;
}

/**
 * Returns information about today's calendar date relative to the 365-day plan.
 */
export function getTodayCalendarInfo(): {
  monthIndex: number;
  monthName: string;
  dayOfMonth: number;
  today365GlobalDay: number;
  formattedDate: string;
} {
  const now = new Date();
  const monthIndex = now.getMonth(); // 0 to 11
  const dayOfMonth = now.getDate(); // 1 to 31

  let daysBefore = 0;
  for (let m = 0; m < monthIndex; m++) {
    daysBefore += DAYS_PER_MONTH_365[m];
  }

  // Clamp within the current month length
  const maxDays = DAYS_PER_MONTH_365[monthIndex] || 30;
  const clampedDay = Math.min(dayOfMonth, maxDays);
  const today365GlobalDay = daysBefore + clampedDay;
  const monthName = MONTH_NAMES_365[monthIndex] || 'Mês';
  const formattedDate = `${clampedDay} de ${monthName}`;

  return {
    monthIndex,
    monthName,
    dayOfMonth: clampedDay,
    today365GlobalDay,
    formattedDate,
  };
}

/**
 * Given a planId and a global day index (e.g. 293), returns detailed metadata including
 * day of the month, month name, and whether it corresponds to today.
 */
export function getDayInfo(planId: PlanId, globalDay: number): DayInfo {
  const todayInfo = getTodayCalendarInfo();

  if (planId === 'plano-365') {
    let accumulated = 0;
    let monthIndex = 0;
    let dayOfMonth = 1;

    for (let i = 0; i < DAYS_PER_MONTH_365.length; i++) {
      const count = DAYS_PER_MONTH_365[i];
      if (globalDay <= accumulated + count) {
        monthIndex = i;
        dayOfMonth = globalDay - accumulated;
        break;
      }
      accumulated += count;
    }

    const monthName = MONTH_NAMES_365[monthIndex] || 'Mês';
    const daysInMonth = DAYS_PER_MONTH_365[monthIndex] || 31;
    const isToday = monthIndex === todayInfo.monthIndex && dayOfMonth === todayInfo.dayOfMonth;
    const formattedDate = `${dayOfMonth} de ${monthName}`;
    const fullLabel = `${formattedDate} • Dia ${globalDay} de 365`;

    return {
      monthIndex,
      monthName,
      dayOfMonth,
      daysInMonth,
      globalDay,
      totalDays: 365,
      isToday,
      formattedDate,
      fullLabel,
    };
  }

  if (planId === 'plano-180') {
    const monthIndex = Math.min(5, Math.floor((globalDay - 1) / 30));
    const dayOfMonth = ((globalDay - 1) % 30) + 1;
    const monthName = `Mês ${monthIndex + 1}`;
    const formattedDate = `Dia ${dayOfMonth} do ${monthName}`;
    const fullLabel = `${formattedDate} • Dia ${globalDay} de 180`;

    return {
      monthIndex,
      monthName,
      dayOfMonth,
      daysInMonth: 30,
      globalDay,
      totalDays: 180,
      isToday: false,
      formattedDate,
      fullLabel,
    };
  }

  // plano-90
  const monthIndex = Math.min(2, Math.floor((globalDay - 1) / 30));
  const dayOfMonth = ((globalDay - 1) % 30) + 1;
  const monthName = `Mês ${monthIndex + 1}`;
  const formattedDate = `Dia ${dayOfMonth} do ${monthName}`;
  const fullLabel = `${formattedDate} • Dia ${globalDay} de 90`;

  return {
    monthIndex,
    monthName,
    dayOfMonth,
    daysInMonth: 30,
    globalDay,
    totalDays: 90,
    isToday: false,
    formattedDate,
    fullLabel,
  };
}
