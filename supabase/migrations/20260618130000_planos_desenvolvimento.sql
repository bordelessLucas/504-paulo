-- Planos de Desenvolvimento Individual (PDI)

-- ---------------------------------------------------------------------------
-- Tipos de notificação PDI
-- ---------------------------------------------------------------------------

ALTER TYPE public.tipo_notificacao ADD VALUE IF NOT EXISTS 'pdi_criado';
ALTER TYPE public.tipo_notificacao ADD VALUE IF NOT EXISTS 'pdi_atualizado';
ALTER TYPE public.tipo_notificacao ADD VALUE IF NOT EXISTS 'pdi_vencendo';
ALTER TYPE public.tipo_notificacao ADD VALUE IF NOT EXISTS 'pdi_vencido';
ALTER TYPE public.tipo_notificacao ADD VALUE IF NOT EXISTS 'pdi_concluido';

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.planos_desenvolvimento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  avaliacao_origem_id uuid REFERENCES public.avaliacoes(id) ON DELETE SET NULL,
  criado_por_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  eixo text NOT NULL CHECK (eixo IN ('P1', 'P2', 'P3', 'geral')),
  titulo text NOT NULL,
  descricao text,
  indicador_sucesso text NOT NULL,
  prazo date NOT NULL,
  status text NOT NULL DEFAULT 'aberto' CHECK (
    status IN ('aberto', 'em_andamento', 'concluido', 'vencido', 'cancelado')
  ),
  progresso_pct integer NOT NULL DEFAULT 0 CHECK (progresso_pct BETWEEN 0 AND 100),
  observacoes_responsavel text,
  observacoes_colaborador text,
  concluido_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT planos_desenvolvimento_titulo_min CHECK (char_length(trim(titulo)) >= 10),
  CONSTRAINT planos_desenvolvimento_indicador_min CHECK (char_length(trim(indicador_sucesso)) >= 3)
);

CREATE INDEX IF NOT EXISTS planos_desenvolvimento_colaborador_status_idx
  ON public.planos_desenvolvimento (colaborador_id, status, prazo);

CREATE INDEX IF NOT EXISTS planos_desenvolvimento_criado_por_idx
  ON public.planos_desenvolvimento (criado_por_id, created_at DESC);

CREATE INDEX IF NOT EXISTS planos_desenvolvimento_prazo_status_idx
  ON public.planos_desenvolvimento (prazo, status);

CREATE TABLE IF NOT EXISTS public.pdi_atualizacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pdi_id uuid NOT NULL REFERENCES public.planos_desenvolvimento(id) ON DELETE CASCADE,
  autor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  status_anterior text,
  status_novo text,
  progresso_anterior integer,
  progresso_novo integer,
  comentario text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pdi_atualizacoes_pdi_created_idx
  ON public.pdi_atualizacoes (pdi_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Helpers de acesso
-- ---------------------------------------------------------------------------

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
          colab.lider_id IS NULL
          AND colab.departamento IS NOT NULL
          AND gestor.departamento IS NOT NULL
          AND colab.departamento = gestor.departamento
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.usuario_tem_acesso_total_pdi()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('rh', 'ceo', 'admin')
  );
$$;

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.trg_planos_desenvolvimento_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();

  IF NEW.status = 'concluido' AND (OLD.status IS DISTINCT FROM 'concluido' OR OLD.concluido_em IS NULL) THEN
    NEW.concluido_em := COALESCE(NEW.concluido_em, now());
    NEW.progresso_pct := 100;
  END IF;

  IF NEW.status = 'cancelado' AND OLD.status IS DISTINCT FROM 'cancelado' THEN
    NEW.progresso_pct := COALESCE(NEW.progresso_pct, OLD.progresso_pct);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_planos_desenvolvimento_updated_at ON public.planos_desenvolvimento;

CREATE TRIGGER trg_planos_desenvolvimento_updated_at
  BEFORE UPDATE ON public.planos_desenvolvimento
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_planos_desenvolvimento_set_updated_at();

