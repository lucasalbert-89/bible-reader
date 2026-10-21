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
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string, birthDate?: string) => Promise<{ error: Error | null }>;
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
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  updateProfile: async () => ({ error: null }),
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
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
        signIn,
        signUp,
        updateProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
