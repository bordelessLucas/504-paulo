-- Ciclo anual + decisões estratégicas (PLR, bonificação, reajuste)
-- Nota: o valor 'anual' no enum deve ser aplicado em migration separada
-- (20260528125000_tipo_avaliacao_anual.sql) por limitação do PostgreSQL.

CREATE TABLE IF NOT EXISTS public.decisoes_anuais_estrategicas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  decidido_por_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  ano_referencia smallint NOT NULL,
  tipo_beneficio text NOT NULL CHECK (tipo_beneficio IN ('reajuste', 'plr', 'bonificacao', 'nenhum')),
  justificativa_financeira text NOT NULL,
  media_quinzenal_ano numeric(4, 2),
  media_semestral_ano numeric(4, 2),
  avaliacao_anual_id uuid REFERENCES public.avaliacoes(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT decisoes_anuais_colaborador_ano_unique UNIQUE (colaborador_id, ano_referencia)
);

ALTER TABLE public.decisoes_anuais_estrategicas ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON public.decisoes_anuais_estrategicas TO authenticated;

DROP POLICY IF EXISTS decisoes_anuais_select_exec ON public.decisoes_anuais_estrategicas;

CREATE POLICY decisoes_anuais_select_exec ON public.decisoes_anuais_estrategicas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('rh', 'ceo', 'gerente', 'admin')
    )
  );

DROP POLICY IF EXISTS decisoes_anuais_insert_exec ON public.decisoes_anuais_estrategicas;

CREATE POLICY decisoes_anuais_insert_exec ON public.decisoes_anuais_estrategicas
  FOR INSERT WITH CHECK (
    decidido_por_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('rh', 'ceo', 'gerente', 'admin')
    )
  );

DROP POLICY IF EXISTS avaliacoes_insert_decisao_anual ON public.avaliacoes;

CREATE POLICY avaliacoes_insert_decisao_anual ON public.avaliacoes
  FOR INSERT WITH CHECK (
    tipo = 'anual'
    AND avaliador_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('rh', 'ceo', 'gerente', 'admin')
    )
  );
