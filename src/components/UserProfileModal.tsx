import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlanId } from '../types';
import { PLANS_INFO } from '../data/plansInfo';
import {
  X,
  User,
  Calendar,
  Edit3,
  Check,
  BookOpen,
  LogOut,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: PlanId;
  completedDays: number[];
  totalDays: number;
  progressPercentage: number;
  onSelectPlan: (planId: PlanId) => void;
  onContinueReading: (dayNumber: number) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  completedDays,
  totalDays,
  progressPercentage,
  onSelectPlan,
  onContinueReading,
}) => {
  const { user, fullName, birthDate, updateProfile, updatePassword, signOut } = useAuth();

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(fullName);
  const [editBirthDate, setEditBirthDate] = useState(birthDate);
  const [editPassword, setEditPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  // Active plan info
  const currentPlan = PLANS_INFO.find((p) => p.id === selectedPlan) || PLANS_INFO[0];

  // Calculate next day to read (first uncompleted day starting from 1)
  let nextDayToRead = 1;
  for (let i = 1; i <= totalDays; i++) {
    if (!completedDays.includes(i)) {
      nextDayToRead = i;
      break;
    }
  }

  // Get completed counts for all 3 plans from localStorage
  const getPlanCompletedCount = (pId: PlanId) => {
    if (pId === selectedPlan) return completedDays.length;
    try {
      const saved = localStorage.getItem(`biblia_completed_${pId}`);
      return saved ? JSON.parse(saved).length : 0;
    } catch {
      return 0;
    }
  };

  const totalAllPlansCompleted =
    getPlanCompletedCount('plano-365') +
    getPlanCompletedCount('plano-180') +
    getPlanCompletedCount('plano-90');

  // Format birth date in readable PT-BR
  const formatBirthDate = (rawDate: string) => {
    if (!rawDate) return null;
    try {
      const parts = rawDate.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
      }
    } catch {
      // fallback
    }
    return rawDate;
  };

  // Get user initials for avatar
  const getInitials = () => {
    const nameToUse = fullName || user.email || 'Leitor';
    const parts = nameToUse.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return nameToUse.slice(0, 2).toUpperCase();
  };

  const handleStartEdit = () => {
    setEditName(fullName);
    setEditBirthDate(birthDate);
    setEditPassword('');
    setErrorMsg(null);
    setSaveSuccess(false);
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setErrorMsg('Por favor, digite seu nome completo.');
      return;
    }

    if (editPassword && editPassword.length < 6) {
      setErrorMsg('A nova senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const { error } = await updateProfile({
      fullName: editName.trim(),
      birthDate: editBirthDate,
    });

    if (error) {
      setSaving(false);
      setErrorMsg(error.message);
      return;
    }

    if (editPassword.trim()) {
      const { error: pwdErr } = await updatePassword(editPassword);
      if (pwdErr) {
        setSaving(false);
        setErrorMsg(pwdErr.message);
        return;
      }
    }

    setSaving(false);
    setSaveSuccess(true);
    setEditPassword('');
    setTimeout(() => {
      setIsEditing(false);
      setSaveSuccess(false);
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-backdrop-enter"
      onClick={onClose}
    >
      <div
        className="bg-parchment-50 dark:bg-reformedNavy-900 rounded-[28px] sm:rounded-[36px] w-full max-w-2xl shadow-2xl transition-all border border-reformedGold-300/60 dark:border-reformedGold-600/30 p-5 sm:p-8 relative overflow-hidden animate-modal-enter my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Soft Golden Ambient Light */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-reformedGold-500/10 dark:bg-reformedGold-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-reformedNavy-800 transition-colors flex items-center justify-center active:scale-95 z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-reformedGold-200/50 dark:border-reformedNavy-800">
          <div className="flex items-center gap-3.5 sm:gap-4">
            {/* Avatar Circle with initials */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-reformedGold-500 to-reformedGold-700 text-white font-extrabold text-xl sm:text-2xl flex items-center justify-center shadow-lg shadow-reformedGold-500/25 border-2 border-reformedGold-300/40 shrink-0">
              {getInitials()}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-reformedGold-600 dark:text-reformedGold-400">
                  Área do Leitor
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                  <ShieldCheck className="w-3 h-3" />
                  Nuvem Ativa
                </span>
              </div>

              <h2 className="display-title text-xl sm:text-2xl font-black text-slate-900 dark:text-reformedGold-100">
                {fullName || 'Leitor das Escrituras'}
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-sm">
                {user.email}
              </p>
            </div>
          </div>

          {/* Edit Profile button */}
          {!isEditing && (
            <button
              onClick={handleStartEdit}
              className="inline-flex items-center self-start sm:self-center gap-1.5 px-3 py-1.5 rounded-xl border border-reformedGold-300/60 dark:border-reformedNavy-700 bg-white dark:bg-reformedNavy-800 text-slate-700 dark:text-slate-200 hover:border-reformedGold-500 text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5 text-reformedGold-600 dark:text-reformedGold-400" />
              <span>Editar Dados</span>
            </button>
          )}
        </div>

        {/* Profile Edit Mode */}
        {isEditing && (
          <form
            onSubmit={handleSaveProfile}
            className="my-5 p-4 sm:p-5 rounded-2xl bg-reformedGold-50/50 dark:bg-reformedNavy-950/60 border border-reformedGold-300/40 dark:border-reformedNavy-700 space-y-3.5 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Personalizar Seus Dados
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                Apenas nome e nascimento (sem burocracia)
              </span>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
                {errorMsg}
              </div>
            )}

            {saveSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Dados atualizados com sucesso!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Seu Nome Completo"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-reformedNavy-900 border border-slate-200 dark:border-reformedNavy-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-reformedGold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Data de Nascimento (Opcional)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-reformedNavy-900 border border-slate-200 dark:border-reformedNavy-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-reformedGold-500 font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Change Password (Optional) */}
            <div className="pt-2 border-t border-reformedGold-200/40 dark:border-reformedNavy-800">
              <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Nova Senha (Opcional)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Preencha apenas se quiser redefinir sua senha"
                  minLength={6}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-reformedNavy-900 border border-slate-200 dark:border-reformedNavy-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-reformedGold-500 font-sans"
                />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 italic">
                Dica: Alterar a senha diretamente por aqui é imediato e não consome limite de e-mails do Supabase.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-reformedNavy-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-reformedGold-600 hover:bg-reformedGold-700 text-white transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                {saving ? 'Salvando...' : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar Alterações</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* User Info Badges */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-sans">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-reformedNavy-800/80 border border-reformedGold-200/50 dark:border-reformedNavy-700">
            <User className="w-3.5 h-3.5 text-reformedGold-600 dark:text-reformedGold-400" />
            <span className="font-semibold">{fullName ? fullName : 'Nome não informado'}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-reformedNavy-800/80 border border-reformedGold-200/50 dark:border-reformedNavy-700">
            <Calendar className="w-3.5 h-3.5 text-reformedGold-600 dark:text-reformedGold-400" />
            <span>
              {birthDate ? (
                <>Nascimento: <strong className="font-semibold">{formatBirthDate(birthDate)}</strong></>
              ) : (
                <span className="text-slate-400 dark:text-slate-500 italic">Data de nascimento não informada</span>
              )}
            </span>
          </div>
        </div>

        {/* Reading Progress Showcase */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="display-title text-base sm:text-lg font-bold text-slate-900 dark:text-reformedGold-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-reformedGold-600 dark:text-reformedGold-400" />
              <span>Seu Progresso de Leitura</span>
            </h3>
            <span className="text-xs font-serif italic text-slate-500 dark:text-slate-400">
              Acompanhamento direto & diário
            </span>
          </div>

          {/* Main Active Plan Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-reformedNavy-800/90 border border-reformedGold-300/50 dark:border-reformedNavy-700 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-reformedGold-600 dark:text-reformedGold-400">
                  Plano Atual em Andamento
                </span>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {currentPlan.title}
                </h4>
              </div>

              {/* Next day quick action */}
              <button
                onClick={() => {
                  onClose();
                  onContinueReading(nextDayToRead);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-reformedGold-600 to-reformedGold-700 hover:from-reformedGold-700 hover:to-reformedGold-800 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-reformedGold-600/30 active:scale-95 transition-all self-start sm:self-center"
              >
                <span>Continuar no Dia {nextDayToRead}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Visual Progress Bar */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {completedDays.length} de {totalDays} dias meditados
                </span>
                <span className="font-black text-reformedGold-600 dark:text-reformedGold-400">
                  {progressPercentage}% concluído
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-reformedNavy-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-reformedNavy-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-reformedGold-600 via-reformedGold-500 to-reformedGold-400 transition-all duration-700 shadow-sm"
                  style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
                />
              </div>
            </div>

            {/* 3 Metric Pills */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2.5 rounded-xl bg-parchment-100/80 dark:bg-reformedNavy-900 border border-reformedGold-200/40 dark:border-reformedNavy-700">
                <span className="block text-base sm:text-xl font-black text-slate-900 dark:text-reformedGold-100">
                  {completedDays.length}
                </span>
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                  Dias Lidos
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-parchment-100/80 dark:bg-reformedNavy-900 border border-reformedGold-200/40 dark:border-reformedNavy-700">
                <span className="block text-base sm:text-xl font-black text-slate-900 dark:text-reformedGold-100">
                  {Math.max(0, totalDays - completedDays.length)}
                </span>
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                  Restantes
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-parchment-100/80 dark:bg-reformedNavy-900 border border-reformedGold-200/40 dark:border-reformedNavy-700">
                <span className="block text-base sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                  Dia {nextDayToRead}
                </span>
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                  Próxima Leitura
                </span>
              </div>
            </div>
          </div>

          {/* Overview of all 3 Plans */}
          <div className="space-y-2 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                Todos os Planos de Leitura
              </span>
              <span className="text-[11px] font-semibold text-reformedGold-700 dark:text-reformedGold-400">
                {totalAllPlansCompleted} dias lidos no total acumulado
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PLANS_INFO.map((plan) => {
                const count = getPlanCompletedCount(plan.id);
                const pct = Math.round((count / plan.totalDays) * 100);
                const isActive = plan.id === selectedPlan;

                return (
                  <div
                    key={plan.id}
                    onClick={() => onSelectPlan(plan.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                      isActive
                        ? 'bg-reformedGold-50/80 dark:bg-reformedNavy-800 border-reformedGold-500 ring-2 ring-reformedGold-500/20 shadow-sm'
                        : 'bg-white dark:bg-reformedNavy-900/60 border-slate-200 dark:border-reformedNavy-700 hover:border-reformedGold-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-reformedGold-100 dark:bg-reformedNavy-700 text-reformedGold-700 dark:text-reformedGold-300">
                        {plan.badge}
                      </span>
                      {isActive && (
                        <span className="text-[9px] font-bold text-reformedGold-600 dark:text-reformedGold-400">
                          Ativo
                        </span>
                      )}
                    </div>

                    <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {plan.title}
                    </h5>

                    <div className="mt-2 flex items-baseline justify-between text-xs">
                      <span className="font-black text-slate-800 dark:text-slate-200">
                        {count} <span className="text-[10px] font-normal text-slate-500">/ {plan.totalDays} dias</span>
                      </span>
                      <span className="text-[11px] font-bold text-reformedGold-600 dark:text-reformedGold-400">
                        {pct}%
                      </span>
                    </div>

                    <div className="mt-1.5 w-full bg-slate-100 dark:bg-reformedNavy-950 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-reformedGold-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Motivational Verse Banner */}
        <div className="mt-6 p-3.5 rounded-2xl bg-parchment-100 dark:bg-reformedNavy-950/70 border border-reformedGold-200/50 dark:border-reformedNavy-800 text-xs text-slate-700 dark:text-slate-300 font-serif italic text-center">
          "Lâmpada para os meus pés é tua palavra e luz, para o meu caminho." — Salmo 119:105
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-reformedNavy-800 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              signOut();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-900 dark:bg-reformedGold-600 text-white hover:bg-slate-800 dark:hover:bg-reformedGold-700 transition-all shadow-md active:scale-95"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
