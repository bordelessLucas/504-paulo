import { supabase } from '@/lib/supabase';
import type {
  PerguntaAvaliacao,
  PontoMelhoria,
  Profile,
  TipoAvaliacao,
} from '@/types/supabase';

export const COLABORADORES_PAGE_SIZE = 10;

export type ColaboradorResumo = Pick<Profile, 'id' | 'nome' | 'departamento' | 'funcao'>;

export type ColaboradorComStatus = ColaboradorResumo & {
  ultimaAvaliacaoData?: string;
};

export type ColaboradoresPage = {
  items: ColaboradorResumo[];
  total: number;
  page: number;
  pageSize: number;
};

export type ColaboradoresAvaliacaoExecutive = {
  pendentes: ColaboradorResumo[];
  concluidas: ColaboradorComStatus[];
  cicloInicio: string;
};

export type RespostaFormulario = {
  perguntaId: string;
  nota: number;
  justificativa?: string;
  evidencia?: string;
};

export type MelhoriaFormulario = {
  pontoId: string;
  melhorou: boolean;
};

export function getQuinzenaStartDate(referenceDate = new Date()): string {
  const day = referenceDate.getDate();
  const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), day <= 15 ? 1 : 16);

  return start.toISOString().slice(0, 10);
}

export async function fetchColaboradoresPage(
  avaliadorId: string,
  page: number,
): Promise<ColaboradoresPage> {
  const from = page * COLABORADORES_PAGE_SIZE;
  const to = from + COLABORADORES_PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from('profiles')
    .select('id, nome, departamento, funcao', { count: 'exact' })
    .eq('role', 'colaborador')
    .eq('status', 'ativo')
    .neq('id', avaliadorId)
    .order('nome', { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize: COLABORADORES_PAGE_SIZE,
  };
}

export async function fetchColaboradoresAvaliacaoExecutive(
  avaliadorId: string,
): Promise<ColaboradoresAvaliacaoExecutive> {
  const cicloInicio = getQuinzenaStartDate();

  const { data: colaboradores, error: colaboradoresError } = await supabase
    .from('profiles')
    .select('id, nome, departamento, funcao')
    .eq('role', 'colaborador')
    .eq('status', 'ativo')
    .neq('id', avaliadorId)
    .order('nome', { ascending: true });

  if (colaboradoresError) {
    throw new Error(colaboradoresError.message);
  }

  const lista = colaboradores ?? [];

  if (lista.length === 0) {
    return { pendentes: [], concluidas: [], cicloInicio };
  }

  const colaboradorIds = lista.map((colaborador) => colaborador.id);

  const { data: avaliacoes, error: avaliacoesError } = await supabase
    .from('avaliacoes')
    .select('avaliado_id, data_criacao')
    .in('avaliado_id', colaboradorIds)
    .gte('data_criacao', `${cicloInicio}T00:00:00.000Z`);

  if (avaliacoesError) {
    throw new Error(avaliacoesError.message);
  }

  const ultimaAvaliacaoPorColaborador = new Map<string, string>();

  for (const avaliacao of avaliacoes ?? []) {
    const dataReferencia = avaliacao.data_criacao.slice(0, 10);
    const atual = ultimaAvaliacaoPorColaborador.get(avaliacao.avaliado_id);

    if (!atual || dataReferencia > atual) {
      ultimaAvaliacaoPorColaborador.set(avaliacao.avaliado_id, dataReferencia);
    }
  }

  const pendentes: ColaboradorResumo[] = [];
  const concluidas: ColaboradorComStatus[] = [];

  for (const colaborador of lista) {
    const ultimaAvaliacaoData = ultimaAvaliacaoPorColaborador.get(colaborador.id);

    if (ultimaAvaliacaoData) {
      concluidas.push({ ...colaborador, ultimaAvaliacaoData });
      continue;
    }

    pendentes.push(colaborador);
  }

  return { pendentes, concluidas, cicloInicio };
}

export async function fetchPerguntasPorDepartamento(departamento?: string | null): Promise<{
  perguntas: PerguntaAvaliacao[];
  departamentoLabel: string;
}> {
  const departamentoLabel = departamento?.trim() || 'Sem departamento';

  if (!departamento?.trim()) {
    return { perguntas: [], departamentoLabel };
  }

  const { data, error } = await supabase
    .from('perguntas')
    .select('*')
    .ilike('secao_departamento', departamento.trim())
    .order('peso', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return {
    perguntas: data ?? [],
    departamentoLabel,
  };
}

/** @deprecated Use fetchPerguntasPorDepartamento */
export async function fetchPerguntasPorAvaliador(departamento?: string | null) {
  const result = await fetchPerguntasPorDepartamento(departamento);
  return {
    perguntas: result.perguntas,
    perfilAlvo: result.departamentoLabel,
  };
}

type RespostaComPergunta = {
  id: string;
  pergunta_id: string | null;
  nota: number | null;
  justificativa: string | null;
  perguntas: { descricao: string } | null;
};

export async function fetchPontosMelhoriaAnteriores(avaliadoId: string): Promise<PontoMelhoria[]> {
  const { data: ultimaAvaliacao, error: avaliacaoError } = await supabase
    .from('avaliacoes')
    .select('id')
    .eq('avaliado_id', avaliadoId)
    .order('data_criacao', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (avaliacaoError) {
    throw new Error(avaliacaoError.message);
  }

  if (!ultimaAvaliacao) {
    return [];
  }

  const { data, error } = await supabase
    .from('respostas')
    .select('id, pergunta_id, nota, justificativa, perguntas(descricao)')
    .eq('avaliacao_id', ultimaAvaliacao.id)
    .in('nota', [2, 3]);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as RespostaComPergunta[]).map((resposta) => ({
    id: resposta.id,
    respostaAnteriorId: resposta.id,
    perguntaId: resposta.pergunta_id,
    descricao:
      resposta.perguntas?.descricao ??
      resposta.justificativa ??
      'Ponto de melhoria identificado na avaliação anterior',
  }));
}

/** @deprecated Use fetchPontosMelhoriaAnteriores */
export const fetchPontosMelhoriaPendentes = fetchPontosMelhoriaAnteriores;

export async function submitAvaliacao(params: {
  avaliadorId: string;
  avaliadoId: string;
  tipo?: TipoAvaliacao;
  respostas: RespostaFormulario[];
  melhorias: MelhoriaFormulario[];
}): Promise<void> {
  const { data: avaliacao, error: avaliacaoError } = await supabase
    .from('avaliacoes')
    .insert({
      avaliador_id: params.avaliadorId,
      avaliado_id: params.avaliadoId,
      tipo: params.tipo ?? 'quinzenal',
    })
    .select('id')
    .single();

  if (avaliacaoError) {
    throw new Error(avaliacaoError.message);
  }

  if (params.respostas.length > 0) {
    const { error: respostasError } = await supabase.from('respostas').insert(
      params.respostas.map((resposta) => ({
        avaliacao_id: avaliacao.id,
        pergunta_id: resposta.perguntaId,
        nota: resposta.nota,
        justificativa: resposta.justificativa?.trim() || null,
        evidencia: resposta.evidencia?.trim() || null,
      })),
    );

    if (respostasError) {
      throw new Error(respostasError.message);
    }
  }

  const melhoriasMarcadas = params.melhorias.filter((item) => item.melhorou);

  for (const melhoria of melhoriasMarcadas) {
    const { error } = await supabase
      .from('respostas')
      .update({ evidencia: '[Melhorou na avaliação seguinte]' })
      .eq('id', melhoria.pontoId);

    if (error) {
      throw new Error(error.message);
    }
  }
}
