import { supabase } from '@/lib/supabase';
import { registrarAuditLog } from '@/features/compliance/audit-log';

export type TipoDenuncia =
  | 'assedio_moral'
  | 'assedio_sexual'
  | 'desvio_conduta'
  | 'risco_vida'
  | 'fraude'
  | 'discriminacao'
  | 'outros';

export type StatusDenuncia = 'aberto' | 'em_analise' | 'concluido' | 'arquivado';

export type DenunciaRow = {
  id: string;
  id_relato: string;
  data_abertura: string;
  cliente_plataforma: string | null;
  unidade: string | null;
  anonimo: boolean;
  tipo_denuncia: TipoDenuncia | null;
  gravidade: string | null;
  status: StatusDenuncia;
  descricao: string | null;
  prazo_sla: string | null;
};

export type RiscoNr1Row = {
  id: string;
  id_risco: string;
  area_setor: string | null;
  tipo_risco: string | null;
  descricao: string;
  probabilidade: number;
  severidade: number;
  nivel_risco: string | null;
  status: string;
  prazo: string | null;
};

export type PlanoAcaoComplianceRow = {
  id: string;
  id_acao: string;
  origem_tipo: string;
  descricao_acao: string;
  status: string;
  conclusao_pct: number;
  prazo: string | null;
};

export const TIPO_DENUNCIA_LABELS: Record<TipoDenuncia, string> = {
  assedio_moral: 'Assédio moral',
  assedio_sexual: 'Assédio sexual',
  desvio_conduta: 'Desvio de conduta',
  risco_vida: 'Risco à vida',
  fraude: 'Fraude',
  discriminacao: 'Discriminação',
  outros: 'Outros',
};

export async function fetchDenuncias(): Promise<DenunciaRow[]> {
  const { data, error } = await supabase
    .from('denuncias')
    .select('*')
    .order('data_abertura', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as DenunciaRow[];
}

export async function registrarDenuncia(params: {
  tipo: TipoDenuncia;
  descricao: string;
  anonimo?: boolean;
  unidade?: string;
  clientePlataforma?: string;
}): Promise<void> {
  const idRelato = `COMP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  const prazo = new Date();
  prazo.setHours(prazo.getHours() + 72);

  const { data, error } = await supabase
    .from('denuncias')
    .insert({
      id_relato: idRelato,
      tipo_denuncia: params.tipo,
      descricao: params.descricao.trim(),
      anonimo: params.anonimo ?? false,
      unidade: params.unidade ?? null,
      cliente_plataforma: params.clientePlataforma ?? null,
      status: 'aberto',
      prazo_sla: prazo.toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await registrarAuditLog({
    acao: 'CRIACAO',
    tabela: 'denuncias',
    registroId: data.id,
    observacao: params.anonimo ? 'Denúncia anônima registrada' : 'Denúncia registrada',
  });
}

export async function fetchRiscosNr1(): Promise<RiscoNr1Row[]> {
  const { data, error } = await supabase.from('riscos_nr1').select('*').order('id_risco');

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as RiscoNr1Row[];
}

export async function registrarRiscoNr1(params: {
  areaSetor: string;
  tipoRisco: string;
  descricao: string;
  probabilidade: number;
  severidade: number;
}): Promise<void> {
  const score = params.probabilidade * params.severidade;
  let nivel = '🟢 BAIXO';
  if (score >= 16) nivel = '🔴 CRÍTICO';
  else if (score >= 9) nivel = '🟠 ALTO';
  else if (score >= 4) nivel = '🟡 MÉDIO';

  const idRisco = `NR1-${String(Date.now()).slice(-6)}`;

  const { error } = await supabase.from('riscos_nr1').insert({
    id_risco: idRisco,
    area_setor: params.areaSetor,
    tipo_risco: params.tipoRisco,
    descricao: params.descricao,
    probabilidade: params.probabilidade,
    severidade: params.severidade,
    nivel_risco: nivel,
    status: 'identificado',
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchPlanosAcaoCompliance(): Promise<PlanoAcaoComplianceRow[]> {
  const { data, error } = await supabase
    .from('planos_acao_compliance')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as PlanoAcaoComplianceRow[];
}

export async function fetchDashboardCompliance() {
  const [denuncias, riscos, planos] = await Promise.all([
    fetchDenuncias(),
    fetchRiscosNr1(),
    fetchPlanosAcaoCompliance(),
  ]);

  const abertas = denuncias.filter((d) => d.status === 'aberto').length;
  const emAnalise = denuncias.filter((d) => d.status === 'em_analise').length;
  const concluidas = denuncias.filter((d) => d.status === 'concluido').length;

  const porTipo = Object.keys(TIPO_DENUNCIA_LABELS).map((tipo) => ({
    tipo: TIPO_DENUNCIA_LABELS[tipo as TipoDenuncia],
    total: denuncias.filter((d) => d.tipo_denuncia === tipo).length,
  }));

  return {
    totalDenuncias: denuncias.length,
    abertas,
    emAnalise,
    concluidas,
    totalRiscos: riscos.length,
    planosPendentes: planos.filter((p) => p.status !== 'concluido').length,
    porTipo,
    denuncias: denuncias.slice(0, 20),
    riscos: riscos.slice(0, 15),
    planos: planos.slice(0, 15),
  };
}
