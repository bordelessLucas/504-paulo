import {
  AVALIACAO_DATA_COLUMN,
  getAvaliacaoDataDate,
  type AvaliacaoComData,
} from '@/features/avaliacao/avaliacao-date';
import {
  applyColaboradorScopeToQuery,
  resolveColaboradorScope,
  shouldListAllColaboradores,
} from '@/features/avaliacao/colaborador-scope';
import {
  getCicloInicioPorTipo,
  getQuinzenaStartDate,
  SECAO_PERGUNTAS_UNIVERSAIS_LEGACY,
} from '@/features/avaliacao/ciclos';
import {
  resolveSecoesParaAvaliador,
  SECOES_OFFSHORE,
  type SecaoOffshore,
} from '@/features/avaliacao/secoes-offshore';
import { avaliarGovernancaAvaliacao } from '@/features/avaliacao/governanca';
import { criarPdiAutomaticoSeNecessario } from '@/features/avaliacao/pdi-auto';
import { registrarAuditLog } from '@/features/compliance/audit-log';
import { supabase } from '@/lib/supabase';
import type {
  PerguntaAvaliacao,
  PontoMelhoria,
  Profile,
  TipoAvaliacao,
  UserRole,
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

export type ColaboradorEquipeStatus = ColaboradorResumo & {
  avaliadoNaQuinzena: boolean;
  ultimaAvaliacaoData?: string;
};

export type EquipeQuinzenaData = {
  colaboradores: ColaboradorEquipeStatus[];
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

export { getQuinzenaStartDate } from '@/features/avaliacao/ciclos';

export async function fetchPerguntasOffshore(): Promise<PerguntaAvaliacao[]> {
  const { data, error } = await supabase
    .from('perguntas')
    .select('*')
    .in('secao_departamento', [...SECOES_OFFSHORE])
    .order('codigo', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchPerguntasPorAvaliador(params: {
  role: UserRole | null | undefined;
  tipo: TipoAvaliacao;
  departamentoAvaliador?: string | null;
}): Promise<PerguntaAvaliacao[]> {
  const secoes = resolveSecoesParaAvaliador(
    params.role,
    params.tipo,
    params.departamentoAvaliador,
  );

  if (secoes.length === 0) {
    return fetchPerguntasUniversais();
  }

  const { data, error } = await supabase
    .from('perguntas')
    .select('*')
    .in('secao_departamento', secoes)
    .order('codigo', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const offshore = data ?? [];
  if (offshore.length > 0) {
    return offshore;
  }

  return fetchPerguntasUniversais();
}

export async function fetchPerguntasUniversais(): Promise<PerguntaAvaliacao[]> {
  const { data, error } = await supabase
    .from('perguntas')
    .select('*')
    .eq('secao_departamento', SECAO_PERGUNTAS_UNIVERSAIS_LEGACY)
    .order('codigo', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const universais = data ?? [];
  if (universais.length > 0) {
    return universais;
  }

  return fetchPerguntasOffshore();
}

export function filterPerguntasPorAvaliador(
  perguntas: PerguntaAvaliacao[],
  params: {
    role: UserRole | null | undefined;
    tipo: TipoAvaliacao;
    departamentoAvaliador?: string | null;
  },
): PerguntaAvaliacao[] {
  const secoes = resolveSecoesParaAvaliador(
    params.role,
    params.tipo,
    params.departamentoAvaliador,
  );

  if (secoes.length > 0) {
    const offshore = perguntas.filter((pergunta) =>
      secoes.includes(pergunta.secao_departamento as SecaoOffshore),
    );
    if (offshore.length > 0) {
      return offshore;
    }
  }

  const universais = perguntas.filter(
    (pergunta) =>
      pergunta.secao_departamento === SECAO_PERGUNTAS_UNIVERSAIS_LEGACY ||
      pergunta.secao_departamento === 'UNIVERSAL',
  );

  return universais.length > 0 ? universais : perguntas;
}

export async function fetchColaboradoresPage(
  avaliadorId: string,
  page: number,
  role?: UserRole | null,
): Promise<ColaboradoresPage> {
  const from = page * COLABORADORES_PAGE_SIZE;
  const to = from + COLABORADORES_PAGE_SIZE - 1;
  const scope = shouldListAllColaboradores(role)
    ? { departamento: null, liderId: null, restrictToDepartamento: false, restrictToLideranca: false }
    : await resolveColaboradorScope(avaliadorId, role);

  let query = supabase
    .from('profiles')
    .select('id, nome, departamento, funcao', { count: 'exact' })
    .eq('role', 'colaborador')
    .eq('status', 'ativo')
    .neq('id', avaliadorId)
    .order('nome', { ascending: true });

  query = applyColaboradorScopeToQuery(query, scope);

  const { data, error, count } = await query.range(from, to);

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
  tipo: TipoAvaliacao = 'quinzenal',
  role?: UserRole | null,
): Promise<ColaboradoresAvaliacaoExecutive> {
  const cicloInicio = getCicloInicioPorTipo(tipo);
  const scope = shouldListAllColaboradores(role)
    ? { departamento: null, liderId: null, restrictToDepartamento: false, restrictToLideranca: false }
    : await resolveColaboradorScope(avaliadorId, role);

  let colaboradoresQuery = supabase
    .from('profiles')
    .select('id, nome, departamento, funcao')
    .eq('role', 'colaborador')
    .eq('status', 'ativo')
    .neq('id', avaliadorId)
    .order('nome', { ascending: true });

  colaboradoresQuery = applyColaboradorScopeToQuery(colaboradoresQuery, scope);

  const { data: colaboradores, error: colaboradoresError } = await colaboradoresQuery;

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
    .select(`avaliado_id, ${AVALIACAO_DATA_COLUMN}`)
    .in('avaliado_id', colaboradorIds)
    .eq('tipo', tipo)
    .gte(AVALIACAO_DATA_COLUMN, `${cicloInicio}T00:00:00.000Z`);

  if (avaliacoesError) {
    throw new Error(avaliacoesError.message);
  }

  const ultimaAvaliacaoPorColaborador = new Map<string, string>();

  for (const avaliacao of (avaliacoes ?? []) as Array<
    { avaliado_id: string } & AvaliacaoComData
  >) {
    const dataReferencia = getAvaliacaoDataDate(avaliacao);
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

export async function fetchEquipeStatusCiclo(
  avaliadorId: string,
  role: UserRole | null | undefined,
): Promise<EquipeQuinzenaData> {
  const tipo: TipoAvaliacao = role === 'gestor' || role === 'gerente' ? 'semestral' : 'quinzenal';
  const executive = await fetchColaboradoresAvaliacaoExecutive(avaliadorId, tipo, role);

  const colaboradores: ColaboradorEquipeStatus[] = [
    ...executive.concluidas.map((colaborador) => ({
      ...colaborador,
      avaliadoNaQuinzena: true,
    })),
    ...executive.pendentes.map((colaborador) => ({
      ...colaborador,
      avaliadoNaQuinzena: false,
    })),
  ].sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR'));

  return {
    colaboradores,
    cicloInicio: executive.cicloInicio,
  };
}

/** @deprecated Use fetchPerguntasPorAvaliador com role/tipo */
export async function fetchPerguntasPorDepartamento(_departamento?: string | null): Promise<{
  perguntas: PerguntaAvaliacao[];
  departamentoLabel: string;
}> {
  const perguntas = await fetchPerguntasUniversais();

  return {
    perguntas,
    departamentoLabel: 'Metodologia Offshore',
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
    .order(AVALIACAO_DATA_COLUMN, { ascending: false })
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

/** @deprecated Use fetchEquipeStatusCiclo */
export const fetchEquipeStatusQuinzena = fetchEquipeStatusCiclo;

export async function submitAvaliacao(params: {
  avaliadorId: string;
  avaliadoId: string;
  tipo?: TipoAvaliacao;
  respostas: RespostaFormulario[];
  melhorias: MelhoriaFormulario[];
}): Promise<{ avaliacaoId: string }> {
  const { data: avaliacao, error: avaliacaoError } = await supabase
    .from('avaliacoes')
    .insert({
      avaliador_id: params.avaliadorId,
      avaliado_id: params.avaliadoId,
      tipo: params.tipo ?? 'quinzenal',
      status: 'pendente_rh',
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

  const notas = params.respostas.map((r) => r.nota);
  const mediaSimples =
    notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : null;
  const governanca = avaliarGovernancaAvaliacao({ mediaPonderada: mediaSimples });

  if (governanca.acoes.includes('pdi_urgente') || governanca.acoes.includes('alerta_critico')) {
    await criarPdiAutomaticoSeNecessario({
      colaboradorId: params.avaliadoId,
      criadoPorId: params.avaliadorId,
      avaliacaoOrigemId: avaliacao.id,
      media: mediaSimples,
      classificacao: governanca.classificacao,
    });
  }

  if (governanca.acoes.includes('alerta_critico') && mediaSimples !== null) {
    const { notificarImaCritico } = await import('@/features/avaliacao/ima-alerta');
    await notificarImaCritico({
      colaboradorId: params.avaliadoId,
      media: mediaSimples,
      avaliacaoId: avaliacao.id,
    });
  }

  await registrarAuditLog({
    acao: 'CRIACAO',
    tabela: 'avaliacoes',
    registroId: avaliacao.id,
    observacao: `Avaliação ${params.tipo ?? 'quinzenal'} registrada. IMA parcial: ${mediaSimples?.toFixed(2) ?? 'N/A'}`,
  });

  return { avaliacaoId: avaliacao.id };
}

export async function addPontoMelhoriaAvaliacao(
  avaliacaoId: string,
  texto: string,
): Promise<void> {
  const trimmed = texto.trim();

  if (trimmed.length < 5) {
    throw new Error('O ponto de melhoria deve ter pelo menos 5 caracteres.');
  }

  const { error } = await supabase.from('respostas').insert({
    avaliacao_id: avaliacaoId,
    pergunta_id: null,
    nota: null,
    justificativa: null,
    evidencia: trimmed,
  });

  if (error) {
    throw new Error(error.message);
  }
}
