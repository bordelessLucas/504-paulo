import { supabase } from '@/lib/supabase';
import type { StatusSolicitacaoSalarial, TipoAvaliacao } from '@/types/supabase';

export type HistoricoAvaliacaoRow = {
  id: string;
  tipo: TipoAvaliacao;
  createdAt: string;
  quinzena: string | null;
  colaboradorId: string;
  colaboradorNome: string;
  colaboradorFuncao: string | null;
  nivelIrata: string | null;
  avaliadorNome: string | null;
  clienteNome: string | null;
  unidadeNome: string | null;
  notas: number[];
  media: number | null;
  status: string;
};

export type DesligadoRow = {
  id: string;
  nome: string;
  funcao: string | null;
  especialidade: string | null;
  nivelIrata: string | null;
  tipoContrato: string | null;
  dataAdmissao: string | null;
  dataDemissao: string | null;
  motivoDemissao: string | null;
  tipoDemissao: string | null;
  aptoRecontratacao: boolean | null;
  perfilRisco: string | null;
};

export type SolicitacaoStatusRow = {
  id: string;
  colaboradorNome: string;
  colaboradorFuncao: string | null;
  dataSolicitacao: string;
  tipoSolicitacao: string | null;
  justificativa: string;
  status: StatusSolicitacaoSalarial;
  valorEstimado: number | null;
  percentualReajuste: number | null;
};

export type HistoricoFilters = {
  ano?: number;
  cliente?: string;
  unidade?: string;
  supervisor?: string;
};

function mediaNotas(notas: number[]): number | null {
  if (notas.length === 0) return null;
  return notas.reduce((a, b) => a + b, 0) / notas.length;
}

export async function fetchHistoricoAvaliacoes(
  tipo: TipoAvaliacao,
  filters: HistoricoFilters = {},
): Promise<HistoricoAvaliacaoRow[]> {
  let query = supabase
    .from('avaliacoes')
    .select(
      `
      id,
      tipo,
      status,
      created_at,
      quinzena,
      avaliado:profiles!avaliacoes_avaliado_id_fkey(id, nome, funcao, nivel_irata),
      avaliador:profiles!avaliacoes_avaliador_id_fkey(nome),
      respostas(nota)
    `,
    )
    .eq('tipo', tipo)
    .order('created_at', { ascending: false })
    .limit(200);

  if (filters.ano) {
    const start = `${filters.ano}-01-01`;
    const end = `${filters.ano}-12-31`;
    query = query.gte('created_at', start).lte('created_at', end);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []).map((row) => {
    const avaliado = row.avaliado as {
      id: string;
      nome: string;
      funcao: string | null;
      nivel_irata: string | null;
    } | null;
    const avaliador = row.avaliador as { nome: string } | null;
    const respostas = (row.respostas as Array<{ nota: number | null }> | null) ?? [];
    const notas = respostas
      .map((r) => r.nota)
      .filter((n): n is number => typeof n === 'number');

    return {
      id: row.id as string,
      tipo: row.tipo as TipoAvaliacao,
      createdAt: row.created_at as string,
      quinzena: (row.quinzena as string | null) ?? null,
      colaboradorId: avaliado?.id ?? '',
      colaboradorNome: avaliado?.nome ?? '—',
      colaboradorFuncao: avaliado?.funcao ?? null,
      nivelIrata: avaliado?.nivel_irata ?? null,
      avaliadorNome: avaliador?.nome ?? null,
      clienteNome: null,
      unidadeNome: null,
      notas,
      media: mediaNotas(notas),
      status: row.status as string,
    };
  });

  return rows.filter((row) => {
    if (filters.cliente && !(row.clienteNome ?? '').toLowerCase().includes(filters.cliente.toLowerCase())) {
      return false;
    }
    if (filters.unidade && !(row.unidadeNome ?? '').toLowerCase().includes(filters.unidade.toLowerCase())) {
      return false;
    }
    if (
      filters.supervisor &&
      !(row.avaliadorNome ?? '').toLowerCase().includes(filters.supervisor.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
}

export async function fetchColaboradoresDesligados(ano?: number): Promise<DesligadoRow[]> {
  let query = supabase
    .from('profiles')
    .select(
      'id, nome, funcao, especialidade, nivel_irata, tipo_contrato, data_admissao, data_demissao, motivo_demissao, tipo_demissao, apto_recontratacao, perfil_risco, status',
    )
    .eq('role', 'colaborador')
    .or('status.eq.inativo,status.eq.desligado,data_demissao.not.is.null')
    .order('data_demissao', { ascending: false, nullsFirst: false })
    .limit(200);

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .filter((row) => {
      if (!ano || !row.data_demissao) return !ano;
      return String(row.data_demissao).startsWith(String(ano));
    })
    .map((row) => ({
      id: row.id,
      nome: row.nome,
      funcao: row.funcao,
      especialidade: row.especialidade ?? null,
      nivelIrata: row.nivel_irata,
      tipoContrato: row.tipo_contrato ?? null,
      dataAdmissao: row.data_admissao,
      dataDemissao: row.data_demissao ?? null,
      motivoDemissao: row.motivo_demissao ?? null,
      tipoDemissao: row.tipo_demissao ?? null,
      aptoRecontratacao: row.apto_recontratacao ?? null,
      perfilRisco: row.perfil_risco ?? null,
    }));
}

export async function fetchColaboradoresAtivosLista(): Promise<
  Array<{
    id: string;
    nome: string;
    funcao: string | null;
    departamento: string | null;
    nivelIrata: string | null;
    dataAdmissao: string | null;
    perfilRisco: string | null;
  }>
> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome, funcao, departamento, nivel_irata, data_admissao, perfil_risco, status')
    .eq('role', 'colaborador')
    .or('status.eq.ativo,status.is.null')
    .is('data_demissao', null)
    .order('nome')
    .limit(300);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    nome: row.nome,
    funcao: row.funcao,
    departamento: row.departamento,
    nivelIrata: row.nivel_irata,
    dataAdmissao: row.data_admissao,
    perfilRisco: row.perfil_risco ?? null,
  }));
}

