import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isSupabaseReady: boolean;
  fullName: string;
  birthDate: string;
  isRecoveryMode: boolean;
  setIsRecoveryMode: (val: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string, birthDate?: string) => Promise<{ error: Error | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  updateProfile: (data: { fullName?: string; birthDate?: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isSupabaseReady: false,
  fullName: '',
  birthDate: '',
  isRecoveryMode: false,
  setIsRecoveryMode: () => {},
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  resetPasswordForEmail: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
  updateProfile: async () => ({ error: null }),
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash.includes('type=recovery') || 
             window.location.search.includes('type=recovery');
    }
    return false;
  });

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Check URL on mount
    if (window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery')) {
      setIsRecoveryMode(true);
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase não configurado. Verifique as variáveis no arquivo .env') };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string, birthDate?: string) => {
    if (!supabase) {
      return { error: new Error('Supabase não configurado. Verifique as variáveis no arquivo .env') };
    }
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: fullName?.trim() || '',
          birth_date: birthDate || '',
        }
      }
    });
    return { error };
  };

  const resetPasswordForEmail = async (email: string) => {
    if (!supabase) {
      return { error: new Error('Supabase não configurado. Verifique as variáveis no arquivo .env') };
    }
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl,
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase não configurado.') };
    }
    const { error } = await supabase.auth.updateUser({
      password,
    });
    if (!error) {
      setIsRecoveryMode(false);
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
    return { error };
  };

  const updateProfile = async (data: { fullName?: string; birthDate?: string }) => {
    if (!supabase) {
      return { error: new Error('Supabase não configurado.') };
    }
    const updateData: Record<string, any> = {};
    if (data.fullName !== undefined) updateData.full_name = data.fullName.trim();
    if (data.birthDate !== undefined) updateData.birth_date = data.birthDate;

    const { data: resData, error } = await supabase.auth.updateUser({
      data: updateData,
    });

    if (!error && resData.user) {
      setUser(resData.user);
    }
    return { error };
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
  };

  const fullName = user?.user_metadata?.full_name || '';
  const birthDate = user?.user_metadata?.birth_date || '';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isSupabaseReady: isSupabaseConfigured,
        fullName,
        birthDate,
        isRecoveryMode,
        setIsRecoveryMode,
        signIn,
        signUp,
        resetPasswordForEmail,
        updatePassword,
        updateProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
