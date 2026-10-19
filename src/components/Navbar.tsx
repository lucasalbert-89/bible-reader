import React from 'react';
import { BookOpen, Moon, Sun, User as UserIcon, Cloud, CloudOff, LogOut } from 'lucide-react';
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

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 dark:from-neonGreen dark:to-emerald-500 flex items-center justify-center text-white dark:text-black shadow-md dark:shadow-neon-green transition-transform hover:scale-105">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white uppercase">
                Bíblia <span className="text-emerald-600 dark:text-neonGreen">Planos</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-slate-800 text-emerald-800 dark:text-neonGreen uppercase tracking-wider">
                365 • 180 • 90
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Acompanhamento devocional e leitura diária
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Sync indicator (Cloud vs Local) */}
          {user ? (
            <div 
              title={syncedWithCloud ? "Progresso sincronizado na nuvem" : "Sincronizando..."}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-slate-900 border border-emerald-200 dark:border-neonGreen/30 text-xs font-semibold text-emerald-700 dark:text-neonGreen"
            >
              <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Nuvem Conectada'}</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400">
              <CloudOff className="w-3.5 h-3.5 text-amber-500" />
              <span>Modo Visitante (Local)</span>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            aria-label="Alternar tema"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-neonGreen hover:border-emerald-300 dark:hover:border-neonGreen/50 transition-all shadow-sm"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* User Auth Button */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                  {user.email}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-neonGreen font-semibold">
                  Progresso Salvo
                </span>
              </div>
              <button
                onClick={signOut}
                title="Sair da conta"
                className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-slate-900 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 dark:bg-neonGreen dark:hover:bg-emerald-400 text-white dark:text-black transition-all shadow-md dark:shadow-neon-green hover:scale-[1.02] active:scale-95"
            >
              <UserIcon className="w-4 h-4" />
              <span>Entrar / Salvar</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
