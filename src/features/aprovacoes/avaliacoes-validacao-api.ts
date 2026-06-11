import { AVALIACAO_DATA_COLUMN } from '@/features/avaliacao/avaliacao-date';
import { supabase } from '@/lib/supabase';
import type { StatusValidacaoEnum, TipoAvaliacaoEnum } from '@/types/supabase';

export type AvaliacaoPendenteValidacao = {
  id: string;
  tipo: TipoAvaliacaoEnum;
  status: StatusValidacaoEnum;
  avaliadoId: string;
  avaliadoNome: string;
  avaliadoDepartamento: string | null;
  avaliadorId: string | null;
  avaliadorNome: string | null;
  media: number | null;
  createdAt: string;
};

type AvaliacaoRow = {
  id: string;
  tipo: TipoAvaliacaoEnum;
  status: StatusValidacaoEnum;
  avaliado_id: string;
  avaliador_id: string | null;
  created_at: string;
};

type ProfileResumo = {
  id: string;
  nome: string;
  departamento: string | null;
};

async function fetchProfilesMap(ids: string[]): Promise<Map<string, ProfileResumo>> {
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

  return new Map((data ?? []).map((profile) => [profile.id, profile as ProfileResumo]));
}

async function calcularMediaAvaliacao(avaliacaoId: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('respostas')
    .select('nota')
    .eq('avaliacao_id', avaliacaoId);

  if (error) {
    throw new Error(error.message);
  }

  const notas = (data ?? [])
    .map((resposta) => resposta.nota)
    .filter((nota): nota is number => typeof nota === 'number');

  if (notas.length === 0) {
    return null;
  }

  return notas.reduce((total, nota) => total + nota, 0) / notas.length;
}

export async function fetchAvaliacoesPorStatusValidacao(
  status: StatusValidacaoEnum,
): Promise<AvaliacaoPendenteValidacao[]> {
  const { data, error } = await supabase
    .from('avaliacoes')
    .select(`id, tipo, status, avaliado_id, avaliador_id, ${AVALIACAO_DATA_COLUMN}`)
    .eq('status', status)
    .order(AVALIACAO_DATA_COLUMN, { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as AvaliacaoRow[];

  if (rows.length === 0) {
    return [];
  }

  const profileIds = rows.flatMap((row) =>
    row.avaliador_id ? [row.avaliado_id, row.avaliador_id] : [row.avaliado_id],
  );
  const profilesById = await fetchProfilesMap(profileIds);

  const medias = await Promise.all(rows.map((row) => calcularMediaAvaliacao(row.id)));

  return rows.map((row, index) => {
    const avaliado = profilesById.get(row.avaliado_id);
    const avaliador = row.avaliador_id ? profilesById.get(row.avaliador_id) : null;

    return {
      id: row.id,
      tipo: row.tipo,
      status: row.status,
      avaliadoId: row.avaliado_id,
      avaliadoNome: avaliado?.nome ?? 'Colaborador',
      avaliadoDepartamento: avaliado?.departamento ?? null,
      avaliadorId: row.avaliador_id,
      avaliadorNome: avaliador?.nome ?? null,
      media: medias[index],
      createdAt: row.created_at,
    };
  });
}

export async function atualizarStatusAvaliacao(
  avaliacaoId: string,
  status: StatusValidacaoEnum,
): Promise<void> {
  const { error } = await supabase.from('avaliacoes').update({ status }).eq('id', avaliacaoId);

  if (error) {
    throw new Error(error.message);
  }
}

export function formatTipoAvaliacaoLabel(tipo: TipoAvaliacaoEnum): string {
  switch (tipo) {
    case 'quinzenal':
      return 'Quinzenal';
    case 'semestral':
      return 'Semestral';
    case 'anual':
      return 'Anual';
    default:
      return tipo;
  }
}
