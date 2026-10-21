import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Lock,
  Mail,
  UserPlus,
  LogIn,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  User,
  Calendar,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'forgot' | 'update_password';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const {
    signIn,
    signUp,
    resetPasswordForEmail,
    updatePassword,
    isSupabaseReady,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'update_password'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // MODE: FORGOT PASSWORD
    if (mode === 'forgot') {
      if (!email.trim()) {
        setErrorMsg('Por favor, informe seu e-mail cadastrado.');
        return;
      }

      setLoading(true);
      try {
        const { error } = await resetPasswordForEmail(email.trim());
        if (error) {
          if (error.message?.toLowerCase().includes('rate limit') || (error as any).status === 429) {
            setErrorMsg(
              'Limite temporário de envios por hora do Supabase atingido (plano gratuito). Aguarde alguns minutos ou verifique se o e-mail anterior já chegou na sua caixa de entrada ou spam.'
            );
          } else {
            setErrorMsg(error.message);
          }
        } else {
          setSuccessMsg(
            'Link de recuperação enviado com sucesso! Verifique sua caixa de entrada e também a pasta de SPAM / Lixo Eletrônico.'
          );
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Ocorreu um erro ao enviar e-mail de recuperação.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // MODE: UPDATE PASSWORD (AFTER RECOVERY LINK CLICKED)
    if (mode === 'update_password') {
      if (newPassword.length < 6) {
        setErrorMsg('A nova senha precisa ter pelo menos 6 caracteres.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('As senhas digitadas não coincidem.');
        return;
      }

      setLoading(true);
      try {
        const { error } = await updatePassword(newPassword);
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Sua senha foi redefinida com sucesso! Você já está conectado.');
          setTimeout(() => {
            onClose();
          }, 1800);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Ocorreu um erro ao atualizar sua senha.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // MODE: SIGNUP VALIDATIONS
    if (mode === 'signup' && !fullName.trim()) {
      setErrorMsg('Por favor, informe seu nome completo para personalizarmos sua jornada.');
      return;
    }

    // GENERAL SIGNIN / SIGNUP
    if (!email || !password) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
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
          setErrorMsg(
            error.message === 'Invalid login credentials'
              ? 'E-mail ou senha incorretos.'
              : error.message
          );
        } else {
          setSuccessMsg('Login realizado com sucesso! Sincronizando progresso...');
          setTimeout(() => {
            onClose();
          }, 1200);
        }
      } else {
        const { error } = await signUp(email, password, fullName.trim(), birthDate);
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Conta criada com sucesso! Seja muito bem-vindo(a).');
          setTimeout(() => {
            onClose();
          }, 1600);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-backdrop-enter"
      onClick={onClose}
    >
      <div
        className="bg-parchment-50 dark:bg-reformedNavy-900 rounded-[28px] sm:rounded-[32px] w-full max-w-md shadow-2xl transition-all border border-reformedGold-300/60 dark:border-reformedGold-600/30 p-5 sm:p-8 relative overflow-hidden animate-modal-enter my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-reformedNavy-800 transition-colors flex items-center justify-center active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-reformedGold-100 dark:bg-reformedNavy-800 text-reformedGold-600 dark:text-reformedGold-400 flex items-center justify-center mx-auto mb-2.5 sm:mb-3 shadow-sm border border-reformedGold-300/40">
            {mode === 'forgot' ? (
              <KeyRound className="w-6 h-6 sm:w-7 sm:h-7" />
            ) : (
              <Lock className="w-6 h-6 sm:w-7 sm:h-7" />
            )}
          </div>
          <h3 className="display-title text-xl sm:text-2xl font-bold text-slate-900 dark:text-reformedGold-100 uppercase tracking-wide">
            {mode === 'signin'
              ? 'Acessar Conta'
              : mode === 'signup'
              ? 'Criar Nova Conta'
              : mode === 'forgot'
              ? 'Recuperar Senha'
              : 'Definir Nova Senha'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-serif italic">
            {mode === 'signin'
              ? 'Entre para sincronizar sua caminhada nas Escrituras'
              : mode === 'signup'
              ? 'Cadastre-se para preservar suas meditações na nuvem'
              : mode === 'forgot'
              ? 'Informe seu e-mail para receber as instruções de recuperação'
              : 'Crie uma nova senha segura para acessar sua conta'}
          </p>
        </div>

        {/* Warning if Supabase is not ready */}
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
          <div className="mb-3.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2 leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="mb-3.5 p-3 rounded-xl bg-reformedGreen-50 dark:bg-reformedNavy-800 border border-reformedGreen-200 dark:border-reformedGreen-700 text-reformedGreen-800 dark:text-emerald-300 text-xs flex items-start gap-2 leading-relaxed">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* SIGNUP FIELDS */}
          {mode === 'signup' && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-1 font-sans">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo Silva"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-reformedNavy-950 border border-slate-200 dark:border-reformedNavy-700 text-slate-900 dark:text-white placeholder-slate-400 text-base focus:outline-none focus:border-reformedGold-500 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Birth Date (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider font-sans">
                    Data de Nascimento
                  </label>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans italic">
                    Opcional
                  </span>
                </div>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-reformedNavy-950 border border-slate-200 dark:border-reformedNavy-700 text-slate-900 dark:text-white placeholder-slate-400 text-base focus:outline-none focus:border-reformedGold-500 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Privacy notice banner */}
              <div className="p-2.5 rounded-xl bg-reformedGold-500/10 border border-reformedGold-500/20 text-reformedGold-800 dark:text-reformedGold-300 text-[11px] flex items-start gap-2 leading-snug">
                <ShieldCheck className="w-4 h-4 shrink-0 text-reformedGold-600 dark:text-reformedGold-400 mt-0.5" />
                <span>
                  <strong>Privacidade garantida:</strong> Não solicitamos CPF, documentos ou dados sensíveis. Apenas seu nome para acolher sua jornada.
                </span>
              </div>
            </>
          )}

          {/* EMAIL FIELD (SIGNIN, SIGNUP, FORGOT) */}
          {mode !== 'update_password' && (
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-1 font-sans">
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
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-reformedNavy-950 border border-slate-200 dark:border-reformedNavy-700 text-slate-900 dark:text-white placeholder-slate-400 text-base focus:outline-none focus:border-reformedGold-500 transition-all font-sans"
                />
              </div>
            </div>
          )}

          {/* PASSWORD FIELD (SIGNIN, SIGNUP) */}
          {(mode === 'signin' || mode === 'signup') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider font-sans">
                  Senha
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] font-semibold text-reformedGold-600 dark:text-reformedGold-400 hover:underline transition-colors font-sans"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-reformedNavy-950 border border-slate-200 dark:border-reformedNavy-700 text-slate-900 dark:text-white placeholder-slate-400 text-base focus:outline-none focus:border-reformedGold-500 transition-all font-sans"
                />
              </div>
            </div>
          )}

          {/* FORGOT PASSWORD ADVISORY (SUPABASE FREE TIER) */}
          {mode === 'forgot' && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs leading-relaxed flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Orientações do Plano Gratuito (Supabase):</span>
                O link será enviado para seu e-mail. Caso demore a chegar, verifique sempre a pasta de <strong>Spam / Lixo Eletrônico</strong>. O envio possui limite de requisições por hora para segurança.
              </div>
            </div>
          )}

          {/* UPDATE PASSWORD FIELDS */}
          {mode === 'update_password' && (
            <>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-1 font-sans">
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-reformedNavy-950 border border-slate-200 dark:border-reformedNavy-700 text-slate-900 dark:text-white placeholder-slate-400 text-base focus:outline-none focus:border-reformedGold-500 transition-all font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-1 font-sans">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-reformedNavy-950 border border-slate-200 dark:border-reformedNavy-700 text-slate-900 dark:text-white placeholder-slate-400 text-base focus:outline-none focus:border-reformedGold-500 transition-all font-sans"
                  />
                </div>
              </div>
            </>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider bg-reformedGold-600 hover:bg-reformedGold-700 text-white transition-all shadow-md shadow-reformedGold-600/30 disabled:opacity-50 active:scale-98 flex items-center justify-center gap-2 mt-2 font-sans"
          >
            {loading ? (
              <span>Processando...</span>
            ) : mode === 'signin' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </>
            ) : mode === 'signup' ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Criar Conta</span>
              </>
            ) : mode === 'forgot' ? (
              <>
                <Mail className="w-4 h-4" />
                <span>Enviar Link de Recuperação</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Salvar Nova Senha</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode / Back Links */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-reformedNavy-800 text-center font-sans">
          {mode === 'forgot' ? (
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-reformedGold-600 dark:text-reformedGold-400 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para o Login</span>
            </button>
          ) : mode === 'signin' ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Não tem conta?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="font-bold text-reformedGold-600 dark:text-reformedGold-400 hover:underline ml-1"
              >
                Cadastre-se grátis
              </button>
            </p>
          ) : mode === 'signup' ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Já possui conta?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="font-bold text-reformedGold-600 dark:text-reformedGold-400 hover:underline ml-1"
              >
                Faça login
              </button>
            </p>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-reformedGold-600 dark:text-reformedGold-400 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao início de sessão</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
