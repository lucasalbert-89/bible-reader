import React from 'react';
import { PlanId } from '../types';
import { PLANS_INFO } from '../data/plansInfo';
import { BookOpen, Scroll, Compass } from 'lucide-react';

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
        return <BookOpen className={`${className} text-reformedGold-600 dark:text-reformedGold-400`} />;
      case 'plano-180':
        return <Scroll className={`${className} text-reformedGreen-700 dark:text-emerald-400`} />;
      case 'plano-90':
        return <Compass className={`${className} text-amber-600 dark:text-amber-400`} />;
    }
  };

  const activePlanInfo = PLANS_INFO.find(p => p.id === selectedPlan) || PLANS_INFO[0];

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
        <div>
          <h2 className="display-title text-lg sm:text-2xl font-bold uppercase tracking-wider text-slate-900 dark:text-reformedGold-100">
            Planos da Aliança
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-serif italic">
            O conselho integral de Deus para edificação e santificação do povo da aliança
          </p>
        </div>
      </div>

      {/* Mobile-Friendly Compact Segmented Control (Mobile) */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-parchment-200/60 dark:bg-reformedNavy-900 border border-reformedGold-300/40 dark:border-reformedNavy-700 md:hidden">
        {PLANS_INFO.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <button
              key={plan.id}
              onClick={() => onSelectPlan(plan.id)}
              className={`py-2.5 px-2 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                isSelected
                  ? 'bg-white dark:bg-reformedNavy-800 text-slate-900 dark:text-reformedGold-200 font-black shadow-sm border border-reformedGold-400/60'
                  : 'text-slate-500 dark:text-slate-400 font-semibold'
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
      <div className="p-3.5 rounded-2xl bg-white dark:bg-reformedNavy-900 border border-reformedGold-200/80 dark:border-reformedNavy-800 md:hidden flex items-center justify-between shadow-sm">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-reformedGold-200">
              {activePlanInfo.title}
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-reformedGold-100 dark:bg-reformedGold-950/80 text-reformedGold-900 dark:text-reformedGold-200 border border-reformedGold-300 dark:border-reformedGold-500/60">
              {activePlanInfo.badge}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Porção diária: <strong className="text-slate-900 dark:text-reformedGold-200">{activePlanInfo.chaptersPerDay}</strong>
          </p>
        </div>
      </div>

      {/* Desktop / Tablet Cards */}
      <div className="hidden md:grid grid-cols-3 gap-4">
        {PLANS_INFO.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <button
              key={plan.id}
              onClick={() => onSelectPlan(plan.id)}
              className={`text-left p-5 rounded-3xl border-2 transition-all relative overflow-hidden flex flex-col justify-between group ${
                isSelected
                  ? 'bg-white dark:bg-reformedNavy-900 border-reformedGold-500 shadow-xl shadow-reformedGold-500/10 scale-[1.01]'
                  : 'bg-white/70 dark:bg-reformedNavy-900/60 border-slate-200/80 dark:border-reformedNavy-800 hover:border-reformedGold-300 dark:hover:border-reformedNavy-700 hover:scale-[1.005]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-2xl bg-parchment-100 dark:bg-reformedNavy-800 border border-reformedGold-200/40 dark:border-reformedNavy-700">
                    {getIcon(plan.id, "w-5 h-5")}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border transition-colors ${
                      isSelected
                        ? 'bg-reformedGold-100 text-reformedGold-900 dark:bg-reformedGold-950/90 dark:text-reformedGold-200 border-reformedGold-300 dark:border-reformedGold-500/70 shadow-sm'
                        : 'bg-slate-100 text-slate-700 dark:bg-reformedNavy-800 dark:text-slate-300 border-slate-200 dark:border-reformedNavy-700'
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>

                <h3 className="display-title text-base font-bold tracking-wide text-slate-900 dark:text-reformedGold-100 mb-1.5">
                  {plan.title}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3 font-serif">
                  {plan.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-reformedNavy-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400 font-serif">
                  Porção diária:
                </span>
                <span className="font-bold text-slate-900 dark:text-reformedGold-200">
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
