-- Alinha coluna de data em avaliacoes para created_at (padrão do app).
-- Execute se o erro for "column data_criacao does not exist".

DO $do$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'avaliacoes' AND column_name = 'data_criacao'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'avaliacoes' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.avaliacoes RENAME COLUMN data_criacao TO created_at;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'avaliacoes' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.avaliacoes ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
END $do$;

-- Recria view mascarada (DROP obrigatório: coluna antiga era data_criacao)
DROP VIEW IF EXISTS public.avaliacoes_masked;

CREATE VIEW public.avaliacoes_masked AS
SELECT id, avaliado_id, tipo, created_at
FROM public.avaliacoes;

GRANT SELECT ON public.avaliacoes_masked TO authenticated;
