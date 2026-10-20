import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PlanSelector } from './components/PlanSelector';
import { ProgressDashboard } from './components/ProgressDashboard';
import { MonthNavigation } from './components/MonthNavigation';
import { DayDetailModal } from './components/DayDetailModal';
import { AuthModal } from './components/AuthModal';
import { BibleReaderModal, BibleTargetPointer } from './components/BibleReaderModal';
import { useReadingProgress } from './hooks/useReadingProgress';
import { getPlanDays } from './data/planGenerator';
import { DayReading } from './types';
import { BookOpen, Scroll, Shield } from 'lucide-react';

export function App() {
  // Theme management
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('biblia_theme');
    if (saved) return saved === 'dark';
    return true; // Default to dark mode (Reformed Navy)
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

  // Bible Reader modal state
  const [isBibleReaderOpen, setIsBibleReaderOpen] = useState(false);
  const [readerInitialLocation, setReaderInitialLocation] = useState<{ book: string; chapter: number }>({
    book: 'Gênesis',
    chapter: 1,
  });
  const [readerDayPortions, setReaderDayPortions] = useState<BibleTargetPointer[]>([]);
  const [readerDayNumber, setReaderDayNumber] = useState<number | undefined>(undefined);

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

  // Open Bible Reader with specific book and chapter (and optional day portions)
  const handleOpenReader = (bookName = 'Gênesis', chapter = 1, dayNumber?: number) => {
    setReaderInitialLocation({ book: bookName, chapter });
    setReaderDayNumber(dayNumber);

    if (dayNumber !== undefined) {
      const allDays = getPlanDays(selectedPlan);
      const dayData = allDays.find(d => d.day === dayNumber);
      if (dayData) {
        const portions: BibleTargetPointer[] = [];
        for (const seg of dayData.segments) {
          if (seg.bookName && seg.chapterNumbers) {
            for (const ch of seg.chapterNumbers) {
              portions.push({ bookName: seg.bookName, chapter: ch });
            }
          }
        }
        setReaderDayPortions(portions);
      } else {
        setReaderDayPortions([]);
      }
    } else {
      setReaderDayPortions([]);
    }

    setIsBibleReaderOpen(true);
  };

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-reformedNavy-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Top Navbar */}
      <Navbar
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenBibleReader={() => handleOpenReader('Gênesis', 1)}
        isSyncing={isSyncing}
        syncedWithCloud={syncedWithCloud}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 py-6 sm:py-10 space-y-7 sm:space-y-10">
        
        {/* Reformed Heritage Banner: Os Cinco Solas */}
        <section className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-reformedGold-100 dark:bg-reformedNavy-900 border border-reformedGold-300/50 dark:border-reformedGold-600/30 text-reformedGold-800 dark:text-reformedGold-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-sm">
            <Shield className="w-3.5 h-3.5 text-reformedGold-600" />
            <span>Sola Scriptura • Sola Gratia • Sola Fide • Solus Christus • Soli Deo Gloria</span>
          </div>

          <h1 className="display-title text-2xl sm:text-5xl font-extrabold uppercase tracking-wide text-slate-900 dark:text-reformedGold-100">
            A Aliança das Escrituras
          </h1>

          <p className="text-xs sm:text-base text-slate-700 dark:text-slate-300 font-serif italic leading-relaxed max-w-2xl mx-auto">
            "Toda a Escritura é divinamente inspirada e suficiente para a instrução na justiça." Percorra todo o conselho de Deus através dos planos sistemáticos de <strong>365 dias</strong>, <strong>180 dias</strong> ou <strong>90 dias</strong>, com meditações firmadas na graça soberana do Senhor.
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

      {/* Reformed Footer */}
      <footer className="w-full border-t border-reformedGold-200/50 dark:border-reformedNavy-800 py-8 text-center text-xs text-slate-600 dark:text-slate-400 bg-white/60 dark:bg-reformedNavy-900/60">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-reformedGold-600 dark:text-reformedGold-400" />
            <span className="font-bold text-slate-800 dark:text-reformedGold-200 font-serif">
              Post Tenebras Lux • Bíblia Planos
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-serif italic">
            <Scroll className="w-3.5 h-3.5 text-reformedGold-500 inline" />
            <span>"O fim principal do homem é glorificar a Deus e gozá-lo para sempre." (Breve de Westminster)</span>
          </div>

          <div>
            <span className="display-title font-bold text-reformedGold-700 dark:text-reformedGold-400">
              Soli Deo Gloria
            </span>
          </div>
        </div>
      </footer>

      {/* Day Detail Modal */}
      <DayDetailModal
        reading={selectedDayReading}
        planId={selectedPlan}
        planTitle={currentPlanInfo.title}
        isCompleted={selectedDayReading ? isDayCompleted(selectedDayReading.day) : false}
        onToggleComplete={(day) => toggleDay(day)}
        onOpenReader={(book, chapter) => handleOpenReader(book, chapter, selectedDayReading?.day)}
        onClose={() => setSelectedDayReading(null)}
      />

      {/* Bible Reader Modal (NVI / NAA / ACF) */}
      <BibleReaderModal
        isOpen={isBibleReaderOpen}
        onClose={() => setIsBibleReaderOpen(false)}
        initialBook={readerInitialLocation.book}
        initialChapter={readerInitialLocation.chapter}
        dayPortions={readerDayPortions}
        dayNumber={readerDayNumber}
        isDayCompleted={readerDayNumber !== undefined ? isDayCompleted(readerDayNumber) : false}
        onToggleDayComplete={(day) => toggleDay(day)}
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
