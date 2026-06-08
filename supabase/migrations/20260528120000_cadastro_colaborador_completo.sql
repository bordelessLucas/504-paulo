-- Cadastro completo offshore: campos operacionais em profiles
-- Execute via Supabase CLI ou SQL Editor

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ddd text,
  ADD COLUMN IF NOT EXISTS telefone text,
  ADD COLUMN IF NOT EXISTS expertise text,
  ADD COLUMN IF NOT EXISTS formacao_tecnica text,
  ADD COLUMN IF NOT EXISTS certificacao_edn boolean NOT NULL DEFAULT false;

-- Garante colunas já previstas no schema base
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS data_nascimento date,
  ADD COLUMN IF NOT EXISTS classificacao text,
  ADD COLUMN IF NOT EXISTS nivel_irata text;

-- Status operacional (validado no app: ativo, inativo, ferias, afastado)
COMMENT ON COLUMN public.profiles.status IS 'ativo | inativo | ferias | afastado';
COMMENT ON COLUMN public.profiles.nivel_irata IS 'N1 | N2 | N3 | N/A';
