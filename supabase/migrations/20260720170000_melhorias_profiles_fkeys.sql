-- Garante FKs de melhorias_salariais → profiles (schema cache / embeds PostgREST).

DO $$
BEGIN
  -- Remove aliases antigos se existirem (evita conflito ao recriar com nome padrão)
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'melhorias_colaborador_id_fkey'
      AND conrelid = 'public.melhorias_salariais'::regclass
  ) THEN
    ALTER TABLE public.melhorias_salariais
      DROP CONSTRAINT melhorias_colaborador_id_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'melhorias_gerente_id_fkey'
      AND conrelid = 'public.melhorias_salariais'::regclass
  ) THEN
    ALTER TABLE public.melhorias_salariais
      DROP CONSTRAINT melhorias_gerente_id_fkey;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'melhorias_salariais_colaborador_id_fkey'
      AND conrelid = 'public.melhorias_salariais'::regclass
  ) THEN
    ALTER TABLE public.melhorias_salariais
      ADD CONSTRAINT melhorias_salariais_colaborador_id_fkey
      FOREIGN KEY (colaborador_id)
      REFERENCES public.profiles(id)
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'melhorias_salariais_gerente_id_fkey'
      AND conrelid = 'public.melhorias_salariais'::regclass
  ) THEN
    ALTER TABLE public.melhorias_salariais
      ADD CONSTRAINT melhorias_salariais_gerente_id_fkey
      FOREIGN KEY (gerente_id)
      REFERENCES public.profiles(id)
      ON DELETE SET NULL;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
