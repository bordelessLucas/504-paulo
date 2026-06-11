import { AVALIACAO_DATA_COLUMN } from '@/features/avaliacao/avaliacao-date';
import { supabase } from '@/lib/supabase';
import type { Profile, TipoBeneficioAnual } from '@/types/supabase';

export type ColaboradorConsolidado = Pick<Profile, 'id' | 'nome' | 'departamento' | 'funcao'>;

export type MediasAnuaisColaborador = {
  anoReferencia: number;
  mediaQuinzenal: number | null;
  totalRespostasQuinzenal: number;
  mediaSemestral: number | null;
  totalRespostasSemestral: number;
  totalAvaliacoesQuinzenal: number;
  totalAvaliacoesSemestral: number;
};

export type DecisaoAnualExistente = {
  id: string;
  tipoBeneficio: TipoBeneficioAnual;
  justificativaFinanceira: string;
  mediaQuinzenalAno: number | null;
  mediaSemestralAno: number | null;
  createdAt: string;
};

function calcularMedia(notas: number[]): number | null {
  if (notas.length === 0) {
    return null;
  }

  return notas.reduce((total, nota) => total + nota, 0) / notas.length;
}

function getAnoIntervaloIso(anoReferencia: number) {
  return {
    inicio: `${anoReferencia}-01-01T00:00:00.000Z`,
    fim: `${anoReferencia + 1}-01-01T00:00:00.000Z`,
  };
}

export async function fetchColaboradoresConsolidados(): Promise<ColaboradorConsolidado[]> {
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

async function fetchMediasPorTipo(
  colaboradorId: string,
  tipo: 'quinzenal' | 'semestral',
  anoReferencia: number,
): Promise<{ media: number | null; totalRespostas: number; totalAvaliacoes: number }> {
  const { inicio, fim } = getAnoIntervaloIso(anoReferencia);

  const { data: avaliacoes, error: avaliacoesError } = await supabase
    .from('avaliacoes')
    .select('id')
    .eq('avaliado_id', colaboradorId)
    .eq('tipo', tipo)
    .eq('status', 'aprovada')
    .gte(AVALIACAO_DATA_COLUMN, inicio)
    .lt(AVALIACAO_DATA_COLUMN, fim);

  if (avaliacoesError) {
    throw new Error(avaliacoesError.message);
  }

  const avaliacaoIds = (avaliacoes ?? []).map((avaliacao) => avaliacao.id);

  if (avaliacaoIds.length === 0) {
    return { media: null, totalRespostas: 0, totalAvaliacoes: 0 };
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
    totalAvaliacoes: avaliacaoIds.length,
  };
}

export async function fetchMediasAnuaisColaborador(
  colaboradorId: string,
  anoReferencia = new Date().getFullYear(),
): Promise<MediasAnuaisColaborador> {
  const [quinzenal, semestral] = await Promise.all([
    fetchMediasPorTipo(colaboradorId, 'quinzenal', anoReferencia),
    fetchMediasPorTipo(colaboradorId, 'semestral', anoReferencia),
  ]);

  return {
    anoReferencia,
    mediaQuinzenal: quinzenal.media,
    totalRespostasQuinzenal: quinzenal.totalRespostas,
    mediaSemestral: semestral.media,
    totalRespostasSemestral: semestral.totalRespostas,
    totalAvaliacoesQuinzenal: quinzenal.totalAvaliacoes,
    totalAvaliacoesSemestral: semestral.totalAvaliacoes,
  };
}

export async function fetchDecisaoAnualExistente(
  colaboradorId: string,
  anoReferencia = new Date().getFullYear(),
): Promise<DecisaoAnualExistente | null> {
  const { data, error } = await supabase
    .from('decisoes_anuais_estrategicas')
    .select(
      'id, tipo_beneficio, justificativa_financeira, media_quinzenal_ano, media_semestral_ano, created_at',
    )
    .eq('colaborador_id', colaboradorId)
    .eq('ano_referencia', anoReferencia)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    tipoBeneficio: data.tipo_beneficio as TipoBeneficioAnual,
    justificativaFinanceira: data.justificativa_financeira,
    mediaQuinzenalAno: data.media_quinzenal_ano,
    mediaSemestralAno: data.media_semestral_ano,
    createdAt: data.created_at,
  };
}

export function formatMediaAnual(media: number | null): string {
  if (media === null) {
    return '—';
  }

  return media.toFixed(1);
}

export function buildJustificativaAnualPayload(
  tipoBeneficio: TipoBeneficioAnual,
  justificativaFinanceira: string,
  medias: MediasAnuaisColaborador,
): string {
  const labels: Record<TipoBeneficioAnual, string> = {
    reajuste: 'Reajuste',
    plr: 'PLR',
    bonificacao: 'Bonificação',
    nenhum: 'Nenhum',
  };

  return [
    `[Análise Anual ${medias.anoReferencia}]`,
    `Benefício: ${labels[tipoBeneficio]}`,
    `Média quinzenal: ${formatMediaAnual(medias.mediaQuinzenal)} (${medias.totalAvaliacoesQuinzenal} avaliações)`,
    `Média semestral: ${formatMediaAnual(medias.mediaSemestral)} (${medias.totalAvaliacoesSemestral} avaliações)`,
    '',
    'Impacto financeiro / caixa:',
    justificativaFinanceira.trim(),
  ].join('\n');
}

export async function salvarDecisaoAnualEstrategica(params: {
  colaboradorId: string;
  decididoPorId: string;
  anoReferencia: number;
  tipoBeneficio: TipoBeneficioAnual;
  justificativaFinanceira: string;
  medias: MediasAnuaisColaborador;
}): Promise<void> {
  const justificativa = params.justificativaFinanceira.trim();

  if (justificativa.length < 10) {
    throw new Error('A justificativa financeira deve ter pelo menos 10 caracteres.');
  }

  const existente = await fetchDecisaoAnualExistente(params.colaboradorId, params.anoReferencia);

  if (existente) {
    throw new Error(`Já existe uma decisão anual registrada para ${params.anoReferencia}.`);
  }

  const { data: avaliacaoAnual, error: avaliacaoError } = await supabase
    .from('avaliacoes')
    .insert({
      avaliador_id: params.decididoPorId,
      avaliado_id: params.colaboradorId,
      tipo: 'anual',
      status: 'pendente_rh',
    })
    .select('id')
    .single();

  if (avaliacaoError) {
    throw new Error(avaliacaoError.message);
  }

  const { error: decisaoError } = await supabase.from('decisoes_anuais_estrategicas').insert({
    colaborador_id: params.colaboradorId,
    decidido_por_id: params.decididoPorId,
    ano_referencia: params.anoReferencia,
    tipo_beneficio: params.tipoBeneficio,
    justificativa_financeira: buildJustificativaAnualPayload(
      params.tipoBeneficio,
      justificativa,
      params.medias,
    ),
    media_quinzenal_ano: params.medias.mediaQuinzenal,
    media_semestral_ano: params.medias.mediaSemestral,
    avaliacao_anual_id: avaliacaoAnual.id,
  });

  if (decisaoError) {
    throw new Error(decisaoError.message);
  }
}
