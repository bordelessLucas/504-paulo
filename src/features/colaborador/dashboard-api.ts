import { supabase } from '@/lib/supabase';

export type ColaboradorDashboardData = {
  mediaGeral: number | null;
  totalRespostas: number;
  feedbacks: FeedbackColaborador[];
  dataAdmissao: string | null;
};

export type FeedbackColaborador = {
  id: string;
  texto: string;
  dataReferencia: string;
};

type RespostaFeedbackRow = {
  id: string;
  justificativa: string | null;
  evidencia: string | null;
  created_at: string;
};

function buildFeedbacksFromRespostas(respostas: RespostaFeedbackRow[]): FeedbackColaborador[] {
  const feedbacks: FeedbackColaborador[] = [];

  for (const resposta of respostas) {
    const justificativa = resposta.justificativa?.trim();
    const evidencia = resposta.evidencia?.trim();

    if (justificativa) {
      feedbacks.push({
        id: `${resposta.id}-justificativa`,
        texto: justificativa,
        dataReferencia: resposta.created_at,
      });
    }

    if (evidencia && evidencia !== '[Melhorou na avaliação seguinte]') {
      feedbacks.push({
        id: `${resposta.id}-evidencia`,
        texto: evidencia,
        dataReferencia: resposta.created_at,
      });
    }
  }

  return feedbacks.sort(
    (left, right) =>
      new Date(right.dataReferencia).getTime() - new Date(left.dataReferencia).getTime(),
  );
}

export async function fetchColaboradorDashboard(userId: string): Promise<ColaboradorDashboardData> {
  const [{ data: profile, error: profileError }, { data: avaliacoes, error: avaliacoesError }] =
    await Promise.all([
      supabase.from('profiles').select('data_admissao').eq('id', userId).single(),
      supabase.from('avaliacoes').select('id').eq('avaliado_id', userId),
    ]);

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (avaliacoesError) {
    throw new Error(avaliacoesError.message);
  }

  const avaliacaoIds = (avaliacoes ?? []).map((avaliacao) => avaliacao.id);

  if (avaliacaoIds.length === 0) {
    return {
      mediaGeral: null,
      totalRespostas: 0,
      feedbacks: [],
      dataAdmissao: profile.data_admissao,
    };
  }

  const { data: respostas, error: respostasError } = await supabase
    .from('respostas')
    .select('id, nota, justificativa, evidencia, created_at')
    .in('avaliacao_id', avaliacaoIds);

  if (respostasError) {
    throw new Error(respostasError.message);
  }

  const listaRespostas = respostas ?? [];
  const notas = listaRespostas
    .map((resposta) => resposta.nota)
    .filter((nota): nota is number => typeof nota === 'number');

  const mediaGeral =
    notas.length > 0 ? notas.reduce((total, nota) => total + nota, 0) / notas.length : null;

  return {
    mediaGeral,
    totalRespostas: notas.length,
    feedbacks: buildFeedbacksFromRespostas(listaRespostas),
    dataAdmissao: profile.data_admissao,
  };
}

export function formatMediaGeral(media: number | null): string {
  if (media === null) {
    return '—';
  }

  return media.toFixed(1);
}

export function formatFeedbackDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
