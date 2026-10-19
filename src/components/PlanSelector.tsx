import React from 'react';
import { PlanId } from '../types';
import { PLANS_INFO } from '../data/plansInfo';
import { Calendar, Clock, Flame } from 'lucide-react';

interface PlanSelectorProps {
  selectedPlan: PlanId;
  onSelectPlan: (planId: PlanId) => void;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({
  selectedPlan,
  onSelectPlan,
}) => {
  const getIcon = (id: PlanId, className = "w-4 h-4") => {
    switch (id) {
      case 'plano-365':
        return <Calendar className={`${className} text-emerald-600 dark:text-neonGreen`} />;
      case 'plano-180':
        return <Clock className={`${className} text-amber-500 dark:text-neonOrange`} />;
      case 'plano-90':
        return <Flame className={`${className} text-rose-500 dark:text-red-400`} />;
    }
  };

  const activePlanInfo = PLANS_INFO.find(p => p.id === selectedPlan) || PLANS_INFO[0];

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
        <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
          Plano de Leitura
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Progresso individual por plano
        </span>
      </div>

      {/* Mobile-Friendly Compact Segmented Control (Visible on Mobile) */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-200/60 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 md:hidden">
        {PLANS_INFO.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <button
              key={plan.id}
              onClick={() => onSelectPlan(plan.id)}
              className={`py-2.5 px-2 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                isSelected
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black shadow-sm border border-slate-200/50 dark:border-neonGreen/40'
                  : 'text-slate-500 dark:text-slate-400 font-semibold hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-1">
                {getIcon(plan.id, "w-3.5 h-3.5")}
                <span className="text-xs uppercase tracking-tight">{plan.totalDays}d</span>
              </div>
              <span className="text-[10px] font-bold opacity-75 truncate max-w-full">
                {plan.id === 'plano-365' ? '1 Ano' : plan.id === 'plano-180' ? '6 Meses' : '3 Meses'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile Active Plan Summary Banner */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 md:hidden flex items-center justify-between shadow-sm">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-900 dark:text-white">
              {activePlanInfo.title}
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-neonGreen/10 text-emerald-800 dark:text-neonGreen">
              {activePlanInfo.badge}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Ritmo: <strong>{activePlanInfo.chaptersPerDay}</strong>
          </p>
        </div>
      </div>

      {/* Desktop / Tablet Cards (Hidden on Mobile) */}
      <div className="hidden md:grid grid-cols-3 gap-4">
        {PLANS_INFO.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <button
              key={plan.id}
              onClick={() => onSelectPlan(plan.id)}
              className={`text-left p-5 rounded-3xl border-2 transition-all relative overflow-hidden flex flex-col justify-between group ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-emerald-500 dark:border-neonGreen shadow-lg dark:shadow-neon-green scale-[1.01]'
                  : 'bg-white/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:scale-[1.005]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800">
                    {getIcon(plan.id, "w-5 h-5")}
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      isSelected
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-neonGreen/20 dark:text-neonGreen border border-emerald-200 dark:border-neonGreen/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>

                <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mb-1">
                  {plan.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                  {plan.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400">
                  Ritmo:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {plan.chaptersPerDay}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
