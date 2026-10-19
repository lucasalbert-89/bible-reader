import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://SEU-PROJETO.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database interface for user_reading_progress
export interface DBUserReadingProgress {
  id?: string;
  user_id: string;
  plan_id: string;
  completed_days: number[];
  last_read_day?: number;
  updated_at?: string;
}

export async function fetchUserProgress(userId: string, planId: string): Promise<number[] | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('user_reading_progress')
      .select('completed_days')
      .eq('user_id', userId)
      .eq('plan_id', planId)
      .maybeSingle();

    if (error) {
      console.warn('Erro ao carregar progresso do Supabase:', error.message);
      return null;
    }

    return data?.completed_days || [];
  } catch (err) {
    console.error('Falha de conexão com Supabase:', err);
    return null;
  }
}

export async function syncProgressToSupabase(
  userId: string,
  planId: string,
  completedDays: number[],
  lastReadDay?: number
): Promise<boolean> {
  if (!supabase) return false;

  try {
    const payload = {
      user_id: userId,
      plan_id: planId,
      completed_days: completedDays,
      last_read_day: lastReadDay || (completedDays.length > 0 ? completedDays[completedDays.length - 1] : 1),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('user_reading_progress')
      .upsert(payload, { onConflict: 'user_id,plan_id' });

    if (error) {
      console.error('Erro ao salvar progresso no Supabase:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Falha ao sincronizar com Supabase:', err);
    return false;
  }
}
