-- Cadastro de Cargos/Funções + CBO (Excel DNA PERFORMANCE 1.10)

CREATE TABLE IF NOT EXISTS public.cargos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  codigo_cbo text,
  departamento text,
  descricao text,
  ativo boolean NOT NULL DEFAULT true,
  organizacao_id uuid REFERENCES public.organizacoes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organizacao_id, nome)
);

CREATE INDEX IF NOT EXISTS cargos_organizacao_id_idx ON public.cargos (organizacao_id);
CREATE INDEX IF NOT EXISTS cargos_codigo_cbo_idx ON public.cargos (codigo_cbo);

ALTER TABLE public.cargos ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.cargos TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cargos TO authenticated;

DROP POLICY IF EXISTS cargos_select_authenticated ON public.cargos;
CREATE POLICY cargos_select_authenticated ON public.cargos
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS cargos_write_admin ON public.cargos;
CREATE POLICY cargos_write_admin ON public.cargos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('rh', 'ceo', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('rh', 'ceo', 'admin')
    )
  );
