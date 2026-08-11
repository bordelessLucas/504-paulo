-- Hardening: impedir auto-elevação de papel, restringir signup metadata
-- e exigir CEO/admin para ativar assinatura.

-- 1) Signup: só aceita colaborador (default) ou ceo (dono). Nunca admin/rh/etc. via metadata.
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nome text;
  v_role public.user_role;
  v_role_text text;
BEGIN
  v_nome := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data->>'nome'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''),
    split_part(NEW.email, '@', 1)
  );

  v_role_text := lower(trim(COALESCE(NEW.raw_user_meta_data->>'role', '')));

  -- Apenas papéis seguros no auto-cadastro. Papéis internos ficam na Edge Function.
  IF v_role_text = 'ceo' THEN
    v_role := 'ceo'::public.user_role;
  ELSE
    v_role := 'colaborador'::public.user_role;
  END IF;

  INSERT INTO public.profiles (id, nome, role)
  VALUES (NEW.id, v_nome, v_role)
  ON CONFLICT (id) DO UPDATE
    SET
      nome = COALESCE(EXCLUDED.nome, profiles.nome),
      role = CASE
        WHEN profiles.role = 'colaborador'::public.user_role
          AND EXCLUDED.role = 'ceo'::public.user_role
        THEN 'ceo'::public.user_role
        ELSE profiles.role
      END;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_auth_user_created() IS
  'Cria profile no signUp; metadata só pode forçar ceo (dono) ou colaborador.';

-- 2) Bloqueia alteração de colunas sensíveis via cliente (JWT authenticated).
CREATE OR REPLACE FUNCTION public.protect_profiles_sensitive_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_jwt_role text := COALESCE(auth.jwt()->>'role', '');
BEGIN
  IF v_jwt_role = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Alteração de papel não permitida pelo cliente.';
    END IF;

    IF NEW.organizacao_id IS DISTINCT FROM OLD.organizacao_id THEN
      RAISE EXCEPTION 'Alteração de organização não permitida pelo cliente.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profiles_sensitive ON public.profiles;

CREATE TRIGGER trg_protect_profiles_sensitive
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profiles_sensitive_columns();

-- 3) INSERT self: só colaborador ou ceo na própria linha.
DROP POLICY IF EXISTS profiles_insert_self ON public.profiles;

CREATE POLICY profiles_insert_self ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid()
    AND role IN ('colaborador'::public.user_role, 'ceo'::public.user_role)
  );

-- 4) RPC segura para dono reivindicar CEO (conta nova sem org, ainda colaborador).
CREATE OR REPLACE FUNCTION public.claim_owner_ceo(p_nome text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_role public.user_role;
  v_org uuid;
  v_created timestamptz;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  SELECT p.role, p.organizacao_id, p.created_at
  INTO v_role, v_org, v_created
  FROM public.profiles p
  WHERE p.id = v_uid;

  IF v_role IS NULL THEN
    INSERT INTO public.profiles (id, nome, role)
    VALUES (
      v_uid,
      COALESCE(NULLIF(trim(p_nome), ''), 'Usuário'),
      'ceo'::public.user_role
    );
    RETURN;
  END IF;

  IF v_role = 'ceo'::public.user_role THEN
    IF NULLIF(trim(p_nome), '') IS NOT NULL THEN
      UPDATE public.profiles
      SET nome = trim(p_nome)
      WHERE id = v_uid;
    END IF;
    RETURN;
  END IF;

  IF v_role IS DISTINCT FROM 'colaborador'::public.user_role THEN
    RAISE EXCEPTION 'Papel atual não permite reivindicar dono da conta';
  END IF;

  IF v_org IS NOT NULL THEN
    RAISE EXCEPTION 'Conta já vinculada a uma organização';
  END IF;

  IF v_created IS NOT NULL AND v_created < now() - interval '24 hours' THEN
    RAISE EXCEPTION 'Prazo para reivindicar dono da conta expirado';
  END IF;

  UPDATE public.profiles
  SET
    role = 'ceo'::public.user_role,
    nome = COALESCE(NULLIF(trim(p_nome), ''), nome)
  WHERE id = v_uid
    AND role = 'colaborador'::public.user_role
    AND organizacao_id IS NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_owner_ceo(text) TO authenticated;

-- 5) Assinatura: exige usuário autenticado = owner e papel ceo/admin.
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
  v_jwt_role text := COALESCE(auth.jwt()->>'role', '');
  v_caller_role public.user_role;
BEGIN
  IF p_plan_id NOT IN ('essencial', 'profissional', 'corporativo') THEN
    RAISE EXCEPTION 'Plano inválido';
  END IF;

  IF v_jwt_role <> 'service_role' THEN
    IF auth.uid() IS NULL OR auth.uid() <> p_owner_id THEN
      RAISE EXCEPTION 'Sem permissão para ativar assinatura de outro usuário';
    END IF;

    SELECT role INTO v_caller_role
    FROM public.profiles
    WHERE id = auth.uid();

    IF v_caller_role IS NULL OR v_caller_role NOT IN (
      'ceo'::public.user_role,
      'admin'::public.user_role
    ) THEN
      RAISE EXCEPTION 'Apenas CEO/Admin pode ativar assinatura';
    END IF;
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
