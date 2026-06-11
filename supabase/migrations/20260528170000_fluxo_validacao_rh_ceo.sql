-- Fluxo: RH valida → CEO aprova ou recusa (solicitações e avaliações)
-- Admin valida como RH; somente CEO decide aprovação final.

DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_validacao') THEN
    CREATE TYPE public.status_validacao AS ENUM (
      'pendente_rh',
      'pendente_ceo',
      'aprovada',
      'recusada',
      'devolvida'
    );
  END IF;
END
$do$;

ALTER TABLE public.avaliacoes
  ADD COLUMN IF NOT EXISTS status public.status_validacao NOT NULL DEFAULT 'pendente_rh';

-- Avaliações já existentes permanecem visíveis para colaboradores
UPDATE public.avaliacoes
SET status = 'aprovada'
WHERE status = 'pendente_rh';

-- View mascarada: colaborador só vê avaliações aprovadas pelo CEO
DROP VIEW IF EXISTS public.avaliacoes_masked;

CREATE VIEW public.avaliacoes_masked AS
SELECT id, avaliado_id, tipo, created_at
FROM public.avaliacoes
WHERE status = 'aprovada';

GRANT SELECT ON public.avaliacoes_masked TO authenticated;
GRANT UPDATE ON public.avaliacoes TO authenticated;

-- ---------------------------------------------------------------------------
-- RLS: melhorias_salariais — RH valida; CEO aprova/recusa
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS melhorias_update_rh ON public.melhorias_salariais;

CREATE POLICY melhorias_update_rh ON public.melhorias_salariais
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('rh', 'admin')
    )
    AND status = 'pendente_rh'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('rh', 'admin')
    )
    AND status IN ('pendente_ceo', 'devolvida')
  );

DROP POLICY IF EXISTS melhorias_update_ceo ON public.melhorias_salariais;

CREATE POLICY melhorias_update_ceo ON public.melhorias_salariais
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'ceo'
    )
    AND status = 'pendente_ceo'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'ceo'
    )
    AND status IN ('aprovado', 'recusado')
  );

-- ---------------------------------------------------------------------------
-- RLS: avaliacoes — RH valida; CEO aprova/recusa
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS avaliacoes_update_rh ON public.avaliacoes;
CREATE POLICY avaliacoes_update_rh ON public.avaliacoes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('rh', 'admin')
    )
    AND status = 'pendente_rh'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('rh', 'admin')
    )
    AND status IN ('pendente_ceo', 'devolvida')
  );

DROP POLICY IF EXISTS avaliacoes_update_ceo ON public.avaliacoes;
CREATE POLICY avaliacoes_update_ceo ON public.avaliacoes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'ceo'
    )
    AND status = 'pendente_ceo'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'ceo'
    )
    AND status IN ('aprovada', 'recusada')
  );

