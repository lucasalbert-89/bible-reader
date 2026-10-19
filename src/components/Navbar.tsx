import React, { useState } from 'react';
import { BookOpen, Moon, Sun, User as UserIcon, Cloud, CloudOff, LogOut, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  onOpenAuth: () => void;
  isSyncing: boolean;
  syncedWithCloud: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleTheme,
  onOpenAuth,
  isSyncing,
  syncedWithCloud,
}) => {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/85 dark:bg-slate-950/85 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 dark:from-neonGreen dark:to-emerald-500 flex items-center justify-center text-white dark:text-black shadow-md dark:shadow-neon-green transition-transform active:scale-95">
            <BookOpen className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-black text-base sm:text-xl tracking-tight text-slate-900 dark:text-white uppercase">
                Bíblia <span className="text-emerald-600 dark:text-neonGreen">Planos</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-slate-800 text-emerald-800 dark:text-neonGreen uppercase tracking-wider">
                365 • 180 • 90
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Acompanhamento devocional e leitura diária
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Cloud Sync indicator */}
          {user ? (
            <div 
              title={syncedWithCloud ? "Progresso sincronizado na nuvem" : "Sincronizando..."}
              className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-emerald-50 dark:bg-slate-900 border border-emerald-200 dark:border-neonGreen/30 text-[11px] sm:text-xs font-semibold text-emerald-700 dark:text-neonGreen"
            >
              <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce text-emerald-500' : 'text-emerald-600 dark:text-neonGreen'}`} />
              <span className="hidden md:inline">{isSyncing ? 'Sincronizando...' : 'Nuvem Conectada'}</span>
              <span className="md:hidden text-[10px] font-bold">Nuvem</span>
            </div>
          ) : (
            <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <CloudOff className="w-3 h-3 text-amber-500" />
              <span className="hidden sm:inline">Visitante (Local)</span>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            aria-label="Alternar tema"
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-neonGreen hover:border-emerald-300 dark:hover:border-neonGreen/50 transition-all flex items-center justify-center shadow-sm active:scale-95"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* User Auth Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 transition-all shadow-sm active:scale-95"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-600 dark:bg-neonGreen text-white dark:text-black flex items-center justify-center font-bold text-xs uppercase">
                  {user.email ? user.email.charAt(0) : 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                    {user.email}
                  </span>
                  <span className="text-[9px] text-emerald-600 dark:text-neonGreen font-semibold flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> Salvo
                  </span>
                </div>
              </button>

              {/* Mobile / Desktop Dropdown Menu */}
              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-2 py-1.5 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Conectado como</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                      {user.email}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair da Conta</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 dark:bg-neonGreen dark:hover:bg-emerald-400 text-white dark:text-black transition-all shadow-md dark:shadow-neon-green active:scale-95"
            >
              <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Entrar</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