export async function fetchStatusSolicitacoes(filters?: {
  status?: StatusSolicitacaoSalarial | 'todos';
  nome?: string;
}): Promise<SolicitacaoStatusRow[]> {
  let query = supabase
    .from('melhorias_salariais')
    .select(
      'id, colaborador_id, justificativa, status, created_at, tipo_solicitacao, valor_estimado, percentual_reajuste',
    )
    .order('created_at', { ascending: false })
    .limit(200);

  if (filters?.status && filters.status !== 'todos') {
    query = query.eq('status', filters.status);
  }

  let { data, error } = await query;

  // Fallback se a migration DNA ainda não tiver sido aplicada (colunas extras).
  if (
    error?.message?.includes('tipo_solicitacao') ||
    error?.message?.includes('valor_estimado') ||
    error?.message?.includes('percentual_reajuste')
  ) {
    let fallback = supabase
      .from('melhorias_salariais')
      .select('id, colaborador_id, justificativa, status, created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    if (filters?.status && filters.status !== 'todos') {
      fallback = fallback.eq('status', filters.status);
    }

    const retry = await fallback;
    data = (retry.data ?? []).map((row) => ({
      ...row,
      tipo_solicitacao: null,
      valor_estimado: null,
      percentual_reajuste: null,
    }));
    error = retry.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  const colaboradorIds = [...new Set(rows.map((row) => row.colaborador_id).filter(Boolean))];

  const profileById = new Map<string, { nome: string; funcao: string | null }>();

  if (colaboradorIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, nome, funcao')
      .in('id', colaboradorIds);

    if (profilesError) {
      throw new Error(profilesError.message);
    }

    for (const profile of profiles ?? []) {
      profileById.set(profile.id, { nome: profile.nome, funcao: profile.funcao });
    }
  }

  return rows
    .map((row) => {
      const colaborador = profileById.get(row.colaborador_id);
      return {
        id: row.id,
        colaboradorNome: colaborador?.nome ?? '—',
        colaboradorFuncao: colaborador?.funcao ?? null,
        dataSolicitacao: row.created_at,
        tipoSolicitacao: row.tipo_solicitacao ?? null,
        justificativa: row.justificativa,
        status: row.status,
        valorEstimado: row.valor_estimado ?? null,
        percentualReajuste: row.percentual_reajuste ?? null,
      };
    })
    .filter((row) => {
      if (filters?.nome && !row.colaboradorNome.toLowerCase().includes(filters.nome.toLowerCase())) {
        return false;
      }
      return true;
    });
}
