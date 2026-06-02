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
  colaborador: { nome: string; departamento: string | null } | null;
  gerente: { nome: string } | null;
};

const MELHORIA_SELECT = `
  id,
  colaborador_id,
  gerente_id,
  justificativa,
  status,
  created_at,
  updated_at,
  colaborador:profiles!melhorias_colaborador_id_fkey(nome, departamento),
  gerente:profiles!melhorias_gerente_id_fkey(nome)
`;

function calcularMedia(notas: number[]): number | null {
  if (notas.length === 0) {
    return null;
  }

  return notas.reduce((total, nota) => total + nota, 0) / notas.length;
}

function mapSolicitacao(row: MelhoriaRow): SolicitacaoMelhoria {
  return {
    id: row.id,
    colaboradorId: row.colaborador_id,
    colaboradorNome: row.colaborador?.nome ?? 'Colaborador',
    colaboradorDepartamento: row.colaborador?.departamento ?? null,
    gerenteId: row.gerente_id,
    gerenteNome: row.gerente?.nome ?? null,
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
}> {
  const { data: avaliacoes, error: avaliacoesError } = await supabase
    .from('avaliacoes')
    .select('id')
    .eq('avaliado_id', colaboradorId);

  if (avaliacoesError) {
    throw new Error(avaliacoesError.message);
  }

  const avaliacaoIds = (avaliacoes ?? []).map((avaliacao) => avaliacao.id);

  if (avaliacaoIds.length === 0) {
    return { media: null, totalRespostas: 0 };
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
  };
}

export async function createSolicitacaoMelhoria(params: {
  colaboradorId: string;
  gerenteId: string;
  justificativa: string;
}): Promise<void> {
  const justificativa = params.justificativa.trim();

  if (justificativa.length < 10) {
    throw new Error('A justificativa deve ter pelo menos 10 caracteres.');
  }

  const { error } = await supabase.from('melhorias_salariais').insert({
    colaborador_id: params.colaboradorId,
    gerente_id: params.gerenteId,
    justificativa,
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
    .select(MELHORIA_SELECT)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as MelhoriaRow[]).map(mapSolicitacao);
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
