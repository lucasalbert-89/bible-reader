export type PlanId = 'plano-365' | 'plano-180' | 'plano-90';

export interface ReadingSegment {
  title: string; // e.g. "Antigo Testamento", "Novo Testamento", "Salmos / Provérbios", "Leitura Diária"
  chapters: string; // e.g. "Gênesis 1 a 3", "Mateus 1"
  category?: 'ot' | 'sapiential' | 'nt' | 'geral';
}

export interface DayReading {
  day: number;
  segments: ReadingSegment[];
  verse: string;
  reference: string;
  reflection: string;
}

export interface ReadingPlanInfo {
  id: PlanId;
  title: string;
  badge: string;
  subtitle: string;
  totalDays: number;
  chaptersPerDay: string;
  description: string;
}

export interface UserProgressData {
  planId: PlanId;
  completedDays: number[];
  lastReadDay?: number;
  updatedAt: string;
}

export interface AuthProfile {
  id: string;
  email: string;
  full_name?: string;
}
