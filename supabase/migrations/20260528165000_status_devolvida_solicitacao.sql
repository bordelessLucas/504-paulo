-- Novo status para devolução pelo RH (decisão final permanece com o CEO)
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'status_solicitacao_salarial'
      AND e.enumlabel = 'devolvida'
  ) THEN
    ALTER TYPE public.status_solicitacao_salarial ADD VALUE 'devolvida';
  END IF;
END
$do$;