-- ---------------------------------------------------------------------------
-- Vencimento automático (por linha + lote)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.marcar_pdi_vencido_se_necessario(p_pdi_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pdi public.planos_desenvolvimento%ROWTYPE;
  v_colaborador_nome text;
  v_metadata jsonb;
BEGIN
  SELECT * INTO v_pdi
  FROM public.planos_desenvolvimento
  WHERE id = p_pdi_id
    AND status IN ('aberto', 'em_andamento')
    AND prazo < CURRENT_DATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  UPDATE public.planos_desenvolvimento
  SET status = 'vencido', updated_at = now()
  WHERE id = p_pdi_id;

  SELECT nome INTO v_colaborador_nome FROM public.profiles WHERE id = v_pdi.colaborador_id;

  v_metadata := jsonb_build_object(
    'pdi_id', p_pdi_id,
    'colaborador_id', v_pdi.colaborador_id,
    'eixo', v_pdi.eixo,
    'status', 'vencido'
  );

  PERFORM public.criar_notificacao(
    v_pdi.colaborador_id,
    'pdi_vencido',
    'PDI vencido',
    'O plano "' || v_pdi.titulo || '" está vencido. Entre em contato com seu líder.',
    v_metadata,
    NULL
  );

  IF v_pdi.criado_por_id IS NOT NULL THEN
    PERFORM public.criar_notificacao(
      v_pdi.criado_por_id,
      'pdi_vencido',
      'PDI vencido',
      'O PDI de ' || COALESCE(v_colaborador_nome, 'colaborador') || ' ("' || v_pdi.titulo || '") está vencido.',
      v_metadata,
      NULL
    );
  END IF;

  PERFORM public.notificar_por_papeis(
    ARRAY['rh']::public.user_role[],
    'pdi_vencido',
    'PDI vencido',
    'PDI vencido: ' || COALESCE(v_colaborador_nome, 'colaborador') || ' — "' || v_pdi.titulo || '".',
    v_metadata,
    NULL
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.processar_pdis_vencidos()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pdi_id uuid;
  v_count integer := 0;
BEGIN
  FOR v_pdi_id IN
    SELECT id
    FROM public.planos_desenvolvimento
    WHERE status IN ('aberto', 'em_andamento')
      AND prazo < CURRENT_DATE
  LOOP
    PERFORM public.marcar_pdi_vencido_se_necessario(v_pdi_id);
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.processar_alertas_pdi_vencendo(p_dias integer DEFAULT 7)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.planos_desenvolvimento%ROWTYPE;
  v_colaborador_nome text;
  v_metadata jsonb;
  v_count integer := 0;
BEGIN
  FOR v_row IN
    SELECT *
    FROM public.planos_desenvolvimento
    WHERE status IN ('aberto', 'em_andamento')
      AND prazo >= CURRENT_DATE
      AND prazo <= (CURRENT_DATE + p_dias)
  LOOP
    IF EXISTS (
      SELECT 1
      FROM public.notificacoes n
      WHERE n.tipo = 'pdi_vencendo'
        AND n.destinatario_id = v_row.colaborador_id
        AND n.metadata->>'pdi_id' = v_row.id::text
        AND n.created_at >= (CURRENT_DATE - p_dias)
    ) THEN
      CONTINUE;
    END IF;

    SELECT nome INTO v_colaborador_nome FROM public.profiles WHERE id = v_row.colaborador_id;

    v_metadata := jsonb_build_object(
      'pdi_id', v_row.id,
      'colaborador_id', v_row.colaborador_id,
      'eixo', v_row.eixo,
      'prazo', v_row.prazo
    );

    PERFORM public.criar_notificacao(
      v_row.colaborador_id,
      'pdi_vencendo',
      'PDI vencendo em breve',
      'O plano "' || v_row.titulo || '" vence em ' || v_row.prazo::text || '.',
      v_metadata,
      NULL
    );

    IF v_row.criado_por_id IS NOT NULL THEN
      PERFORM public.criar_notificacao(
        v_row.criado_por_id,
        'pdi_vencendo',
        'PDI vencendo em breve',
        'O PDI de ' || COALESCE(v_colaborador_nome, 'colaborador') || ' vence em ' || v_row.prazo::text || '.',
        v_metadata,
        NULL
      );
    END IF;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.processar_pdis_vencidos() TO authenticated;
GRANT EXECUTE ON FUNCTION public.processar_alertas_pdi_vencendo(integer) TO authenticated;

-- ---------------------------------------------------------------------------
-- Notificações PDI (insert / update)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.trg_notify_pdi_criado()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_criador_nome text;
  v_metadata jsonb;
BEGIN
  SELECT nome INTO v_criador_nome FROM public.profiles WHERE id = NEW.criado_por_id;

  v_metadata := jsonb_build_object(
    'pdi_id', NEW.id,
    'colaborador_id', NEW.colaborador_id,
    'eixo', NEW.eixo,
    'status', NEW.status
  );

  PERFORM public.criar_notificacao(
    NEW.colaborador_id,
    'pdi_criado',
    'Novo plano de desenvolvimento',
    'Um novo PDI foi criado para você: "' || NEW.titulo || '".',
    v_metadata,
    NULL
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_pdi_criado ON public.planos_desenvolvimento;

CREATE TRIGGER trg_notify_pdi_criado
  AFTER INSERT ON public.planos_desenvolvimento
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_pdi_criado();

CREATE OR REPLACE FUNCTION public.trg_notify_pdi_atualizado()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_colaborador_nome text;
  v_metadata jsonb;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status
     AND NEW.progresso_pct IS NOT DISTINCT FROM OLD.progresso_pct
     AND NEW.observacoes_responsavel IS NOT DISTINCT FROM OLD.observacoes_responsavel
     AND NEW.observacoes_colaborador IS NOT DISTINCT FROM OLD.observacoes_colaborador THEN
    RETURN NEW;
  END IF;

  SELECT nome INTO v_colaborador_nome FROM public.profiles WHERE id = NEW.colaborador_id;

  v_metadata := jsonb_build_object(
    'pdi_id', NEW.id,
    'colaborador_id', NEW.colaborador_id,
    'eixo', NEW.eixo,
    'status', NEW.status,
    'progresso_pct', NEW.progresso_pct
  );

  IF NEW.status = 'concluido' AND OLD.status IS DISTINCT FROM 'concluido' THEN
    PERFORM public.criar_notificacao(
      NEW.colaborador_id,
      'pdi_concluido',
      'PDI concluído',
      'Parabéns! O plano "' || NEW.titulo || '" foi marcado como concluído.',
      v_metadata,
      NULL
    );

    PERFORM public.notificar_por_papeis(
      ARRAY['rh']::public.user_role[],
      'pdi_concluido',
      'PDI concluído',
      COALESCE(v_colaborador_nome, 'Colaborador') || ' concluiu o PDI "' || NEW.titulo || '".',
      v_metadata,
      NULL
    );
  ELSE
    PERFORM public.criar_notificacao(
      NEW.colaborador_id,
      'pdi_atualizado',
      'PDI atualizado',
      'Seu plano "' || NEW.titulo || '" foi atualizado. Progresso: ' || NEW.progresso_pct || '%.',
      v_metadata,
      NULL
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_pdi_atualizado ON public.planos_desenvolvimento;

CREATE TRIGGER trg_notify_pdi_atualizado
  AFTER UPDATE ON public.planos_desenvolvimento
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_pdi_atualizado();

-- Histórico automático de atualizações
CREATE OR REPLACE FUNCTION public.trg_pdi_registrar_atualizacao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status
     AND NEW.progresso_pct IS NOT DISTINCT FROM OLD.progresso_pct
     AND NEW.observacoes_responsavel IS NOT DISTINCT FROM OLD.observacoes_responsavel
     AND NEW.observacoes_colaborador IS NOT DISTINCT FROM OLD.observacoes_colaborador THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.pdi_atualizacoes (
    pdi_id,
    autor_id,
    status_anterior,
    status_novo,
    progresso_anterior,
    progresso_novo,
    comentario
  )
  VALUES (
    NEW.id,
    auth.uid(),
    OLD.status,
    NEW.status,
    OLD.progresso_pct,
    NEW.progresso_pct,
    COALESCE(NEW.observacoes_responsavel, NEW.observacoes_colaborador)
  );

  IF NEW.status IN ('aberto', 'em_andamento') AND NEW.prazo < CURRENT_DATE THEN
    PERFORM public.marcar_pdi_vencido_se_necessario(NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pdi_registrar_atualizacao ON public.planos_desenvolvimento;

CREATE TRIGGER trg_pdi_registrar_atualizacao
  AFTER UPDATE ON public.planos_desenvolvimento
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_pdi_registrar_atualizacao();

-- ---------------------------------------------------------------------------
-- Avaliação aprovada com nota baixa → sugerir PDI ao avaliador
-- ---------------------------------------------------------------------------

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
  v_eixo_baixo text;
  v_tem_nota_baixa boolean := false;
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

    SELECT p.codigo INTO v_eixo_baixo
    FROM public.respostas r
    JOIN public.perguntas p ON p.id = r.pergunta_id
    WHERE r.avaliacao_id = NEW.id
      AND r.nota IS NOT NULL
      AND r.nota <= 1
    ORDER BY r.nota ASC, p.codigo ASC
    LIMIT 1;

    v_tem_nota_baixa := v_eixo_baixo IS NOT NULL;

    IF v_tem_nota_baixa AND NEW.avaliador_id IS NOT NULL THEN
      PERFORM public.criar_notificacao(
        NEW.avaliador_id,
        'avaliacao_registrada',
        'Considere criar um PDI',
        'A avaliação de ' || COALESCE(v_avaliado_nome, 'colaborador')
          || ' foi aprovada com nota baixa em ' || COALESCE(v_eixo_baixo, 'um eixo')
          || '. Considere criar um PDI.',
        v_metadata || jsonb_build_object('eixo_baixo', v_eixo_baixo),
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

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.planos_desenvolvimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdi_atualizacoes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.planos_desenvolvimento TO authenticated;
GRANT SELECT, INSERT ON public.pdi_atualizacoes TO authenticated;

DROP POLICY IF EXISTS pdi_select_colaborador ON public.planos_desenvolvimento;
CREATE POLICY pdi_select_colaborador ON public.planos_desenvolvimento
  FOR SELECT USING (colaborador_id = auth.uid());

DROP POLICY IF EXISTS pdi_select_gestao ON public.planos_desenvolvimento;
CREATE POLICY pdi_select_gestao ON public.planos_desenvolvimento
  FOR SELECT USING (public.usuario_gerencia_colaborador(colaborador_id));

DROP POLICY IF EXISTS pdi_select_total ON public.planos_desenvolvimento;
CREATE POLICY pdi_select_total ON public.planos_desenvolvimento
  FOR SELECT USING (public.usuario_tem_acesso_total_pdi());

DROP POLICY IF EXISTS pdi_insert_gestao ON public.planos_desenvolvimento;
CREATE POLICY pdi_insert_gestao ON public.planos_desenvolvimento
  FOR INSERT WITH CHECK (
    criado_por_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('supervisor', 'gestor', 'gerente', 'rh', 'admin')
    )
    AND (
      public.usuario_tem_acesso_total_pdi()
      OR public.usuario_gerencia_colaborador(colaborador_id)
    )
  );

DROP POLICY IF EXISTS pdi_update_gestao ON public.planos_desenvolvimento;
CREATE POLICY pdi_update_gestao ON public.planos_desenvolvimento
  FOR UPDATE USING (
    public.usuario_tem_acesso_total_pdi()
    OR public.usuario_gerencia_colaborador(colaborador_id)
    OR criado_por_id = auth.uid()
  );

DROP POLICY IF EXISTS pdi_update_colaborador ON public.planos_desenvolvimento;
CREATE POLICY pdi_update_colaborador ON public.planos_desenvolvimento
  FOR UPDATE USING (colaborador_id = auth.uid());

DROP POLICY IF EXISTS pdi_atualizacoes_select ON public.pdi_atualizacoes;
CREATE POLICY pdi_atualizacoes_select ON public.pdi_atualizacoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.planos_desenvolvimento p
      WHERE p.id = pdi_id
        AND (
          p.colaborador_id = auth.uid()
          OR public.usuario_gerencia_colaborador(p.colaborador_id)
          OR public.usuario_tem_acesso_total_pdi()
        )
    )
  );

DROP POLICY IF EXISTS pdi_atualizacoes_insert ON public.pdi_atualizacoes;
CREATE POLICY pdi_atualizacoes_insert ON public.pdi_atualizacoes
  FOR INSERT WITH CHECK (
    autor_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.planos_desenvolvimento p
      WHERE p.id = pdi_id
        AND (
          public.usuario_gerencia_colaborador(p.colaborador_id)
          OR public.usuario_tem_acesso_total_pdi()
          OR p.colaborador_id = auth.uid()
        )
    )
  );
