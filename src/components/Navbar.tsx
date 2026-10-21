import React, { useState } from 'react';
import { BookOpen, Moon, Sun, User as UserIcon, Cloud, CloudOff, LogOut, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  onOpenAuth: () => void;
  onOpenProfile?: () => void;
  onOpenBibleReader?: () => void;
  isSyncing: boolean;
  syncedWithCloud: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleTheme,
  onOpenAuth,
  onOpenProfile,
  onOpenBibleReader,
  isSyncing,
  syncedWithCloud,
}) => {
  const { user, fullName, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const firstName = fullName 
    ? fullName.trim().split(' ')[0] 
    : (user?.email ? user.email.split('@')[0] : 'Leitor');

  const avatarChar = fullName 
    ? fullName.trim().charAt(0).toUpperCase() 
    : (user?.email ? user.email.charAt(0).toUpperCase() : 'R');

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-parchment-50/90 dark:bg-reformedNavy-950/90 border-b border-reformedGold-200/50 dark:border-reformedGold-600/20 transition-colors">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-reformedGold-500 to-reformedGold-700 flex items-center justify-center text-white shadow-md shadow-reformedGold-500/20 transition-transform active:scale-95">
            <BookOpen className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="display-title font-black text-base sm:text-xl tracking-wider text-slate-900 dark:text-reformedGold-100 uppercase">
                Bíblia <span className="text-reformedGold-600 dark:text-reformedGold-500">Planos</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full bg-reformedGold-100 dark:bg-reformedNavy-800 text-reformedGold-700 dark:text-reformedGold-400 border border-reformedGold-300/60 dark:border-reformedGold-600/30 uppercase tracking-widest">
                Soli Deo Gloria
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 hidden sm:block italic font-serif">
              Post Tenebras Lux • A Aliança das Escrituras em Leitura Diária
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Cloud Sync indicator */}
          {user ? (
            <div 
              title={syncedWithCloud ? "Progresso salvo na nuvem com segurança" : "Sincronizando..."}
              className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-reformedGold-50 dark:bg-reformedNavy-900 border border-reformedGold-200 dark:border-reformedGold-500/30 text-[11px] sm:text-xs font-semibold text-reformedGold-700 dark:text-reformedGold-400"
            >
              <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce text-reformedGold-500' : 'text-reformedGold-600 dark:text-reformedGold-400'}`} />
              <span className="hidden md:inline">{isSyncing ? 'Sincronizando...' : 'Nuvem Conectada'}</span>
              <span className="md:hidden text-[10px] font-bold">Nuvem</span>
            </div>
          ) : (
            <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-reformedNavy-900 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <CloudOff className="w-3 h-3 text-amber-600" />
              <span className="hidden sm:inline">Modo Visitante (Local)</span>
            </div>
          )}

          {/* Bible Reader Quick Access Button */}
          {onOpenBibleReader && (
            <button
              onClick={onOpenBibleReader}
              aria-label="Abrir Bíblia"
              title="Abrir Leitor da Bíblia (NVI / NAA / ACF)"
              className="h-10 px-3 rounded-xl border border-reformedGold-300/80 dark:border-reformedGold-600/40 bg-gradient-to-r from-reformedGold-50 to-amber-50 dark:from-reformedNavy-900 dark:to-reformedNavy-800 text-reformedGold-800 dark:text-reformedGold-200 hover:border-reformedGold-500 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 text-xs font-bold"
            >
              <BookOpen className="w-4 h-4 text-reformedGold-600 dark:text-reformedGold-400" />
              <span className="hidden sm:inline">Bíblia</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            aria-label="Alternar tema"
            className="w-10 h-10 rounded-xl border border-reformedGold-200/80 dark:border-reformedNavy-700 bg-white dark:bg-reformedNavy-900 text-slate-700 dark:text-reformedGold-200 hover:text-reformedGold-600 dark:hover:text-reformedGold-400 hover:border-reformedGold-400 transition-all flex items-center justify-center shadow-sm active:scale-95"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* User Auth Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-reformedGold-200/80 dark:border-reformedNavy-700 bg-white dark:bg-reformedNavy-900 hover:border-reformedGold-400 transition-all shadow-sm active:scale-95"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-reformedGold-500 to-reformedGold-700 text-white flex items-center justify-center font-black text-xs uppercase shadow-sm">
                  {avatarChar}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                    Olá, {firstName}
                  </span>
                  <span className="text-[9px] text-reformedGold-600 dark:text-reformedGold-400 font-semibold flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> Área Pessoal
                  </span>
                </div>
              </button>

              {/* Mobile / Desktop Dropdown Menu */}
              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-reformedNavy-900 border border-slate-200 dark:border-reformedNavy-700 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 font-sans"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-2.5 py-2 mb-2 border-b border-slate-100 dark:border-reformedNavy-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                      Leitor Conectado
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                      {fullName || user.email}
                    </span>
                    {fullName && (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                        {user.email}
                      </span>
                    )}
                  </div>

                  {/* Open Profile Modal */}
                  {onOpenProfile && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenProfile();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 bg-reformedGold-50/70 dark:bg-reformedNavy-800 hover:bg-reformedGold-100 dark:hover:bg-reformedNavy-700 border border-reformedGold-200/50 dark:border-reformedNavy-700 transition-all mb-1.5"
                    >
                      <UserIcon className="w-4 h-4 text-reformedGold-600 dark:text-reformedGold-400" />
                      <span>Minha Área & Progresso</span>
                    </button>
                  )}

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
              className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-reformedGold-600 hover:bg-reformedGold-700 text-white transition-all shadow-md shadow-reformedGold-600/25 active:scale-95"
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
