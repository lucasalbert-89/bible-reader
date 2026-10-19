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
  const getIcon = (id: PlanId) => {
    switch (id) {
      case 'plano-365':
        return <Calendar className="w-5 h-5 text-emerald-600 dark:text-neonGreen" />;
      case 'plano-180':
        return <Clock className="w-5 h-5 text-amber-500 dark:text-neonOrange" />;
      case 'plano-90':
        return <Flame className="w-5 h-5 text-rose-500 dark:text-red-400" />;
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            Escolha seu Plano de Leitura
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Alterne entre os ritmos a qualquer momento; o progresso de cada plano é salvo individualmente.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
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
              {/* Header badge & icon */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800">
                    {getIcon(plan.id)}
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

              {/* Rhythm footer */}
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
