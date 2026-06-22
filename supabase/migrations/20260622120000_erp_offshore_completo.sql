-- ERP Performance Offshore: 12 seções, executivo, compliance, cadastro estendido

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS codigo_interno text,
  ADD COLUMN IF NOT EXISTS plataforma text,
  ADD COLUMN IF NOT EXISTS formacao_academica text,
  ADD COLUMN IF NOT EXISTS certificacoes text;

-- Potencial para Nine Box
DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'potencial_nivel') THEN
    CREATE TYPE public.potencial_nivel AS ENUM ('baixo', 'medio', 'alto');
  END IF;
END
$do$;

CREATE TABLE IF NOT EXISTS public.colaborador_potencial (
  colaborador_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  potencial public.potencial_nivel NOT NULL DEFAULT 'medio',
  avaliado_por_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  observacao text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Plano de sucessão
CREATE TABLE IF NOT EXISTS public.plano_sucessao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  posicao_chave text NOT NULL,
  titular_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  sucessor_1_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  prontidao_s1 text,
  sucessor_2_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  prontidao_s2 text,
  gap_identificado text,
  acao_desenvolvimento text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Compliance: denúncias
DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_denuncia') THEN
    CREATE TYPE public.status_denuncia AS ENUM ('aberto', 'em_analise', 'concluido', 'arquivado');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_denuncia') THEN
    CREATE TYPE public.tipo_denuncia AS ENUM (
      'assedio_moral', 'assedio_sexual', 'desvio_conduta', 'risco_vida', 'fraude', 'discriminacao', 'outros'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gravidade_denuncia') THEN
    CREATE TYPE public.gravidade_denuncia AS ENUM ('baixa', 'media', 'alta', 'critica');
  END IF;
END
$do$;

CREATE TABLE IF NOT EXISTS public.denuncias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_relato text NOT NULL UNIQUE,
  data_abertura timestamptz NOT NULL DEFAULT now(),
  cliente_plataforma text,
  unidade text,
  anonimo boolean NOT NULL DEFAULT false,
  nome_relatante text,
  funcao_relatante text,
  nome_denunciado text,
  funcao_denunciado text,
  tipo_denuncia public.tipo_denuncia,
  risco_ocupacional boolean NOT NULL DEFAULT false,
  gravidade public.gravidade_denuncia,
  reincidencia boolean NOT NULL DEFAULT false,
  status public.status_denuncia NOT NULL DEFAULT 'aberto',
  prazo_sla timestamptz,
  data_fechamento timestamptz,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- NR1 riscos
DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_risco_nr1') THEN
    CREATE TYPE public.status_risco_nr1 AS ENUM ('identificado', 'em_tratamento', 'controlado', 'encerrado');
  END IF;
END
$do$;

CREATE TABLE IF NOT EXISTS public.riscos_nr1 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_risco text NOT NULL UNIQUE,
  data_identificacao date NOT NULL DEFAULT CURRENT_DATE,
  area_setor text,
  tipo_risco text,
  descricao text NOT NULL,
  probabilidade smallint NOT NULL CHECK (probabilidade BETWEEN 1 AND 5),
  severidade smallint NOT NULL CHECK (severidade BETWEEN 1 AND 5),
  nivel_risco text,
  medida_controle text,
  responsavel_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  prazo date,
  status public.status_risco_nr1 NOT NULL DEFAULT 'identificado',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Planos de ação compliance
DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_plano_acao') THEN
    CREATE TYPE public.status_plano_acao AS ENUM ('nao_iniciado', 'em_andamento', 'concluido', 'cancelado');
  END IF;
END
$do$;

CREATE TABLE IF NOT EXISTS public.planos_acao_compliance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_acao text NOT NULL UNIQUE,
  origem_tipo text NOT NULL,
  origem_id uuid,
  descricao_acao text NOT NULL,
  responsavel_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  data_inicio date,
  prazo date,
  status public.status_plano_acao NOT NULL DEFAULT 'nao_iniciado',
  conclusao_pct smallint NOT NULL DEFAULT 0 CHECK (conclusao_pct BETWEEN 0 AND 100),
  evidencia text,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Audit log
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  acao text NOT NULL,
  tabela text NOT NULL,
  registro_id text,
  campo_alterado text,
  valor_anterior text,
  valor_novo text,
  ip_address text,
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS básico (gestão + compliance)
ALTER TABLE public.colaborador_potencial ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plano_sucessao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.denuncias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riscos_nr1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos_acao_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.colaborador_potencial TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plano_sucessao TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.denuncias TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.riscos_nr1 TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.planos_acao_compliance TO authenticated;
GRANT SELECT, INSERT ON public.audit_log TO authenticated;

CREATE POLICY colaborador_potencial_auth ON public.colaborador_potencial FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY plano_sucessao_auth ON public.plano_sucessao FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY denuncias_auth ON public.denuncias FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY riscos_nr1_auth ON public.riscos_nr1 FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY planos_acao_compliance_auth ON public.planos_acao_compliance FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY audit_log_select ON public.audit_log FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY audit_log_insert ON public.audit_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Seed 12 seções offshore (36 perguntas) — modelo híbrido Excel
INSERT INTO public.perguntas (codigo, descricao, secao_departamento, peso) VALUES
  ('GO1', 'Possui histórico livre de notas baixas na avaliação do cliente nos últimos 6 meses?', 'GO', 3),
  ('GO2', 'Respeita o fluxo de comunicação e as decisões da cadeia de comando sem conflitos?', 'GO', 3),
  ('GO3', 'Recebeu elogios formais ou premiações de destaque positivo no período?', 'GO', 3),
  ('SB1', 'Cumpre as metas diárias mantendo o padrão de qualidade exigido pelo supervisor?', 'SB', 3),
  ('SB2', 'Cumpre rigorosamente os horários de início, término e intervalos de bordo?', 'SB', 3),
  ('SB3', 'Mantém a frente de trabalho limpa e organizada durante e após o serviço?', 'SB', 3),
  ('LG1', 'Cumpre rigorosamente a agenda e os horários estipulados para o embarque?', 'LG', 1),
  ('LG2', 'Possui conformidade total e zero recusas nos testes de bafômetro e toxicológico?', 'LG', 1),
  ('LG3', 'Responde e confirma os chamados da logística dentro do prazo estipulado?', 'LG', 1),
  ('PE1', 'Demonstra disponibilidade para atender convocações de escalas extras ou dobras?', 'PE', 1),
  ('PE2', 'Mantém comportamento harmônico e equilibrado durante o confinamento?', 'PE', 1),
  ('PE3', 'Demonstra evolução prática imediata após receber feedbacks da gestão?', 'PE', 1),
  ('PR1', 'Entrega 100% das fichas de avaliação assinadas pelo cliente ao final do embarque?', 'PR', 1),
  ('PR2', 'Fornece dados precisos de avanço físico sem atrasar o cronograma?', 'PR', 1),
  ('PR3', 'Entrega RDOs, medições e fotos sem erros dentro do prazo de faturamento?', 'PR', 1),
  ('MA1', 'Utiliza ferramentas e equipamentos de forma correta, sem avarias por mau uso?', 'MA', 1),
  ('MA2', 'Consome materiais e EPIs de forma consciente, evitando desperdícios?', 'MA', 1),
  ('MA3', 'Realiza a devolução e troca de ferramentas seguindo os procedimentos?', 'MA', 1),
  ('TR1', 'Mantém a documentação de treinamentos obrigatórios e NRs sempre atualizada?', 'TR', 1),
  ('TR2', 'Frequenta as convocações de treinamentos internos com participação ativa?', 'TR', 1),
  ('TR3', 'Aplica em campo os conhecimentos técnicos adquiridos nos treinamentos?', 'TR', 1),
  ('SM1', 'Participa ativamente do DDS, reuniões e usa os EPIs/EPCs corretamente?', 'SM', 1),
  ('SM2', 'Identifica e comunica formalmente situações de risco ou quase-acidentes?', 'SM', 1),
  ('SM3', 'Permaneceu livre de envolvimento direto em incidentes nos últimos 6 meses?', 'SM', 1),
  ('RH1', 'Mantém conduta ilibada, sem denúncias na Ouvidoria ou Compliance no período?', 'RH', 1),
  ('RH2', 'Trata colegas e líderes com urbanidade, sem atritos ou condutas tóxicas?', 'RH', 1),
  ('RH3', 'Canaliza dúvidas e pleitos pessoais de forma educada e pelos canais oficiais?', 'RH', 1),
  ('FA1', 'Mantém o alojamento e áreas comuns limpos e organizados?', 'FA', 1),
  ('FA2', 'Respeita as regras de convivência nas bases e embarcações?', 'FA', 1),
  ('FA3', 'Reporta problemas de infraestrutura pelos canais oficiais?', 'FA', 1),
  ('PG1', 'Cumpre as metas de produção acordadas para o período?', 'PG', 1),
  ('PG2', 'Mantém produtividade consistente sem comprometer a qualidade?', 'PG', 1),
  ('PG3', 'Colabora com a equipe para atingir os objetivos do contrato?', 'PG', 1),
  ('IN1', 'Executa inspeções e verificações conforme procedimentos técnicos?', 'IN', 1),
  ('IN2', 'Documenta não conformidades e acompanha tratativas até o fechamento?', 'IN', 1),
  ('IN3', 'Mantém certificações e qualificações técnicas exigidas para a função?', 'IN', 1)
ON CONFLICT (codigo) DO UPDATE SET
  descricao = EXCLUDED.descricao,
  secao_departamento = EXCLUDED.secao_departamento,
  peso = EXCLUDED.peso;

-- Exemplo de plano de sucessão (posições-chave)
INSERT INTO public.plano_sucessao (posicao_chave, prontidao_s1, prontidao_s2, gap_identificado, acao_desenvolvimento)
SELECT * FROM (VALUES
  ('Gerente de Operações'::text, '12 meses'::text, '24 meses'::text, 'Liderança estratégica'::text, 'Mentoria com diretoria'::text),
  ('Supervisor de Bordo', '6 meses', '18 meses', 'Gestão de conflitos', 'PDI comportamental')
) AS seed(posicao_chave, prontidao_s1, prontidao_s2, gap_identificado, acao_desenvolvimento)
WHERE NOT EXISTS (SELECT 1 FROM public.plano_sucessao LIMIT 1);
