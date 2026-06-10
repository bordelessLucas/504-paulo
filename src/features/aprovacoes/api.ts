import { MENSAGEM_BLOQUEIO_DEVERES } from '@/features/colaborador/eligibility';
import { hasIncidentesRecentes } from '@/features/incidentes/api';
import {
  isElegivelParaReajuste,
  MENSAGEM_INELEGIVEL_REAJUSTE,
} from '@/features/reajuste/eligibility';
import {
  TIPO_SOLICITACAO_REAJUSTE_LABELS,
  type TipoSolicitacaoReajuste,
} from '@/features/reajuste/types';
import { supabase } from '@/lib/supabase';
import type { Profile, StatusSolicitacaoSalarialEnum } from '@/types/supabase';

export type ColaboradorAtivo = Pick<Profile, 'id' | 'nome' | 'departamento' | 'funcao'>;

export type SolicitacaoMelhoria = {
  id: string;
  colaboradorId: string;
  colaboradorNome: string;
  colaboradorDepartamento: string | null;
  gerenteId: string | null;
  gerenteNome: string | null;
  justificativa: string;
  status: StatusSolicitacaoSalarialEnum;
  createdAt: string;
  updatedAt: string;
};

type MelhoriaRow = {
  id: string;
  colaborador_id: string;
  gerente_id: string | null;
  justificativa: string;
  status: StatusSolicitacaoSalarialEnum;
  created_at: string;
  updated_at: string;
};

type ProfileResumo = Pick<Profile, 'id' | 'nome' | 'departamento'>;

async function fetchProfilesByIds(ids: string[]): Promise<Map<string, ProfileResumo>> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome, departamento')
    .in('id', uniqueIds);

  if (error) {
    throw new Error(error.message);
  }

  return new Map((data ?? []).map((profile) => [profile.id, profile]));
}

function calcularMedia(notas: number[]): number | null {
  if (notas.length === 0) {
    return null;
  }

  return notas.reduce((total, nota) => total + nota, 0) / notas.length;
}

function mapSolicitacao(
  row: MelhoriaRow,
  profilesById: Map<string, ProfileResumo>,
): SolicitacaoMelhoria {
  const colaborador = profilesById.get(row.colaborador_id);
  const gerente = row.gerente_id ? profilesById.get(row.gerente_id) : null;

  return {
    id: row.id,
    colaboradorId: row.colaborador_id,
    colaboradorNome: colaborador?.nome ?? 'Colaborador',
    colaboradorDepartamento: colaborador?.departamento ?? null,
    gerenteId: row.gerente_id,
    gerenteNome: gerente?.nome ?? null,
    justificativa: row.justificativa,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchColaboradoresAtivos(): Promise<ColaboradorAtivo[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome, departamento, funcao')
    .eq('role', 'colaborador')
    .eq('status', 'ativo')
    .order('nome', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchMediaGeralColaborador(colaboradorId: string): Promise<{
  media: number | null;
  totalRespostas: number;
  temIncidentesRecentes: boolean;
}> {
  const { data: avaliacoes, error: avaliacoesError } = await supabase
    .from('avaliacoes')
    .select('id')
    .eq('avaliado_id', colaboradorId);

  if (avaliacoesError) {
    throw new Error(avaliacoesError.message);
  }

  const avaliacaoIds = (avaliacoes ?? []).map((avaliacao) => avaliacao.id);

  const temIncidentesRecentes = await hasIncidentesRecentes(colaboradorId);

  if (avaliacaoIds.length === 0) {
    return { media: null, totalRespostas: 0, temIncidentesRecentes };
  }

  const { data: respostas, error: respostasError } = await supabase
    .from('respostas')
    .select('nota')
    .in('avaliacao_id', avaliacaoIds);

  if (respostasError) {
    throw new Error(respostasError.message);
  }

  const notas = (respostas ?? [])
    .map((resposta) => resposta.nota)
    .filter((nota): nota is number => typeof nota === 'number');

  return {
    media: calcularMedia(notas),
    totalRespostas: notas.length,
    temIncidentesRecentes,
  };
}

function buildJustificativaSolicitacao(
  tipoSolicitacao: TipoSolicitacaoReajuste,
  justificativa: string,
  mediaGeral: number | null,
  totalRespostas: number,
): string {
  return [
    `[${TIPO_SOLICITACAO_REAJUSTE_LABELS[tipoSolicitacao]}]`,
    `Média geral: ${mediaGeral !== null ? mediaGeral.toFixed(1) : '—'} (${totalRespostas} respostas)`,
    '',
    justificativa.trim(),
  ].join('\n');
}

export async function createSolicitacaoMelhoria(params: {
  colaboradorId: string;
  solicitanteId: string;
  tipoSolicitacao: TipoSolicitacaoReajuste;
  justificativa: string;
  mediaGeral: number | null;
  totalRespostas: number;
}): Promise<void> {
  const justificativa = params.justificativa.trim();

  if (justificativa.length < 10) {
    throw new Error('A justificativa deve ter pelo menos 10 caracteres.');
  }

  const temIncidentesRecentes = await hasIncidentesRecentes(params.colaboradorId);

  if (temIncidentesRecentes) {
    throw new Error(MENSAGEM_BLOQUEIO_DEVERES);
  }

  if (!isElegivelParaReajuste(params.mediaGeral, params.totalRespostas, temIncidentesRecentes)) {
    throw new Error(MENSAGEM_INELEGIVEL_REAJUSTE);
  }

  const { error } = await supabase.from('melhorias_salariais').insert({
    colaborador_id: params.colaboradorId,
    gerente_id: params.solicitanteId,
    justificativa: buildJustificativaSolicitacao(
      params.tipoSolicitacao,
      justificativa,
      params.mediaGeral,
      params.totalRespostas,
    ),
    status: 'pendente_rh',
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchSolicitacoesPorStatus(
  status: StatusSolicitacaoSalarialEnum,
): Promise<SolicitacaoMelhoria[]> {
  const { data, error } = await supabase
    .from('melhorias_salariais')
    .select('id, colaborador_id, gerente_id, justificativa, status, created_at, updated_at')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as MelhoriaRow[];

  if (rows.length === 0) {
    return [];
  }

  const profileIds = rows.flatMap((row) =>
    row.gerente_id ? [row.colaborador_id, row.gerente_id] : [row.colaborador_id],
  );

  const profilesById = await fetchProfilesByIds(profileIds);

  return rows.map((row) => mapSolicitacao(row, profilesById));
}

export async function atualizarStatusSolicitacao(
  solicitacaoId: string,
  status: StatusSolicitacaoSalarialEnum,
): Promise<void> {
  const { error } = await supabase
    .from('melhorias_salariais')
    .update({ status })
    .eq('id', solicitacaoId);

  if (error) {
    throw new Error(error.message);
  }
}

export function formatMediaGeral(media: number | null): string {
  return media !== null ? media.toFixed(1) : '—';
}

export function formatDataSolicitacao(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
