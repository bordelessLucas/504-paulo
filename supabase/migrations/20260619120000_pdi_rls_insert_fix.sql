-- Corrige RLS de INSERT em planos_desenvolvimento:
-- - inclui CEO entre papéis autorizados
-- - alinha gestão de equipe com lider_id OU mesmo departamento
-- - permite criar PDI para colaborador já avaliado pelo usuário (fluxo histórico)

CREATE OR REPLACE FUNCTION public.usuario_gerencia_colaborador(p_colaborador_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles gestor
    JOIN public.profiles colab ON colab.id = p_colaborador_id
    WHERE gestor.id = auth.uid()
      AND gestor.role IN ('supervisor', 'gestor', 'gerente')
      AND colab.role = 'colaborador'
      AND (
        colab.lider_id = gestor.id
        OR (
          colab.departamento IS NOT NULL
          AND gestor.departamento IS NOT NULL
          AND colab.departamento = gestor.departamento
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.usuario_pode_criar_pdi(p_colaborador_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.usuario_tem_acesso_total_pdi()
    OR public.usuario_gerencia_colaborador(p_colaborador_id)
    OR EXISTS (
      SELECT 1
      FROM public.avaliacoes a
      WHERE a.avaliador_id = auth.uid()
        AND a.avaliado_id = p_colaborador_id
    );
$$;

DROP POLICY IF EXISTS pdi_insert_gestao ON public.planos_desenvolvimento;

CREATE POLICY pdi_insert_gestao ON public.planos_desenvolvimento
  FOR INSERT
  WITH CHECK (
    criado_por_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('supervisor', 'gestor', 'gerente', 'rh', 'ceo', 'admin')
    )
    AND public.usuario_pode_criar_pdi(colaborador_id)
  );
