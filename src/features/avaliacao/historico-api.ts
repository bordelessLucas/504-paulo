import { AVALIACAO_DATA_COLUMN } from '@/features/avaliacao/avaliacao-date';
import { supabase } from '@/lib/supabase';
import type { TipoAvaliacao } from '@/types/supabase';

export type RespostaHistorico = {
  perguntaCodigo: string | null;
  perguntaDescricao: string;
  nota: number | null;
  justificativa: string | null;
};

export type AvaliacaoHistoricoItem = {
  id: string;
  tipo: TipoAvaliacao;
  dataReferencia: string;
  media: number | null;
  respostas: RespostaHistorico[];
  avaliadorNome?: string;
};

function calcularMediaRespostas(respostas: RespostaHistorico[]): number | null {
  const notas = respostas
    .map((resposta) => resposta.nota)
    .filter((nota): nota is number => typeof nota === 'number');

  if (notas.length === 0) {
    return null;
  }

  return notas.reduce((total, nota) => total + nota, 0) / notas.length;
}

type PerguntaRow = { id: string; codigo: string | null; descricao: string };

async function fetchPerguntasMap(perguntaIds: string[]): Promise<Map<string, PerguntaRow>> {
  const map = new Map<string, PerguntaRow>();

  if (perguntaIds.length === 0) {
    return map;
  }

  const { data, error } = await supabase
    .from('perguntas')
    .select('id, codigo, descricao')
    .in('id', perguntaIds);

  if (error) {
    throw new Error(error.message);
  }

  for (const pergunta of data ?? []) {
    map.set(pergunta.id, pergunta);
  }

  return map;
}

type RespostaRow = {
  id: string;
  avaliacao_id: string;
  pergunta_id: string | null;
  nota: number | null;
  justificativa: string | null;
};

function mapRespostas(
  respostas: RespostaRow[],
  avaliacaoId: string,
  perguntasMap: Map<string, PerguntaRow>,
): RespostaHistorico[] {
  return respostas
    .filter((resposta) => resposta.avaliacao_id === avaliacaoId)
    .map((resposta) => {
      const pergunta = resposta.pergunta_id ? perguntasMap.get(resposta.pergunta_id) : undefined;

      return {
        perguntaCodigo: pergunta?.codigo ?? null,
        perguntaDescricao: pergunta?.descricao ?? 'Critério de avaliação',
        nota: resposta.nota,
        justificativa: resposta.justificativa,
      };
    })
    .sort((left, right) => (left.perguntaCodigo ?? '').localeCompare(right.perguntaCodigo ?? ''));
}

export async function fetchHistoricoAvaliacoesMasked(
  colaboradorId: string,
): Promise<AvaliacaoHistoricoItem[]> {
  const { data: avaliacoes, error: avaliacoesError } = await supabase
    .from('avaliacoes_masked')
    .select(`id, tipo, ${AVALIACAO_DATA_COLUMN}`)
    .eq('avaliado_id', colaboradorId)
    .order(AVALIACAO_DATA_COLUMN, { ascending: false });

  if (avaliacoesError) {
    throw new Error(avaliacoesError.message);
  }

  const listaAvaliacoes = avaliacoes ?? [];

  if (listaAvaliacoes.length === 0) {
    return [];
  }

  const avaliacaoIds = listaAvaliacoes.map((avaliacao) => avaliacao.id);

  const { data: respostas, error: respostasError } = await supabase
    .from('respostas_masked')
    .select('id, avaliacao_id, pergunta_id, nota, justificativa')
    .in('avaliacao_id', avaliacaoIds);

  if (respostasError) {
    throw new Error(respostasError.message);
  }

  const perguntaIds = [
    ...new Set(
      (respostas ?? [])
        .map((resposta) => resposta.pergunta_id)
        .filter((id): id is string => typeof id === 'string'),
    ),
  ];

  const perguntasMap = await fetchPerguntasMap(perguntaIds);
  const respostasLista = (respostas ?? []) as RespostaRow[];

  return listaAvaliacoes.map((avaliacao) => {
    const respostasAvaliacao = mapRespostas(respostasLista, avaliacao.id, perguntasMap);
    const dataReferencia =
      (avaliacao as { created_at?: string })[AVALIACAO_DATA_COLUMN] ??
      (avaliacao as { created_at: string }).created_at;

    return {
      id: avaliacao.id,
      tipo: avaliacao.tipo,
      dataReferencia,
      media: calcularMediaRespostas(respostasAvaliacao),
      respostas: respostasAvaliacao,
    };
  });
}

export async function fetchHistoricoAvaliacoesCompleto(
  colaboradorId: string,
): Promise<AvaliacaoHistoricoItem[]> {
  const { data: avaliacoes, error: avaliacoesError } = await supabase
    .from('avaliacoes')
    .select(`id, tipo, avaliador_id, ${AVALIACAO_DATA_COLUMN}`)
    .eq('avaliado_id', colaboradorId)
    .order(AVALIACAO_DATA_COLUMN, { ascending: false });

  if (avaliacoesError) {
    throw new Error(avaliacoesError.message);
  }

  const listaAvaliacoes = avaliacoes ?? [];

  if (listaAvaliacoes.length === 0) {
    return [];
  }

  const avaliacaoIds = listaAvaliacoes.map((avaliacao) => avaliacao.id);
  const avaliadorIds = [
    ...new Set(
      listaAvaliacoes
        .map((avaliacao) => avaliacao.avaliador_id)
        .filter((id): id is string => typeof id === 'string'),
    ),
  ];

  const [{ data: respostas, error: respostasError }, { data: avaliadores, error: avaliadoresError }] =
    await Promise.all([
      supabase
        .from('respostas')
        .select('id, avaliacao_id, pergunta_id, nota, justificativa')
        .in('avaliacao_id', avaliacaoIds),
      avaliadorIds.length > 0
        ? supabase.from('profiles').select('id, nome').in('id', avaliadorIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  if (respostasError) {
    throw new Error(respostasError.message);
  }

  if (avaliadoresError) {
    throw new Error(avaliadoresError.message);
  }

  const avaliadorNomePorId = new Map((avaliadores ?? []).map((perfil) => [perfil.id, perfil.nome]));

  const perguntaIds = [
    ...new Set(
      (respostas ?? [])
        .map((resposta) => resposta.pergunta_id)
        .filter((id): id is string => typeof id === 'string'),
    ),
  ];

  const perguntasMap = await fetchPerguntasMap(perguntaIds);
  const respostasLista = (respostas ?? []) as RespostaRow[];

  return listaAvaliacoes.map((avaliacao) => {
    const respostasAvaliacao = mapRespostas(respostasLista, avaliacao.id, perguntasMap);
    const dataReferencia =
      (avaliacao as Record<string, string>)[AVALIACAO_DATA_COLUMN] ??
      (avaliacao as { created_at: string }).created_at;

    return {
      id: avaliacao.id,
      tipo: avaliacao.tipo,
      dataReferencia,
      media: calcularMediaRespostas(respostasAvaliacao),
      respostas: respostasAvaliacao,
      avaliadorNome: avaliacao.avaliador_id
        ? avaliadorNomePorId.get(avaliacao.avaliador_id)
        : undefined,
    };
  });
}

export function formatHistoricoData(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatHistoricoMedia(media: number | null): string {
  if (media === null) {
    return '—';
  }

  return media.toFixed(1);
}
