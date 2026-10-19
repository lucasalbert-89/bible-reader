import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PlanSelector } from './components/PlanSelector';
import { ProgressDashboard } from './components/ProgressDashboard';
import { MonthNavigation } from './components/MonthNavigation';
import { DayDetailModal } from './components/DayDetailModal';
import { AuthModal } from './components/AuthModal';
import { useReadingProgress } from './hooks/useReadingProgress';
import { getPlanDays } from './data/planGenerator';
import { DayReading } from './types';
import { Heart, BookOpen, Sparkles } from 'lucide-react';

export function App() {
  // Theme management
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('biblia_theme');
    if (saved) return saved === 'dark';
    return true; // Default to dark mode (matches original site)
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('biblia_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('biblia_theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  // Reading progress and active plan
  const {
    selectedPlan,
    setSelectedPlan,
    currentPlanInfo,
    completedDays,
    toggleDay,
    isDayCompleted,
    totalDays,
    progressPercentage,
    isSyncing,
    syncedWithCloud,
  } = useReadingProgress();

  // Active month navigation state (null = showing months overview)
  const [activeMonthIndex, setActiveMonthIndex] = useState<number | null>(null);

  // Active day reading modal
  const [selectedDayReading, setSelectedDayReading] = useState<DayReading | null>(null);

  // Auth modal
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // When plan changes, reset the active month to view overview
  const handleSelectPlan = (planId: typeof selectedPlan) => {
    setSelectedPlan(planId);
    setActiveMonthIndex(null);
  };

  // Open day detail modal
  const handleSelectDay = (globalDay: number) => {
    const allDays = getPlanDays(selectedPlan);
    const dayData = allDays.find(d => d.day === globalDay);
    if (dayData) {
      setSelectedDayReading(dayData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Top Navbar */}
      <Navbar
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        onOpenAuth={() => setIsAuthOpen(true)}
        isSyncing={isSyncing}
        syncedWithCloud={syncedWithCloud}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-12">
        
        {/* Hero Title Section */}
        <section className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-slate-900 border border-emerald-200 dark:border-neonGreen/30 text-emerald-800 dark:text-neonGreen text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Alimente sua fé diariamente</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            Planos de Leitura da Bíblia
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Escolha o ritmo que melhor se adapta à sua rotina: conclua a Escritura sagrada em <strong>365 dias</strong>, <strong>180 dias</strong> ou <strong>90 dias</strong>, com acompanhamento de progresso e reflexões para cada dia.
          </p>
        </section>

        {/* Plan Selector (365 / 180 / 90) */}
        <section>
          <PlanSelector
            selectedPlan={selectedPlan}
            onSelectPlan={handleSelectPlan}
          />
        </section>

        {/* Progress Dashboard */}
        <section>
          <ProgressDashboard
            planInfo={currentPlanInfo}
            completedCount={completedDays.length}
            totalDays={totalDays}
            percentage={progressPercentage}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        </section>

        {/* Months and Days Grid */}
        <section className="pt-2">
          <MonthNavigation
            planId={selectedPlan}
            completedDays={completedDays}
            activeMonthIndex={activeMonthIndex}
            onSelectMonth={setActiveMonthIndex}
            onSelectDay={handleSelectDay}
          />
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-950/50">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-neonGreen" />
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Bíblia Planos • 365, 180 e 90 Dias
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span>Desenvolvido para edificação espiritual</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>

          <div>
            <span>Pronto para GitHub, On Render & Supabase</span>
          </div>
        </div>
      </footer>

      {/* Day Detail Modal */}
      <DayDetailModal
        reading={selectedDayReading}
        planTitle={currentPlanInfo.title}
        isCompleted={selectedDayReading ? isDayCompleted(selectedDayReading.day) : false}
        onToggleComplete={(day) => toggleDay(day)}
        onClose={() => setSelectedDayReading(null)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

    </div>
  );
}

export default App;
