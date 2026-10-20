import React, { useState, useEffect, useRef } from 'react';
import { BibleVersionId } from '../types';
import { 
  BIBLE_VERSIONS, 
  getChapterData, 
  getNextChapter, 
  getPrevChapter, 
  getSavedBibleVersion, 
  saveBibleVersion,
  ChapterData
} from '../services/bibleService';
import { BIBLE_BOOKS } from '../data/bibleStructure';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  CheckCircle2, 
  Type, 
  BookOpen, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

export interface BibleTargetPointer {
  bookName: string;
  chapter: number;
}

interface BibleReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBook?: string;
  initialChapter?: number;
  dayPortions?: BibleTargetPointer[]; // If opened from a day's reading
  dayNumber?: number;
  isDayCompleted?: boolean;
  onToggleDayComplete?: (day: number) => void;
}

export const BibleReaderModal: React.FC<BibleReaderModalProps> = ({
  isOpen,
  onClose,
  initialBook = 'Gênesis',
  initialChapter = 1,
  dayPortions = [],
  dayNumber,
  isDayCompleted = false,
  onToggleDayComplete,
}) => {
  // Version state
  const [version, setVersion] = useState<BibleVersionId>(() => getSavedBibleVersion());
  
  // Current reading location
  const [currentBook, setCurrentBook] = useState<string>(initialBook);
  const [currentChapter, setCurrentChapter] = useState<number>(initialChapter);
  
  // Chapter content
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Visual settings
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(() => {
    const saved = localStorage.getItem('biblia_font_size');
    return saved ? parseInt(saved, 10) : 1; // 0=small, 1=medium, 2=large, 3=xlarge
  });
  const [isSerif, setIsSerif] = useState<boolean>(() => {
    const saved = localStorage.getItem('biblia_font_family');
    return saved ? saved === 'serif' : true;
  });

  // UI state
  const [copiedVerseIndex, setCopiedVerseIndex] = useState<number | null>(null);
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);
  const [showBookSelector, setShowBookSelector] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // Sync initial props when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentBook(initialBook);
      setCurrentChapter(initialChapter);
    }
  }, [isOpen, initialBook, initialChapter]);

  // Load chapter content whenever book, chapter, or version changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    getChapterData(version, currentBook, currentChapter)
      .then(data => {
        if (isMounted) {
          setChapterData(data);
          setIsLoading(false);
          // Scroll content to top when chapter changes
          if (contentRef.current) {
            contentRef.current.scrollTop = 0;
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoadError('Não foi possível carregar o texto deste capítulo.');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, currentBook, currentChapter, version]);

  if (!isOpen) return null;

  const handleSelectVersion = (newVersion: BibleVersionId) => {
    setVersion(newVersion);
    saveBibleVersion(newVersion);
    setShowVersionDropdown(false);
  };

  const handleNextChapter = () => {
    if (!chapterData) return;
    const next = getNextChapter(chapterData.bookIndex, chapterData.chapter);
    if (next) {
      setCurrentBook(next.bookName);
      setCurrentChapter(next.chapter);
    }
  };

  const handlePrevChapter = () => {
    if (!chapterData) return;
    const prev = getPrevChapter(chapterData.bookIndex, chapterData.chapter);
    if (prev) {
      setCurrentBook(prev.bookName);
      setCurrentChapter(prev.chapter);
    }
  };

  const handleCopyVerse = (verseText: string, verseNum: number) => {
    const text = `"${verseText}" — ${currentBook} ${currentChapter}:${verseNum} (${version.toUpperCase()})`;
    navigator.clipboard.writeText(text);
    setCopiedVerseIndex(verseNum);
    setTimeout(() => setCopiedVerseIndex(null), 2000);
  };

  const cycleFontSize = () => {
    const next = (fontSizeLevel + 1) % 4;
    setFontSizeLevel(next);
    localStorage.setItem('biblia_font_size', next.toString());
  };

  const toggleFontFamily = () => {
    const next = !isSerif;
    setIsSerif(next);
    localStorage.setItem('biblia_font_family', next ? 'serif' : 'sans');
  };

  // Font size classes
  const fontSizes = [
    'text-base leading-relaxed',
    'text-lg leading-relaxed sm:text-xl sm:leading-relaxed',
    'text-xl leading-relaxed sm:text-2xl sm:leading-relaxed',
    'text-2xl leading-loose sm:text-3xl sm:leading-loose'
  ];

  const currentVersionInfo = BIBLE_VERSIONS.find(v => v.id === version) || BIBLE_VERSIONS[0];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-backdrop-enter"
      onClick={onClose}
    >
      <div 
        className="bg-parchment-50 dark:bg-reformedNavy-900 w-full sm:max-w-4xl h-full sm:h-[94vh] sm:rounded-3xl shadow-2xl transition-all border border-reformedGold-300/60 dark:border-reformedGold-600/30 flex flex-col overflow-hidden animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Control Bar */}
        <header className="p-3 sm:p-4 border-b border-reformedGold-200/60 dark:border-reformedNavy-800 bg-white/80 dark:bg-reformedNavy-950/90 backdrop-blur-md flex flex-col gap-2.5 shrink-0 z-20">
          
          <div className="flex items-center justify-between gap-2">
            
            {/* Book & Chapter Indicator with Selector Trigger */}
            <div className="flex items-center gap-2 min-w-0">
              <button 
                onClick={() => setShowBookSelector(!showBookSelector)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-parchment-100 dark:bg-reformedNavy-800 border border-reformedGold-300/60 dark:border-reformedGold-700/50 hover:border-reformedGold-500 transition-all text-left"
                title="Trocar de Livro ou Capítulo"
              >
                <BookOpen className="w-4 h-4 text-reformedGold-600 dark:text-reformedGold-400 shrink-0" />
                <span className="font-serif font-bold text-slate-900 dark:text-reformedGold-100 text-sm sm:text-base truncate">
                  {currentBook} {currentChapter}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Version Selector Dropdown Trigger */}
              <div className="relative">
                <button
                  onClick={() => setShowVersionDropdown(!showVersionDropdown)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-reformedGold-500 hover:bg-reformedGold-600 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                  title="Mudar Versão Bíblica"
                >
                  <span>{currentVersionInfo.name}</span>
                  <ChevronDown className="w-3 h-3 text-white/80" />
                </button>

                {/* Version Selector Dropdown */}
                {showVersionDropdown && (
                  <div className="absolute left-0 mt-1.5 w-64 bg-white dark:bg-reformedNavy-800 rounded-2xl shadow-2xl border border-reformedGold-200 dark:border-reformedNavy-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-1.5 border-b border-slate-100 dark:border-reformedNavy-700">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Escolha a Tradução
                      </span>
                    </div>
                    {BIBLE_VERSIONS.map(v => (
                      <button
                        key={v.id}
                        onClick={() => handleSelectVersion(v.id)}
                        className={`w-full px-3 py-2 text-left flex items-start gap-2.5 hover:bg-reformedGold-50 dark:hover:bg-reformedNavy-700/80 transition-colors ${
                          version === v.id ? 'bg-reformedGold-100/60 dark:bg-reformedNavy-700 text-reformedGold-700 dark:text-reformedGold-300' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs sm:text-sm">{v.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-reformedNavy-900 text-slate-500 dark:text-slate-400">
                              {v.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                            {v.fullName}
                          </p>
                        </div>
                        {version === v.id && <Check className="w-4 h-4 text-reformedGold-600 shrink-0 mt-0.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Reading Settings & Close */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Font Family Toggle */}
              <button
                onClick={toggleFontFamily}
                className="w-9 h-9 rounded-xl bg-parchment-100 dark:bg-reformedNavy-800 border border-slate-200 dark:border-reformedNavy-700 hover:border-reformedGold-400 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold transition-all"
                title={isSerif ? 'Mudar para fonte sem serifa' : 'Mudar para fonte serifada'}
              >
                {isSerif ? 'Serif' : 'Sans'}
              </button>

              {/* Font Size Cycle */}
              <button
                onClick={cycleFontSize}
                className="w-9 h-9 rounded-xl bg-parchment-100 dark:bg-reformedNavy-800 border border-slate-200 dark:border-reformedNavy-700 hover:border-reformedGold-400 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-all"
                title="Ajustar tamanho da fonte"
              >
                <Type className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                aria-label="Fechar Leitor"
                className="w-9 h-9 rounded-xl hover:bg-slate-200/60 dark:hover:bg-reformedNavy-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors flex items-center justify-center active:scale-95 ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

          </div>

          {/* Quick Chapters / Day Portions Bar */}
          {dayPortions.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 hidden sm:inline">
                Leituras do Dia:
              </span>
              {dayPortions.map((portion, idx) => {
                const isActive = portion.bookName === currentBook && portion.chapter === currentChapter;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentBook(portion.bookName);
                      setCurrentChapter(portion.chapter);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-reformedGold-600 text-white shadow-sm'
                        : 'bg-parchment-100 dark:bg-reformedNavy-800 text-slate-600 dark:text-slate-300 hover:bg-reformedGold-100 dark:hover:bg-reformedNavy-700 border border-slate-200/60 dark:border-reformedNavy-700'
                    }`}
                  >
                    {portion.bookName} {portion.chapter}
                  </button>
                );
              })}
            </div>
          )}

        </header>

        {/* Book Selector Drawer (Overlay) */}
        {showBookSelector && (
          <div className="p-4 bg-white dark:bg-reformedNavy-950 border-b border-reformedGold-200 dark:border-reformedNavy-800 max-h-72 overflow-y-auto z-10 animate-in slide-in-from-top duration-150">
            <div className="flex justify-between items-center mb-3">
              <h5 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Selecione o Livro e Capítulo
              </h5>
              <button 
                onClick={() => setShowBookSelector(false)}
                className="text-xs font-bold text-reformedGold-600 hover:underline"
              >
                Fechar
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
              {BIBLE_BOOKS.map(b => (
                <button
                  key={b.name}
                  onClick={() => {
                    setCurrentBook(b.name);
                    setCurrentChapter(1);
                    setShowBookSelector(false);
                  }}
                  className={`p-2 rounded-xl text-left text-xs font-bold truncate transition-all ${
                    currentBook === b.name
                      ? 'bg-reformedGold-600 text-white'
                      : 'bg-parchment-100 dark:bg-reformedNavy-800 text-slate-700 dark:text-slate-300 hover:bg-reformedGold-100 dark:hover:bg-reformedNavy-700'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scrollable Reading Content */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto p-4 sm:p-10 space-y-6 overscroll-contain"
        >
          {/* Chapter Title Card */}
          <div className="text-center max-w-2xl mx-auto pb-4 border-b border-reformedGold-200/60 dark:border-reformedNavy-800">
            <span className="text-[10px] sm:text-xs font-black uppercase text-reformedGold-600 dark:text-reformedGold-400 tracking-[0.25em] block mb-1">
              {currentVersionInfo.fullName} ({currentVersionInfo.name})
            </span>
            <h2 className="display-title text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-reformedGold-100 tracking-tight">
              {currentBook} {currentChapter}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1 font-serif">
              Capítulo {currentChapter} de {chapterData?.totalChapters || ''}
            </p>
          </div>

          {/* Loading or Error State */}
          {isLoading && (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-reformedGold-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-serif italic text-slate-500">
                Carregando texto das Sagradas Escrituras em {currentVersionInfo.name}...
              </p>
            </div>
          )}

          {loadError && (
            <div className="p-6 text-center text-rose-500 font-sans space-y-2">
              <p>{loadError}</p>
              <button
                onClick={() => handleSelectVersion('nvi')}
                className="text-xs underline text-reformedGold-600 font-bold"
              >
                Tentar carregar em NVI
              </button>
            </div>
          )}

          {/* Verses Container */}
          {!isLoading && !loadError && chapterData && (
            <div className={`max-w-2xl mx-auto space-y-3.5 text-slate-800 dark:text-slate-200 ${isSerif ? 'font-serif' : 'font-sans'} ${fontSizes[fontSizeLevel]}`}>
              {chapterData.verses.map((verseText, idx) => {
                const verseNumber = idx + 1;
                const isJustCopied = copiedVerseIndex === verseNumber;

                return (
                  <p 
                    key={verseNumber}
                    onClick={() => handleCopyVerse(verseText, verseNumber)}
                    className="relative group rounded-xl p-2 -mx-2 transition-colors hover:bg-reformedGold-100/40 dark:hover:bg-reformedNavy-800/50 cursor-pointer"
                    title="Clique para copiar este versículo"
                  >
                    <sup className="font-sans font-bold text-[11px] text-reformedGold-600 dark:text-reformedGold-400 mr-2 select-none">
                      {verseNumber}
                    </sup>
                    <span className="selection:bg-reformedGold-300 dark:selection:bg-reformedGold-800">
                      {verseText}
                    </span>

                    {/* Copy Feedback Tooltip */}
                    {isJustCopied && (
                      <span className="inline-flex items-center gap-1 ml-2 text-[10px] font-sans font-bold text-reformedGreen-600 dark:text-reformedGreen-400 bg-reformedGreen-50 dark:bg-reformedGreen-950/80 px-2 py-0.5 rounded-full border border-reformedGreen-300 dark:border-reformedGreen-700 animate-in fade-in">
                        <Check className="w-3 h-3" />
                        Copiado!
                      </span>
                    )}
                  </p>
                );
              })}
            </div>
          )}

          {/* End of Chapter Marker */}
          {!isLoading && chapterData && (
            <div className="pt-8 text-center border-t border-reformedGold-200/60 dark:border-reformedNavy-800 max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-serif italic text-slate-500 dark:text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-reformedGold-500" />
                <span>"Lâmpada para os meus pés é a tua palavra e luz, para o meu caminho." (Salmo 119:105)</span>
              </div>

              {/* Day completion button if part of a plan day */}
              {dayNumber !== undefined && onToggleDayComplete && (
                <div className="pt-2">
                  <button
                    onClick={() => onToggleDayComplete(dayNumber)}
                    className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-2 active:scale-95 ${
                      isDayCompleted
                        ? 'bg-parchment-100 dark:bg-reformedNavy-800 text-reformedGold-700 dark:text-reformedGold-400 border border-reformedGold-400/50'
                        : 'bg-reformedGold-600 hover:bg-reformedGold-700 text-white shadow-reformedGold-600/30'
                    }`}
                  >
                    {isDayCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-reformedGold-600" />
                        <span>Dia {dayNumber} Marcado como Concluído!</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Concluir Leitura do Dia {dayNumber}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Bottom Navigation Bar */}
        <footer className="p-3 sm:p-4 border-t border-reformedGold-200/60 dark:border-reformedNavy-800 bg-white/95 dark:bg-reformedNavy-950/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
          
          <button
            onClick={handlePrevChapter}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-parchment-100 dark:bg-reformedNavy-800 hover:bg-reformedGold-100 dark:hover:bg-reformedNavy-700 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-all border border-slate-200/60 dark:border-reformedNavy-700 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Capítulo Anterior</span>
          </button>

          <span className="font-serif italic text-xs text-slate-500 dark:text-slate-400 truncate max-w-[140px] sm:max-w-none text-center">
            {currentBook} {currentChapter} ({currentVersionInfo.name})
          </span>

          <button
            onClick={handleNextChapter}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-reformedGold-600 hover:bg-reformedGold-700 text-white font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95"
          >
            <span>Próximo Capítulo</span>
            <ChevronRight className="w-4 h-4" />
          </button>

        </footer>

      </div>
    </div>
  );
};