-- ---------------------------------------------------------------------------
-- Notificações: avaliação aguarda RH; após validação notifica CEO
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
  v_titulo := 'Avaliação aguardando validação do RH';
  v_mensagem := COALESCE(v_avaliador_nome, 'Avaliador')
    || ' registrou avaliação '
    || v_tipo_label
    || ' de '
    || COALESCE(v_avaliado_nome, 'colaborador')
    || '.';

  v_metadata := jsonb_build_object(
    'avaliacao_id', NEW.id,
    'avaliador_id', NEW.avaliador_id,
    'avaliado_id', NEW.avaliado_id,
    'tipo', NEW.tipo,
    'status', NEW.status
  );

  PERFORM public.notificar_por_papeis(
    ARRAY['rh', 'admin']::public.user_role[],
    'avaliacao_registrada',
    v_titulo,
    v_mensagem,
    v_metadata,
    NEW.avaliador_id
  );

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_notify_avaliacao_atualizada()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_avaliador_nome text;
  v_avaliado_nome text;
  v_tipo_label text;
  v_metadata jsonb;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  SELECT nome INTO v_avaliador_nome FROM public.profiles WHERE id = NEW.avaliador_id;
  SELECT nome INTO v_avaliado_nome FROM public.profiles WHERE id = NEW.avaliado_id;
  v_tipo_label := public.label_tipo_avaliacao(NEW.tipo);

  v_metadata := jsonb_build_object(
    'avaliacao_id', NEW.id,
    'avaliador_id', NEW.avaliador_id,
    'avaliado_id', NEW.avaliado_id,
    'tipo', NEW.tipo,
    'status', NEW.status
  );

  IF NEW.status = 'pendente_ceo' THEN
    PERFORM public.notificar_por_papeis(
      ARRAY['ceo']::public.user_role[],
      'avaliacao_registrada',
      'Avaliação aguardando aprovação do CEO',
      'RH validou a avaliação '
        || v_tipo_label
        || ' de '
        || COALESCE(v_avaliado_nome, 'colaborador')
        || '.',
      v_metadata,
      NULL
    );
  ELSIF NEW.status = 'aprovada' THEN
    PERFORM public.criar_notificacao(
      NEW.avaliado_id,
      'avaliacao_registrada',
      'Avaliação aprovada',
      'Sua avaliação ' || v_tipo_label || ' foi aprovada pelo CEO.',
      v_metadata,
      NULL
    );

    IF NEW.avaliador_id IS NOT NULL THEN
      PERFORM public.criar_notificacao(
        NEW.avaliador_id,
        'avaliacao_registrada',
        'Avaliação aprovada',
        'A avaliação ' || v_tipo_label || ' de ' || COALESCE(v_avaliado_nome, 'colaborador') || ' foi aprovada.',
        v_metadata,
        NULL
      );
    END IF;
  ELSIF NEW.status = 'recusada' THEN
    IF NEW.avaliador_id IS NOT NULL THEN
      PERFORM public.criar_notificacao(
        NEW.avaliador_id,
        'avaliacao_registrada',
        'Avaliação recusada',
        'A avaliação ' || v_tipo_label || ' de ' || COALESCE(v_avaliado_nome, 'colaborador') || ' foi recusada pelo CEO.',
        v_metadata,
        NULL
      );
    END IF;
  ELSIF NEW.status = 'devolvida' THEN
    IF NEW.avaliador_id IS NOT NULL THEN
      PERFORM public.criar_notificacao(
        NEW.avaliador_id,
        'avaliacao_registrada',
        'Avaliação devolvida pelo RH',
        'A avaliação ' || v_tipo_label || ' de ' || COALESCE(v_avaliado_nome, 'colaborador') || ' foi devolvida para correção.',
        v_metadata,
        NULL
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_avaliacao_atualizada ON public.avaliacoes;
CREATE TRIGGER trg_notify_avaliacao_atualizada
  AFTER UPDATE OF status ON public.avaliacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_avaliacao_atualizada();

-- RH devolve solicitação (não recusa definitivamente)
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
      ARRAY['ceo']::public.user_role[],
      'solicitacao_pendente_ceo',
      'Solicitação aguardando aprovação do CEO',
      'RH validou a solicitação de '
        || COALESCE(v_colaborador_nome, 'colaborador')
        || ' para decisão final.',
      v_metadata,
      NULL
    );
  ELSIF NEW.status = 'devolvida' THEN
    IF NEW.gerente_id IS NOT NULL THEN
      PERFORM public.criar_notificacao(
        NEW.gerente_id,
        'solicitacao_recusada',
        'Solicitação devolvida pelo RH',
        'A solicitação de '
          || COALESCE(v_colaborador_nome, 'colaborador')
          || ' foi devolvida para ajustes.',
        v_metadata,
        NULL
      );
    END IF;

    PERFORM public.criar_notificacao(
      NEW.colaborador_id,
      'solicitacao_recusada',
      'Solicitação devolvida pelo RH',
      'Sua solicitação foi devolvida pelo RH para revisão.',
      v_metadata,
      NULL
    );
  ELSIF NEW.status = 'aprovado' THEN
    PERFORM public.criar_notificacao(
      NEW.colaborador_id,
      'solicitacao_aprovada',
      'Solicitação aprovada',
      'Sua solicitação de melhoria salarial foi aprovada pelo CEO.',
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
      'Sua solicitação de melhoria salarial foi recusada pelo CEO.',
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
          || ' foi recusada pelo CEO.',
        v_metadata,
        NULL
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
