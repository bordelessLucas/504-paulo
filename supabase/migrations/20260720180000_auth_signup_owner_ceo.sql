-- Auto-cadastro (signUp do app): cria profiles com o role do user_metadata.
-- O app envia role=ceo para o dono da conta após o pagamento.
-- Cadastros via create-colaborador não enviam role no metadata → default colaborador,
-- e a Edge Function sobrescreve o profile em seguida com o papel correto.

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

  IF v_role_text IN ('colaborador', 'supervisor', 'gestor', 'gerente', 'rh', 'ceo', 'admin') THEN
    v_role := v_role_text::public.user_role;
  ELSE
    v_role := 'colaborador';
  END IF;

  INSERT INTO public.profiles (id, nome, role)
  VALUES (NEW.id, v_nome, v_role)
  ON CONFLICT (id) DO UPDATE
    SET
      nome = COALESCE(EXCLUDED.nome, profiles.nome),
      role = CASE
        WHEN EXCLUDED.role = 'ceo'::public.user_role THEN 'ceo'::public.user_role
        ELSE profiles.role
      END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_created();

COMMENT ON FUNCTION public.handle_auth_user_created() IS
  'Cria profile no signUp; usa raw_user_meta_data.role (ceo no auto-cadastro pago).';
