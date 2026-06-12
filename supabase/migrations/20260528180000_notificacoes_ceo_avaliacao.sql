-- CEO também recebe alerta quando avaliação é registrada (visibilidade executiva).
-- Sem usuário RH ativo, o CEO ainda precisa ver pendências de validação.

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
    ARRAY['rh', 'admin', 'ceo']::public.user_role[],
    'avaliacao_registrada',
    v_titulo,
    v_mensagem,
    v_metadata,
    NEW.avaliador_id
  );

  RETURN NEW;
END;
$$;
