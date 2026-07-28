-- Assinatura por organização: usuários criados pelo CEO/RH herdam o plano da empresa.

CREATE TABLE IF NOT EXISTS public.organizacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assinaturas (
  organizacao_id uuid PRIMARY KEY REFERENCES public.organizacoes(id) ON DELETE CASCADE,
  plan_id text NOT NULL CHECK (plan_id IN ('essencial', 'profissional', 'corporativo')),
  activated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'cancelada')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS organizacao_id uuid REFERENCES public.organizacoes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS profiles_organizacao_id_idx
  ON public.profiles (organizacao_id);

ALTER TABLE public.organizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.organizacoes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.assinaturas TO authenticated;

-- Membros veem a própria organização; dono gerencia.
DROP POLICY IF EXISTS organizacoes_select_membro ON public.organizacoes;
CREATE POLICY organizacoes_select_membro ON public.organizacoes
  FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid()
    OR id = (SELECT p.organizacao_id FROM public.profiles p WHERE p.id = auth.uid())
  );

DROP POLICY IF EXISTS organizacoes_insert_owner ON public.organizacoes;
CREATE POLICY organizacoes_insert_owner ON public.organizacoes
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS organizacoes_update_owner ON public.organizacoes;
CREATE POLICY organizacoes_update_owner ON public.organizacoes
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS assinaturas_select_membro ON public.assinaturas;
CREATE POLICY assinaturas_select_membro ON public.assinaturas
  FOR SELECT TO authenticated
  USING (
    organizacao_id = (SELECT p.organizacao_id FROM public.profiles p WHERE p.id = auth.uid())
    OR organizacao_id IN (
      SELECT o.id FROM public.organizacoes o WHERE o.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS assinaturas_insert_owner ON public.assinaturas;
CREATE POLICY assinaturas_insert_owner ON public.assinaturas
  FOR INSERT TO authenticated
  WITH CHECK (
    organizacao_id IN (
      SELECT o.id FROM public.organizacoes o WHERE o.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS assinaturas_update_owner ON public.assinaturas;
CREATE POLICY assinaturas_update_owner ON public.assinaturas
  FOR UPDATE TO authenticated
  USING (
    organizacao_id IN (
      SELECT o.id FROM public.organizacoes o WHERE o.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    organizacao_id IN (
      SELECT o.id FROM public.organizacoes o WHERE o.owner_id = auth.uid()
    )
  );

-- Garante organização para o dono (CEO) e retorna o id.
CREATE OR REPLACE FUNCTION public.ensure_organizacao_for_owner(
  p_owner_id uuid,
  p_nome text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id uuid;
  v_nome text;
BEGIN
  IF p_owner_id IS NULL THEN
    RAISE EXCEPTION 'owner_id obrigatório';
  END IF;

  -- Apenas o próprio usuário (ou service role) pode garantir a org.
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_owner_id THEN
    RAISE EXCEPTION 'Sem permissão para criar organização de outro usuário';
  END IF;

  SELECT id INTO v_org_id
  FROM public.organizacoes
  WHERE owner_id = p_owner_id;

  IF v_org_id IS NOT NULL THEN
    UPDATE public.profiles
    SET organizacao_id = v_org_id
    WHERE id = p_owner_id
      AND (organizacao_id IS DISTINCT FROM v_org_id);
    RETURN v_org_id;
  END IF;

  SELECT COALESCE(NULLIF(trim(p_nome), ''), NULLIF(trim(nome), ''), 'Empresa')
  INTO v_nome
  FROM public.profiles
  WHERE id = p_owner_id;

  v_nome := COALESCE(v_nome, 'Empresa');

  INSERT INTO public.organizacoes (owner_id, nome)
  VALUES (p_owner_id, v_nome)
  RETURNING id INTO v_org_id;

  UPDATE public.profiles
  SET organizacao_id = v_org_id
  WHERE id = p_owner_id;

  RETURN v_org_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_organizacao_for_owner(uuid, text) TO authenticated;

-- Ativa/atualiza assinatura da organização do dono.
CREATE OR REPLACE FUNCTION public.activate_organizacao_assinatura(
  p_owner_id uuid,
  p_plan_id text,
  p_nome text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  IF p_plan_id NOT IN ('essencial', 'profissional', 'corporativo') THEN
    RAISE EXCEPTION 'Plano inválido';
  END IF;

  IF auth.uid() IS NOT NULL AND auth.uid() <> p_owner_id THEN
    RAISE EXCEPTION 'Sem permissão para ativar assinatura de outro usuário';
  END IF;

  v_org_id := public.ensure_organizacao_for_owner(p_owner_id, p_nome);

  INSERT INTO public.assinaturas (organizacao_id, plan_id, activated_at, status, updated_at)
  VALUES (v_org_id, p_plan_id, now(), 'ativa', now())
  ON CONFLICT (organizacao_id) DO UPDATE
    SET
      plan_id = EXCLUDED.plan_id,
      status = 'ativa',
      activated_at = COALESCE(public.assinaturas.activated_at, EXCLUDED.activated_at),
      updated_at = now();

  RETURN v_org_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.activate_organizacao_assinatura(uuid, text, text) TO authenticated;

-- Lê assinatura ativa da organização do usuário autenticado (ou informada).
CREATE OR REPLACE FUNCTION public.get_minha_assinatura(p_user_id uuid DEFAULT NULL)
RETURNS TABLE (plan_id text, activated_at timestamptz, organizacao_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_user_id uuid;
  v_org_id uuid;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());

  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  IF auth.uid() IS NOT NULL AND auth.uid() <> v_user_id THEN
    RAISE EXCEPTION 'Sem permissão para consultar assinatura de outro usuário';
  END IF;

  SELECT p.organizacao_id INTO v_org_id
  FROM public.profiles p
  WHERE p.id = v_user_id;

  IF v_org_id IS NULL THEN
    SELECT o.id INTO v_org_id
    FROM public.organizacoes o
    WHERE o.owner_id = v_user_id;
  END IF;

  IF v_org_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT a.plan_id, a.activated_at, a.organizacao_id
  FROM public.assinaturas a
  WHERE a.organizacao_id = v_org_id
    AND a.status = 'ativa'
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_minha_assinatura(uuid) TO authenticated;

-- Backfill: uma organização por CEO existente.
INSERT INTO public.organizacoes (owner_id, nome)
SELECT p.id, COALESCE(NULLIF(trim(p.nome), ''), 'Empresa')
FROM public.profiles p
WHERE p.role = 'ceo'
  AND NOT EXISTS (
    SELECT 1 FROM public.organizacoes o WHERE o.owner_id = p.id
  );

UPDATE public.profiles p
SET organizacao_id = o.id
FROM public.organizacoes o
WHERE o.owner_id = p.id
  AND p.organizacao_id IS DISTINCT FROM o.id;

-- Ambiente single-tenant: vincula membros órfãos ao único CEO.
DO $$
DECLARE
  v_ceo_count integer;
  v_org_id uuid;
BEGIN
  SELECT COUNT(*) INTO v_ceo_count FROM public.profiles WHERE role = 'ceo';

  IF v_ceo_count = 1 THEN
    SELECT o.id INTO v_org_id
    FROM public.organizacoes o
    INNER JOIN public.profiles p ON p.id = o.owner_id
    WHERE p.role = 'ceo'
    LIMIT 1;

    IF v_org_id IS NOT NULL THEN
      UPDATE public.profiles
      SET organizacao_id = v_org_id
      WHERE organizacao_id IS NULL
        AND role <> 'ceo';
    END IF;
  END IF;
END $$;
