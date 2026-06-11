-- Alertas em tempo real por papel (Supabase Realtime + triggers)

DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_notificacao') THEN
    CREATE TYPE public.tipo_notificacao AS ENUM (
      'avaliacao_registrada',
      'autoavaliacao_enviada',
      'solicitacao_reajuste',
      'solicitacao_pendente_ceo',
      'solicitacao_aprovada',
      'solicitacao_recusada',
      'incidente_registrado',
      'decisao_anual_registrada'
    );
  END IF;
END
$do$;

CREATE TABLE IF NOT EXISTS public.notificacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destinatario_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tipo public.tipo_notificacao NOT NULL,
  titulo text NOT NULL,
  mensagem text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  lida boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notificacoes_destinatario_lida_idx
  ON public.notificacoes (destinatario_id, lida, created_at DESC);

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, UPDATE ON public.notificacoes TO authenticated;

DROP POLICY IF EXISTS notificacoes_select_own ON public.notificacoes;
CREATE POLICY notificacoes_select_own ON public.notificacoes
  FOR SELECT USING (destinatario_id = auth.uid());

DROP POLICY IF EXISTS notificacoes_update_own ON public.notificacoes;
CREATE POLICY notificacoes_update_own ON public.notificacoes
  FOR UPDATE USING (destinatario_id = auth.uid());

ALTER TABLE public.notificacoes REPLICA IDENTITY FULL;

DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END
$do$;

