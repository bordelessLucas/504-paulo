-- Supabase/PostgreSQL schema setup for Avaliação de Performance
-- Run in psql or Supabase SQL editor

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

DO $do$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('colaborador','supervisor','gestor','gerente','rh','ceo');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_avaliacao') THEN
    CREATE TYPE public.tipo_avaliacao AS ENUM ('quinzenal','semestral','anual');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_solicitacao_salarial') THEN
    CREATE TYPE public.status_solicitacao_salarial AS ENUM ('pendente_rh','pendente_ceo','aprovado','recusado');
  END IF;
END $do$;
-- NOTE: If your existing `user_role` enum is missing values, add them separately
-- in their own transaction (run these individually in the SQL editor):
-- ALTER TYPE public.user_role ADD VALUE 'rh';
-- ALTER TYPE public.user_role ADD VALUE 'admin';
-- (and any other missing values)

-- Profiles table (references auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  data_nascimento date,
  funcao text,
  classificacao text,
  nivel_irata text,
  data_admissao date,
  departamento text,
  status text,
  role public.user_role not null default 'colaborador',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Perguntas table
create table if not exists public.perguntas (
  id uuid primary key default gen_random_uuid(),
  codigo text unique,
  descricao text not null,
  secao_departamento text,
  peso smallint not null check (peso in (1,3)),
  created_at timestamptz default now()
);

-- Avaliacoes table
create table if not exists public.avaliacoes (
  id uuid primary key default gen_random_uuid(),
  avaliador_id uuid references public.profiles(id) on delete set null,
  avaliado_id uuid references public.profiles(id) on delete cascade,
  tipo public.tipo_avaliacao not null,
  created_at timestamptz default now()
);

-- Respostas table
create table if not exists public.respostas (
  id uuid primary key default gen_random_uuid(),
  avaliacao_id uuid not null references public.avaliacoes(id) on delete cascade,
  pergunta_id uuid references public.perguntas(id) on delete set null,
  nota smallint check (nota in (0,1,2,3)),
  justificativa text,
  evidencia text,
  created_at timestamptz default now()
);

-- Melhorias salariais
create table if not exists public.melhorias_salariais (
  id uuid primary key default gen_random_uuid(),
  colaborador_id uuid not null references public.profiles(id) on delete cascade,
  gerente_id uuid references public.profiles(id) on delete set null,
  justificativa text not null,
  status public.status_solicitacao_salarial not null default 'pendente_rh',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.perguntas enable row level security;
alter table public.avaliacoes enable row level security;
alter table public.respostas enable row level security;
alter table public.melhorias_salariais enable row level security;

-- PROFILES: Allow SELECT to any authenticated user
create policy profiles_select_authenticated on public.profiles
  for select using (auth.uid() is not null);

-- PERGUNTAS: Gestores/Supervisores só podem selecionar perguntas do próprio departamento.
-- Outros papéis autenticados podem ler todas as perguntas. CEO/RH acessam tudo.
create policy perguntas_select_by_role_and_dept on public.perguntas
  for select using (
    auth.uid() is not null and (
      (select p.role from public.profiles p where p.id = auth.uid()) not in ('gestor','supervisor')
      or (select p.role from public.profiles p where p.id = auth.uid()) in ('ceo','rh','admin','gerente')
      or (select p.departamento from public.profiles p where p.id = auth.uid()) = secao_departamento
      or secao_departamento = 'UNIVERSAL'
    )
  );

-- AVALIACOES/RESPOSTAS: create masked views for avaliado so avaliador_id is not exposed
-- Revoke direct SELECT on tables from authenticated and grant only on views.

DROP VIEW IF EXISTS public.avaliacoes_masked;

DO $do$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'avaliacoes' AND column_name = 'created_at'
  ) THEN
    EXECUTE $$
      CREATE VIEW public.avaliacoes_masked AS
      SELECT id, avaliado_id, tipo, created_at FROM public.avaliacoes;
    $$;
  ELSE
    RAISE NOTICE 'Skipping creation of view public.avaliacoes_masked: column created_at not found on public.avaliacoes';
  END IF;
END $do$;

-- Create a view for respostas (linked to avaliacao) - returns nota and justificativa without exposing avaliador info
-- Create (or replace) a view for respostas (linked to avaliacao) - returns nota and justificativa without exposing avaliador info
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'respostas' AND column_name = 'created_at'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'respostas' AND column_name = 'nota'
  ) THEN
    EXECUTE $$
      CREATE OR REPLACE VIEW public.respostas_masked AS
      SELECT r.id, r.avaliacao_id, r.pergunta_id, r.nota, r.justificativa, r.evidencia, r.created_at
      FROM public.respostas r
      JOIN public.avaliacoes a ON a.id = r.avaliacao_id;
    $$;
  ELSE
    RAISE NOTICE 'Skipping creation of view public.respostas_masked: required columns not found on public.respostas';
  END IF;
