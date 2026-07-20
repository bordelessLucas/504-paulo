-- DNA Performance (Excel Rev Jul 20 2026): cadastros, incidentes ricos, avaliações e reajuste monetário

-- ---------------------------------------------------------------------------
-- Profiles: campos extras do cadastro colaborador
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS telefone_2 text,
  ADD COLUMN IF NOT EXISTS endereco text,
  ADD COLUMN IF NOT EXISTS cidade_uf text,
  ADD COLUMN IF NOT EXISTS telefone_emergencia text,
  ADD COLUMN IF NOT EXISTS tipo_contrato text,
  ADD COLUMN IF NOT EXISTS especialidade text,
  ADD COLUMN IF NOT EXISTS aceita_dobra boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS total_no_show integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_bafometro_positivo integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_toxicologico_positivo integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS trocas_plataforma_avaliacao_baixa integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS perfil_risco text,
  ADD COLUMN IF NOT EXISTS observacoes text,
  ADD COLUMN IF NOT EXISTS data_demissao date,
  ADD COLUMN IF NOT EXISTS motivo_demissao text,
  ADD COLUMN IF NOT EXISTS tipo_demissao text,
  ADD COLUMN IF NOT EXISTS apto_recontratacao boolean,
  ADD COLUMN IF NOT EXISTS salario_base numeric(12, 2);

-- ---------------------------------------------------------------------------
-- Clientes e unidades (plataformas)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE,
  cnpj text,
  razao_social text NOT NULL,
  nome_fantasia text,
  endereco text,
  cidade text,
  uf text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cliente_unidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  nome text NOT NULL,
  aeroporto_embarque text,
  cidade text,
  contato_base_nome text,
  contato_base_telefone text,
  contato_base_email text,
  contato_base_depto text,
  contato_bordo_nome text,
  contato_bordo_telefone text,
  contato_bordo_email text,
  contato_bordo_depto text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cliente_id, nome)
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cliente_unidades ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.clientes TO authenticated;
GRANT SELECT ON public.cliente_unidades TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.clientes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cliente_unidades TO authenticated;

DROP POLICY IF EXISTS clientes_select_authenticated ON public.clientes;
CREATE POLICY clientes_select_authenticated ON public.clientes
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS clientes_write_admin ON public.clientes;
CREATE POLICY clientes_write_admin ON public.clientes
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

DROP POLICY IF EXISTS cliente_unidades_select_authenticated ON public.cliente_unidades;
CREATE POLICY cliente_unidades_select_authenticated ON public.cliente_unidades
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS cliente_unidades_write_admin ON public.cliente_unidades;
CREATE POLICY cliente_unidades_write_admin ON public.cliente_unidades
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

-- ---------------------------------------------------------------------------
-- Avaliações: metadados de sessão (cliente/unidade/período)
-- ---------------------------------------------------------------------------
ALTER TABLE public.avaliacoes
  ADD COLUMN IF NOT EXISTS periodo_inicio date,
  ADD COLUMN IF NOT EXISTS periodo_fim date,
  ADD COLUMN IF NOT EXISTS quinzena text,
  ADD COLUMN IF NOT EXISTS cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS unidade_id uuid REFERENCES public.cliente_unidades(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS avaliacoes_quinzena_idx ON public.avaliacoes (quinzena);
CREATE INDEX IF NOT EXISTS avaliacoes_cliente_idx ON public.avaliacoes (cliente_id);

-- ---------------------------------------------------------------------------
-- Incidentes enriquecidos
-- ---------------------------------------------------------------------------
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'desvio_comportamental'
      AND enumtypid = 'public.tipo_incidente'::regtype
  ) THEN
    ALTER TYPE public.tipo_incidente ADD VALUE 'desvio_comportamental';
  END IF;
END
$do$;

ALTER TABLE public.incidentes
  ADD COLUMN IF NOT EXISTS horario_aproximado time,
  ADD COLUMN IF NOT EXISTS reincidencia boolean,
  ADD COLUMN IF NOT EXISTS on_offshore text,
  ADD COLUMN IF NOT EXISTS dias_embarcados integer,
  ADD COLUMN IF NOT EXISTS prev_mob date,
  ADD COLUMN IF NOT EXISTS prev_demob date,
  ADD COLUMN IF NOT EXISTS cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS unidade_id uuid REFERENCES public.cliente_unidades(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS plataforma_texto text,
  ADD COLUMN IF NOT EXISTS relatante_nome text,
  ADD COLUMN IF NOT EXISTS acao_tomada text,
  ADD COLUMN IF NOT EXISTS comentario_cliente text;

-- ---------------------------------------------------------------------------
-- Melhoria salarial: tipo, valor e checklist
-- ---------------------------------------------------------------------------
ALTER TABLE public.melhorias_salariais
  ADD COLUMN IF NOT EXISTS tipo_solicitacao text,
  ADD COLUMN IF NOT EXISTS valor_estimado numeric(12, 2),
  ADD COLUMN IF NOT EXISTS percentual_reajuste numeric(5, 2),
  ADD COLUMN IF NOT EXISTS curso_nome text,
  ADD COLUMN IF NOT EXISTS curso_instituicao text,
  ADD COLUMN IF NOT EXISTS checklist jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS parecer_gestor text,
  ADD COLUMN IF NOT EXISTS parecer_rh text;

-- ---------------------------------------------------------------------------
-- Notificação crítica IMA (tipo)
-- ---------------------------------------------------------------------------
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'ima_critico'
      AND enumtypid = 'public.tipo_notificacao'::regtype
  ) THEN
    ALTER TYPE public.tipo_notificacao ADD VALUE 'ima_critico';
  END IF;
END
$do$;

-- ---------------------------------------------------------------------------
-- Seed clientes exemplo (PRIO / FORESEA)
-- ---------------------------------------------------------------------------
INSERT INTO public.clientes (codigo, cnpj, razao_social, nome_fantasia, endereco, cidade, uf)
VALUES
  ('C001', '12.345.678/0001-90', 'PETRORIO O&G EXPLOR E PROD DE PETROLEO LTDA', 'PRIO', 'Praia de Botafogo, 300', 'Rio de Janeiro', 'RJ'),
  ('C002', '56.789.012/0001-34', 'FORESEA S.A', 'FORESEA', 'Av. Rio Branco, 1', 'Rio de Janeiro', 'RJ')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.cliente_unidades (cliente_id, nome, aeroporto_embarque, cidade)
SELECT c.id, u.nome, u.aeroporto, u.cidade
FROM public.clientes c
CROSS JOIN (VALUES
  ('PRIO', 'POLVO A', 'Aeroporto de Macaé', 'Macaé/RJ'),
  ('PRIO', 'BRAVO FORTE', 'Aeroporto de Macaé', 'Macaé/RJ'),
  ('PRIO', 'FRADE', 'Aeroporto de Jacarepaguá', 'Rio de Janeiro/RJ'),
  ('FORESEA', 'FORTE', 'Aeroporto de Macaé', 'Macaé/RJ'),
  ('FORESEA', 'HUNTER', 'Aeroporto de Macaé', 'Macaé/RJ'),
  ('FORESEA', 'NORBE 6', 'Aeroporto de Jacarepaguá', 'Rio de Janeiro/RJ')
) AS u(fantasia, nome, aeroporto, cidade)
WHERE c.nome_fantasia = u.fantasia
ON CONFLICT (cliente_id, nome) DO NOTHING;