-- ---------------------------------------------------------------------------
-- Helpers (SECURITY DEFINER — inserção apenas via triggers)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.criar_notificacao(
  p_destinatario_id uuid,
  p_tipo public.tipo_notificacao,
  p_titulo text,
  p_mensagem text,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_excluir_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_destinatario_id IS NULL THEN
    RETURN;
  END IF;

  IF p_excluir_id IS NOT NULL AND p_destinatario_id = p_excluir_id THEN
    RETURN;
  END IF;

  INSERT INTO public.notificacoes (destinatario_id, tipo, titulo, mensagem, metadata)
  VALUES (p_destinatario_id, p_tipo, p_titulo, p_mensagem, COALESCE(p_metadata, '{}'::jsonb));
END;
$$;

CREATE OR REPLACE FUNCTION public.notificar_por_papeis(
  p_roles public.user_role[],
  p_tipo public.tipo_notificacao,
  p_titulo text,
  p_mensagem text,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_excluir_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_destinatario_id uuid;
BEGIN
  FOR v_destinatario_id IN
    SELECT p.id
    FROM public.profiles p
    WHERE p.role = ANY (p_roles)
      AND (p_excluir_id IS NULL OR p.id <> p_excluir_id)
  LOOP
    PERFORM public.criar_notificacao(
      v_destinatario_id,
      p_tipo,
      p_titulo,
      p_mensagem,
      p_metadata,
      NULL
    );
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.notificar_gerentes_do_colaborador(
  p_colaborador_id uuid,
  p_tipo public.tipo_notificacao,
  p_titulo text,
  p_mensagem text,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_excluir_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_departamento text;
  v_gerente_id uuid;
BEGIN
  SELECT departamento INTO v_departamento
  FROM public.profiles
  WHERE id = p_colaborador_id;

  FOR v_gerente_id IN
    SELECT p.id
    FROM public.profiles p
    WHERE p.role = 'gerente'
      AND (p_excluir_id IS NULL OR p.id <> p_excluir_id)
      AND (
        v_departamento IS NULL
        OR p.departamento IS NULL
        OR p.departamento = v_departamento
      )
  LOOP
    PERFORM public.criar_notificacao(
      v_gerente_id,
      p_tipo,
      p_titulo,
      p_mensagem,
      p_metadata,
      NULL
    );
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.label_tipo_avaliacao(p_tipo public.tipo_avaliacao)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_tipo
    WHEN 'quinzenal' THEN 'quinzenal'
    WHEN 'semestral' THEN 'semestral'
    WHEN 'anual' THEN 'anual'
    ELSE 'de desempenho'
  END;
$$;

-- ---------------------------------------------------------------------------
-- Avaliação registrada → CEO, RH, admin, colaborador avaliado, gerentes
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.trg_notify_avaliacao_registrada()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_avaliador_nome text;
  v_avaliador_role public.user_role;
  v_avaliado_nome text;
  v_tipo_label text;
  v_titulo text;
  v_mensagem text;
  v_metadata jsonb;
BEGIN
  SELECT nome, role
  INTO v_avaliador_nome, v_avaliador_role
  FROM public.profiles
  WHERE id = NEW.avaliador_id;

  SELECT nome INTO v_avaliado_nome
  FROM public.profiles
  WHERE id = NEW.avaliado_id;

  v_tipo_label := public.label_tipo_avaliacao(NEW.tipo);
  v_titulo := 'Nova avaliação ' || v_tipo_label;
  v_mensagem := COALESCE(v_avaliador_nome, 'Avaliador')
    || ' avaliou '
    || COALESCE(v_avaliado_nome, 'colaborador')
    || '.';

  v_metadata := jsonb_build_object(
    'avaliacao_id', NEW.id,
    'avaliador_id', NEW.avaliador_id,
    'avaliado_id', NEW.avaliado_id,
    'tipo', NEW.tipo
  );

  PERFORM public.notificar_por_papeis(
    ARRAY['ceo', 'admin', 'rh']::public.user_role[],
    'avaliacao_registrada',
    v_titulo,
    v_mensagem,
    v_metadata,
    NEW.avaliador_id
  );

  PERFORM public.criar_notificacao(
    NEW.avaliado_id,
    'avaliacao_registrada',
    'Nova avaliação recebida',
    'Você recebeu uma avaliação ' || v_tipo_label || '.',
    v_metadata,
    NEW.avaliador_id
  );

  IF v_avaliador_role IN ('supervisor', 'gestor') THEN
    PERFORM public.notificar_gerentes_do_colaborador(
      NEW.avaliado_id,
      'avaliacao_registrada',
      v_titulo,
      v_mensagem,
      v_metadata,
      NEW.avaliador_id
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_avaliacao_registrada ON public.avaliacoes;
CREATE TRIGGER trg_notify_avaliacao_registrada
  AFTER INSERT ON public.avaliacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_avaliacao_registrada();

-- ---------------------------------------------------------------------------
-- Solicitações salariais (reajuste / autoavaliação)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.trg_notify_melhoria_inserida()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_colaborador_nome text;
  v_gerente_nome text;
  v_is_autoavaliacao boolean;
  v_tipo public.tipo_notificacao;
  v_titulo text;
  v_mensagem text;
  v_metadata jsonb;
BEGIN
  SELECT nome INTO v_colaborador_nome
  FROM public.profiles
  WHERE id = NEW.colaborador_id;

  v_is_autoavaliacao := NEW.gerente_id IS NULL
    AND NEW.justificativa ILIKE 'Novas qualificações%';

  IF v_is_autoavaliacao THEN
    v_tipo := 'autoavaliacao_enviada';
    v_titulo := 'Nova autoavaliação';
    v_mensagem := COALESCE(v_colaborador_nome, 'Colaborador')
      || ' enviou uma solicitação de autoavaliação.';
  ELSE
    v_tipo := 'solicitacao_reajuste';
    v_titulo := 'Nova solicitação de reajuste';

    IF NEW.gerente_id IS NOT NULL THEN
      SELECT nome INTO v_gerente_nome
      FROM public.profiles
      WHERE id = NEW.gerente_id;

      v_mensagem := COALESCE(v_gerente_nome, 'Gerente')
        || ' solicitou reajuste para '
        || COALESCE(v_colaborador_nome, 'colaborador')
        || '.';
    ELSE
      v_mensagem := COALESCE(v_colaborador_nome, 'Colaborador')
        || ' enviou uma solicitação de melhoria salarial.';
    END IF;
  END IF;

  v_metadata := jsonb_build_object(
    'solicitacao_id', NEW.id,
    'colaborador_id', NEW.colaborador_id,
    'gerente_id', NEW.gerente_id,
    'status', NEW.status
  );

  PERFORM public.notificar_por_papeis(
    ARRAY['rh']::public.user_role[],
    v_tipo,
    v_titulo,
    v_mensagem,
    v_metadata,
    NEW.colaborador_id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_melhoria_inserida ON public.melhorias_salariais;
CREATE TRIGGER trg_notify_melhoria_inserida
  AFTER INSERT ON public.melhorias_salariais
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_melhoria_inserida();

CREATE OR REPLACE FUNCTION public.trg_notify_melhoria_atualizada()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_colaborador_nome text;
  v_metadata jsonb;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  SELECT nome INTO v_colaborador_nome
  FROM public.profiles
  WHERE id = NEW.colaborador_id;

  v_metadata := jsonb_build_object(
    'solicitacao_id', NEW.id,
    'colaborador_id', NEW.colaborador_id,
    'gerente_id', NEW.gerente_id,
    'status', NEW.status
  );

  IF NEW.status = 'pendente_ceo' THEN
    PERFORM public.notificar_por_papeis(
      ARRAY['ceo', 'admin']::public.user_role[],
      'solicitacao_pendente_ceo',
      'Solicitação aguardando CEO',
      'RH encaminhou a solicitação de '
        || COALESCE(v_colaborador_nome, 'colaborador')
        || ' para aprovação final.',
      v_metadata,
      NULL
    );
  ELSIF NEW.status = 'aprovado' THEN
    PERFORM public.criar_notificacao(
      NEW.colaborador_id,
      'solicitacao_aprovada',
      'Solicitação aprovada',
      'Sua solicitação de melhoria salarial foi aprovada.',
      v_metadata,
      NULL
    );

    IF NEW.gerente_id IS NOT NULL THEN
      PERFORM public.criar_notificacao(
        NEW.gerente_id,
        'solicitacao_aprovada',
        'Solicitação aprovada',
        'A solicitação de '
          || COALESCE(v_colaborador_nome, 'colaborador')
          || ' foi aprovada pelo CEO.',
        v_metadata,
        NULL
      );
    END IF;
  ELSIF NEW.status = 'recusado' THEN
    PERFORM public.criar_notificacao(
      NEW.colaborador_id,
      'solicitacao_recusada',
      'Solicitação recusada',
      'Sua solicitação de melhoria salarial foi recusada.',
      v_metadata,
      NULL
    );

    IF NEW.gerente_id IS NOT NULL THEN
      PERFORM public.criar_notificacao(
        NEW.gerente_id,
        'solicitacao_recusada',
        'Solicitação recusada',
        'A solicitação de '
          || COALESCE(v_colaborador_nome, 'colaborador')
          || ' foi recusada.',
        v_metadata,
        NULL
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_melhoria_atualizada ON public.melhorias_salariais;
CREATE TRIGGER trg_notify_melhoria_atualizada
  AFTER UPDATE OF status ON public.melhorias_salariais
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_melhoria_atualizada();

-- ---------------------------------------------------------------------------
-- Incidentes → CEO, RH, admin, gerentes do departamento, colaborador
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.trg_notify_incidente_registrado()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_colaborador_nome text;
  v_registrador_nome text;
  v_tipo_label text;
  v_titulo text;
  v_mensagem text;
  v_metadata jsonb;
BEGIN
  SELECT nome INTO v_colaborador_nome
  FROM public.profiles
  WHERE id = NEW.colaborador_id;

  SELECT nome INTO v_registrador_nome
  FROM public.profiles
  WHERE id = NEW.registrado_por_id;

  v_tipo_label := CASE NEW.tipo_incidente
    WHEN 'acidente_sms' THEN 'Acidente SMS'
    WHEN 'no_show' THEN 'Falta (No-show)'
    WHEN 'advertencia' THEN 'Advertência'
    ELSE 'Incidente'
  END;

  v_titulo := 'Incidente registrado';
  v_mensagem := COALESCE(v_registrador_nome, 'RH')
    || ' registrou '
    || lower(v_tipo_label)
    || ' para '
    || COALESCE(v_colaborador_nome, 'colaborador')
    || '.';

  v_metadata := jsonb_build_object(
    'incidente_id', NEW.id,
    'colaborador_id', NEW.colaborador_id,
    'tipo_incidente', NEW.tipo_incidente
  );

  PERFORM public.notificar_por_papeis(
    ARRAY['ceo', 'admin', 'rh']::public.user_role[],
    'incidente_registrado',
    v_titulo,
    v_mensagem,
    v_metadata,
    NEW.registrado_por_id
  );

  PERFORM public.notificar_gerentes_do_colaborador(
    NEW.colaborador_id,
    'incidente_registrado',
    v_titulo,
    v_mensagem,
    v_metadata,
    NEW.registrado_por_id
  );

  PERFORM public.criar_notificacao(
    NEW.colaborador_id,
    'incidente_registrado',
    'Incidente registrado',
    'Foi registrado um incidente (' || lower(v_tipo_label) || ') em seu histórico.',
    v_metadata,
    NEW.registrado_por_id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_incidente_registrado ON public.incidentes;
CREATE TRIGGER trg_notify_incidente_registrado
  AFTER INSERT ON public.incidentes
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_incidente_registrado();

-- ---------------------------------------------------------------------------
-- Decisão anual estratégica → CEO, RH, admin
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.trg_notify_decisao_anual()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_colaborador_nome text;
  v_decisor_nome text;
  v_titulo text;
  v_mensagem text;
  v_metadata jsonb;
BEGIN
  SELECT nome INTO v_colaborador_nome
  FROM public.profiles
  WHERE id = NEW.colaborador_id;

  SELECT nome INTO v_decisor_nome
  FROM public.profiles
  WHERE id = NEW.decidido_por_id;

  v_titulo := 'Decisão anual registrada';
  v_mensagem := COALESCE(v_decisor_nome, 'Gestão')
    || ' registrou decisão anual para '
    || COALESCE(v_colaborador_nome, 'colaborador')
    || ' ('
    || NEW.ano_referencia::text
    || ').';

  v_metadata := jsonb_build_object(
    'decisao_id', NEW.id,
    'colaborador_id', NEW.colaborador_id,
    'ano_referencia', NEW.ano_referencia,
    'tipo_beneficio', NEW.tipo_beneficio
  );

  PERFORM public.notificar_por_papeis(
    ARRAY['ceo', 'admin', 'rh']::public.user_role[],
    'decisao_anual_registrada',
    v_titulo,
    v_mensagem,
    v_metadata,
    NEW.decidido_por_id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_decisao_anual ON public.decisoes_anuais_estrategicas;
CREATE TRIGGER trg_notify_decisao_anual
  AFTER INSERT ON public.decisoes_anuais_estrategicas
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_decisao_anual();
