import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, UserPlus, LogIn, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp, isSupabaseReady } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Por favor, preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error.message === 'Invalid login credentials' 
            ? 'E-mail ou senha incorretos.' 
            : error.message);
        } else {
          setSuccessMsg('Login realizado com sucesso! Sincronizando progresso...');
          setTimeout(() => {
            onClose();
          }, 1200);
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Conta criada com sucesso! Verifique seu e-mail caso seja necessária confirmação.');
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[32px] w-full max-w-md shadow-2xl transition-all border border-slate-200 dark:border-slate-800 p-5 sm:p-8 relative overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100 dark:bg-slate-800 text-emerald-600 dark:text-neonGreen flex items-center justify-center mx-auto mb-2.5 sm:mb-3 shadow-sm">
            <Lock className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {mode === 'signin' ? 'Acessar Conta' : 'Criar Nova Conta'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'signin'
              ? 'Entre para sincronizar seu progresso de leitura na nuvem'
              : 'Cadastre-se para nunca perder seus dias concluídos'}
          </p>
        </div>

        {/* Warning if Supabase is not yet connected with env */}
        {!isSupabaseReady && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs leading-relaxed flex items-start gap-2.5">
            <KeyRound className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Atenção:</span>
              Credenciais do Supabase ausentes no arquivo <code className="font-mono bg-amber-500/20 px-1 py-0.5 rounded">.env</code>.
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mb-3.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="mb-3.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-neonGreen text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-1">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-base focus:outline-none focus:border-emerald-500 dark:focus:border-neonGreen transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-1">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-base focus:outline-none focus:border-emerald-500 dark:focus:border-neonGreen transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 dark:bg-neonGreen dark:hover:bg-emerald-400 text-white dark:text-black transition-all shadow-md dark:shadow-neon-green disabled:opacity-50 active:scale-98 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span>Processando...</span>
            ) : mode === 'signin' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Criar Conta</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          {mode === 'signin' ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Não tem conta?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                }}
                className="font-bold text-emerald-600 dark:text-neonGreen hover:underline ml-1"
              >
                Cadastre-se grátis
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Já possui conta?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                }}
                className="font-bold text-emerald-600 dark:text-neonGreen hover:underline ml-1"
              >
                Faça login
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