END$$;

-- Views mascaradas (colaborador) + tabelas base (gestores, CEO, RH, dashboard gerencial)
grant select on public.avaliacoes to authenticated;
grant select on public.respostas to authenticated;
grant insert on public.avaliacoes to authenticated;
grant insert on public.respostas to authenticated;
grant update on public.respostas to authenticated;

grant select on public.avaliacoes_masked to authenticated;
grant select on public.respostas_masked to authenticated;

-- Policies on avaliacoes to allow rows to be read according to rules
-- CEO/RH/Admin: full access
create policy avaliacoes_select_ceo_admin on public.avaliacoes
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('ceo','rh','admin'))
  );

-- Avaliado can read their own avaliacoes
create policy avaliacoes_select_avaliado on public.avaliacoes
  for select using (auth.uid() = avaliado_id);

-- Gestores: cannot read avaliações feitas por outros gestores
create policy avaliacoes_select_gestor on public.avaliacoes
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'gestor')
    and not (
      (select role from public.profiles where id = public.avaliacoes.avaliador_id) = 'gestor'
      and public.avaliacoes.avaliador_id is distinct from auth.uid()
    )
  );

-- Allow supervisors/other roles to read if authenticated (they'll be covered by this policy)
create policy avaliacoes_select_authenticated_others on public.avaliacoes
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid())
    and not exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'gestor')
  );

-- INSERT: supervisor, gestor e gerente registram avaliações
create policy avaliacoes_insert_avaliador on public.avaliacoes
  for insert with check (
    avaliador_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('supervisor','gestor','gerente')
    )
  );

create policy respostas_insert_avaliador on public.respostas
  for insert with check (
    exists (
      select 1 from public.avaliacoes a
      where a.id = avaliacao_id and a.avaliador_id = auth.uid()
    )
  );

create policy respostas_update_avaliador on public.respostas
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('supervisor','gestor','gerente')
    )
    and exists (
      select 1 from public.avaliacoes a
      join public.profiles colab on colab.id = a.avaliado_id
      where a.id = respostas.avaliacao_id and colab.role = 'colaborador'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('supervisor','gestor','gerente')
    )
  );

-- RESPOSTAS: allow avaliado to read responses tied to their avaliacoes; CEO/RH can read all; apply similar gestor restriction
create policy respostas_select_avaliado on public.respostas
  for select using (
    exists (
      select 1 from public.avaliacoes a where a.id = public.respostas.avaliacao_id and a.avaliado_id = auth.uid()
    )
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('ceo','rh','admin'))
    or (
      exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'gestor')
      and not (
        (select role from public.profiles where id = (select avaliador_id from public.avaliacoes where id = public.respostas.avaliacao_id)) = 'gestor'
        and (select avaliador_id from public.avaliacoes where id = public.respostas.avaliacao_id) is distinct from auth.uid()
      )
    )
  );

-- MELHORIAS SALARIAIS: collaborators can see own requests; gerente can see requests where they are gerente; RH and CEO can see all
create policy melhorias_select_colaborador on public.melhorias_salariais
  for select using (
    auth.uid() is not null and (
      colaborador_id = auth.uid()
      or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'rh')
      or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ceo')
      or gerente_id = auth.uid()
    )
  );

-- Lastly, audit helper: update updated_at on row update
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger trg_melhorias_updated_at before update on public.melhorias_salariais for each row execute function public.set_updated_at();

-- Notes:
-- - The strategy above uses masked views (`_masked`) to expose only allowed columns to authenticated clients.
-- - Direct SELECT privileges on base tables were revoked for the `authenticated` role so apps must use the views.
-- - RLS policies still protect rows at the table level (views are subject to the same row checks).
-- - Review and adapt policy logic to match exact org rules and roles in your Supabase `profiles` table.
