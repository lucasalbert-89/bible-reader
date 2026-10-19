-- =====================================================================
-- SCHEMA SUPABASE: PLANOS DE LEITURA BÍBLICA
-- Execute este script no SQL Editor do seu projeto Supabase (supabase.com)
-- =====================================================================

-- 1. Criação da tabela de progresso dos usuários
create table if not exists public.user_reading_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  plan_id text not null, -- 'plano-365', 'plano-180', 'plano-90'
  completed_days integer[] not null default array[]::integer[],
  last_read_day integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Garante que cada usuário tenha no máximo 1 registro por plano
  constraint unique_user_plan unique (user_id, plan_id)
);

-- 2. Habilitação de Row Level Security (RLS) para total privacidade e segurança
alter table public.user_reading_progress enable row level security;

-- 3. Políticas de Segurança (Cada usuário só lê e edita o seu próprio progresso)
drop policy if exists "Usuários podem ver seu próprio progresso" on public.user_reading_progress;
create policy "Usuários podem ver seu próprio progresso"
  on public.user_reading_progress
  for select
  using (auth.uid() = user_id);

drop policy if exists "Usuários podem inserir seu próprio progresso" on public.user_reading_progress;
create policy "Usuários podem inserir seu próprio progresso"
  on public.user_reading_progress
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Usuários podem atualizar seu próprio progresso" on public.user_reading_progress;
create policy "Usuários podem atualizar seu próprio progresso"
  on public.user_reading_progress
  for update
  using (auth.uid() = user_id);

drop policy if exists "Usuários podem deletar seu próprio progresso" on public.user_reading_progress;
create policy "Usuários podem deletar seu próprio progresso"
  on public.user_reading_progress
  for delete
  using (auth.uid() = user_id);

-- 4. Gatilho para atualizar a coluna updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.user_reading_progress;
create trigger set_updated_at
  before update on public.user_reading_progress
  for each row
  execute function public.handle_updated_at();

-- 5. Criação de índices para consultas ultra rápidas
create index if not exists idx_user_reading_progress_user 
  on public.user_reading_progress (user_id);

create index if not exists idx_user_reading_progress_user_plan 
  on public.user_reading_progress (user_id, plan_id);
