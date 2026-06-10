-- Registro de incidentes (quebra de deveres) — bloqueia autoavaliação e reajuste

DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_incidente') THEN
    CREATE TYPE public.tipo_incidente AS ENUM ('acidente_sms', 'no_show', 'advertencia');
  END IF;
END
$do$;

CREATE TABLE IF NOT EXISTS public.incidentes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  registrado_por_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  tipo_incidente public.tipo_incidente NOT NULL,
  data_ocorrencia date NOT NULL,
  descricao text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT incidentes_descricao_min_length CHECK (char_length(trim(descricao)) >= 5)
);

CREATE INDEX IF NOT EXISTS incidentes_colaborador_data_idx
  ON public.incidentes (colaborador_id, data_ocorrencia DESC);

ALTER TABLE public.incidentes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON public.incidentes TO authenticated;

DROP POLICY IF EXISTS incidentes_select_authenticated ON public.incidentes;

CREATE POLICY incidentes_select_authenticated ON public.incidentes
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      colaborador_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role IN ('rh', 'ceo', 'admin', 'gestor', 'gerente', 'supervisor')
      )
    )
  );

DROP POLICY IF EXISTS incidentes_insert_rh ON public.incidentes;

CREATE POLICY incidentes_insert_rh ON public.incidentes
  FOR INSERT WITH CHECK (
    registrado_por_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('rh', 'ceo', 'admin')
    )
    AND EXISTS (
      SELECT 1 FROM public.profiles colab
      WHERE colab.id = colaborador_id
        AND colab.role = 'colaborador'
    )
  );

-- Opcional: gatilho para alerta por e-mail em incidentes graves (acidente_sms, no_show).
-- Conecte uma Edge Function ou webhook Supabase em `notify-incidente-grave`.
CREATE OR REPLACE FUNCTION public.log_incidente_grave()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tipo_incidente IN ('acidente_sms', 'no_show') THEN
    RAISE LOG 'incidente_grave: colaborador_id=%, tipo=%, data=%',
      NEW.colaborador_id, NEW.tipo_incidente, NEW.data_ocorrencia;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_incidente_grave_log ON public.incidentes;

CREATE TRIGGER trg_incidente_grave_log
  AFTER INSERT ON public.incidentes
  FOR EACH ROW
  EXECUTE FUNCTION public.log_incidente_grave();
