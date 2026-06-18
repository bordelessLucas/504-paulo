import { AVALIACAO_DATA_COLUMN } from '@/features/avaliacao/avaliacao-date';
import { TIPO_AVALIACAO_LABELS } from '@/features/avaliacao/ciclos';
import { calcularTempoEmpresa } from '@/features/colaborador/tempo-empresa';
import {
  CODIGOS_PERGUNTAS_UNIVERSAIS,
  PERGUNTAS_UNIVERSAIS_RADAR,
} from '@/features/gerencial/perguntas-universais';
import {
  getSemaforoItem,
  getSemaforoPorMedia,
  type SemaforoStatus,
} from '@/features/gerencial/semaforo';
import { supabase } from '@/lib/supabase';
import type {
  StatusSolicitacaoSalarialEnum,
  TipoAvaliacao,
  TipoBeneficioAnual,
} from '@/types/supabase';
import { TIPO_BENEFICIO_ANUAL_LABELS } from '@/types/supabase';

export type RadarUniversalData = {
  labels: string[];
  valores: number[];
};

export type MelhoriaSalarialHistorico = {
  id: string;
  status: StatusSolicitacaoSalarialEnum;
  tipoLabel: string;
  justificativa: string;
  createdAt: string;
};

export type FichaRespostaDetalhe = {
  codigo: string;
  label: string;
  nota: number | null;
  justificativa: string | null;
};

export type FichaAvaliacaoDetalhe = {
  id: string;
  tipo: TipoAvaliacao;
  tipoLabel: string;
  createdAt: string;
  avaliadorNome: string | null;
  media: number | null;
  respostas: FichaRespostaDetalhe[];
};

export type FichaDecisaoAnual = {
  anoReferencia: number;
  tipoBeneficio: TipoBeneficioAnual;
  tipoBeneficioLabel: string;
  justificativaFinanceira: string;
  mediaQuinzenalAno: number | null;
  mediaSemestralAno: number | null;
  createdAt: string;
};

export type ColaboradorFichaProfile = {
  nome: string;
  departamento: string | null;
  funcao: string | null;
  dataAdmissao: string | null;
  dataNascimento: string | null;
  classificacao: string | null;
  nivelIrata: string | null;
  status: string | null;
  ddd: string | null;
  telefone: string | null;
  expertise: string | null;
  formacaoTecnica: string | null;
  certificacaoEdn: boolean;
  liderNome: string | null;
  tempoEmpresaLabel: string | null;
};

export type FichaExportOptions = {
  periodoInicio?: string;
  periodoFim?: string;
};

export type ColaboradorFichaData = {
  profile: ColaboradorFichaProfile;
  mediaGeral: number | null;
  totalRespostas: number;
  semaforoStatus: SemaforoStatus;
  semaforoLabel: string;
  radar: RadarUniversalData;
  avaliacoes: FichaAvaliacaoDetalhe[];
  melhoriasSalariais: MelhoriaSalarialHistorico[];
  decisoesAnuais: FichaDecisaoAnual[];
  periodoLabel: string;
};

export type ColaboradorExportacaoResumo = {
  id: string;
  nome: string;
  departamento: string | null;
  funcao: string | null;
};

function calcularMedia(notas: number[]): number | null {
  if (notas.length === 0) {
    return null;
  }

  return notas.reduce((total, nota) => total + nota, 0) / notas.length;
}

function formatDateBr(isoDate: string | null | undefined): string {
  if (!isoDate?.trim()) {
    return '—';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  }

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return date.toLocaleDateString('pt-BR');
}

function resolvePeriodoLabel(options?: FichaExportOptions): string {
  if (options?.periodoInicio && options?.periodoFim) {
    return `${formatDateBr(options.periodoInicio)} a ${formatDateBr(options.periodoFim)}`;
  }

  if (options?.periodoInicio) {
    return `A partir de ${formatDateBr(options.periodoInicio)}`;
  }

  if (options?.periodoFim) {
    return `Até ${formatDateBr(options.periodoFim)}`;
  }

  return 'Histórico completo';
}

function resolveMelhoriaTipoLabel(gerenteId: string | null, justificativa: string): string {
  if (!gerenteId) {
    return 'Autoavaliação';
  }

  const match = justificativa.match(/^\[([^\]]+)\]/);
  return match?.[1] ?? 'Solicitação de gestor';
}

function buildRadarColaborador(notasPorCodigo: Map<string, number[]>): RadarUniversalData {
  return {
    labels: PERGUNTAS_UNIVERSAIS_RADAR.map((item) => item.label),
    valores: CODIGOS_PERGUNTAS_UNIVERSAIS.map((codigo) => {
      const media = calcularMedia(notasPorCodigo.get(codigo) ?? []);
      return media ?? 0;
    }),
  };
}

type PerguntaMeta = {
  id: string;
  codigo: string;
  label: string;
};

async function fetchPerguntasUniversaisMeta(): Promise<{
  porId: Map<string, PerguntaMeta>;
  porCodigo: Map<string, string>;
}> {
  const { data, error } = await supabase
    .from('perguntas')
    .select('id, codigo, descricao')
    .eq('secao_departamento', 'UNIVERSAL')
    .in('codigo', [...CODIGOS_PERGUNTAS_UNIVERSAIS]);

  if (error) {
    throw new Error(error.message);
  }

  const porId = new Map<string, PerguntaMeta>();
  const porCodigo = new Map<string, string>();

  for (const pergunta of data ?? []) {
    if (!pergunta.codigo) {
      continue;
    }

    const radarItem = PERGUNTAS_UNIVERSAIS_RADAR.find((item) => item.codigo === pergunta.codigo);
    porId.set(pergunta.id, {
      id: pergunta.id,
      codigo: pergunta.codigo,
      label: radarItem?.label ?? pergunta.codigo,
    });
    porCodigo.set(pergunta.codigo, pergunta.id);
  }

  return { porId, porCodigo };
}

export async function fetchColaboradoresAtivosExportacao(
  departamento?: string,
): Promise<ColaboradorExportacaoResumo[]> {
  let query = supabase
    .from('profiles')
    .select('id, nome, departamento, funcao')
    .eq('role', 'colaborador')
    .eq('status', 'ativo')
    .order('nome');

  if (departamento?.trim()) {
    query = query.eq('departamento', departamento.trim());
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    nome: item.nome,
    departamento: item.departamento,
    funcao: item.funcao,
  }));
}

export async function fetchDepartamentosAtivos(): Promise<string[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('departamento')
    .eq('role', 'colaborador')
    .eq('status', 'ativo')
    .not('departamento', 'is', null);

  if (error) {
    throw new Error(error.message);
  }

  const departamentos = new Set<string>();

  for (const item of data ?? []) {
    const departamento = item.departamento?.trim();
    if (departamento) {
      departamentos.add(departamento);
    }
  }

  return [...departamentos].sort((left, right) => left.localeCompare(right, 'pt-BR'));
}

export function buildPeriodoAnoCorrente(): FichaExportOptions {
  const year = new Date().getFullYear();
  return {
    periodoInicio: `${year}-01-01`,
    periodoFim: `${year}-12-31`,
  };
}

export function buildPeriodoUltimosMeses(meses: number): FichaExportOptions {
  const fim = new Date();
  const inicio = new Date();
  inicio.setMonth(inicio.getMonth() - meses);

  const format = (date: Date) => date.toISOString().slice(0, 10);

  return {
    periodoInicio: format(inicio),
    periodoFim: format(fim),
  };
}

export async function fetchColaboradorFicha(
  colaboradorId: string,
  options?: FichaExportOptions,
): Promise<ColaboradorFichaData> {
  const { data: profileRow, error: profileError } = await supabase
    .from('profiles')
    .select(
      'nome, departamento, funcao, data_admissao, data_nascimento, classificacao, nivel_irata, status, ddd, telefone, expertise, formacao_tecnica, certificacao_edn, lider_id',
    )
    .eq('id', colaboradorId)
    .single();

  if (profileError) {
    throw new Error(profileError.message);
  }

  let liderNome: string | null = null;

  if (profileRow.lider_id) {
    const { data: lider } = await supabase
      .from('profiles')
      .select('nome')
      .eq('id', profileRow.lider_id)
      .maybeSingle();

    liderNome = lider?.nome ?? null;
  }

  const tempoEmpresa = calcularTempoEmpresa(profileRow.data_admissao);
  const perguntasMeta = await fetchPerguntasUniversaisMeta();

  let avaliacoesQuery = supabase
    .from('avaliacoes')
    .select(`id, tipo, avaliador_id, ${AVALIACAO_DATA_COLUMN}`)
    .eq('avaliado_id', colaboradorId)
    .eq('status', 'aprovada')
    .order(AVALIACAO_DATA_COLUMN, { ascending: false });

  if (options?.periodoInicio) {
    avaliacoesQuery = avaliacoesQuery.gte(AVALIACAO_DATA_COLUMN, `${options.periodoInicio}T00:00:00.000Z`);
  }

  if (options?.periodoFim) {
    avaliacoesQuery = avaliacoesQuery.lte(AVALIACAO_DATA_COLUMN, `${options.periodoFim}T23:59:59.999Z`);
  }

  const [
    { data: avaliacoes, error: avaliacoesError },
    { data: melhorias, error: melhoriasError },
    { data: decisoes, error: decisoesError },
  ] = await Promise.all([
    avaliacoesQuery,
    supabase
      .from('melhorias_salariais')
      .select('id, status, gerente_id, justificativa, created_at')
      .eq('colaborador_id', colaboradorId)
      .order('created_at', { ascending: false }),
    supabase
      .from('decisoes_anuais_estrategicas')
      .select(
        'ano_referencia, tipo_beneficio, justificativa_financeira, media_quinzenal_ano, media_semestral_ano, created_at',
      )
      .eq('colaborador_id', colaboradorId)
      .order('ano_referencia', { ascending: false }),
  ]);

  if (avaliacoesError) {
    throw new Error(avaliacoesError.message);
  }

  if (melhoriasError) {
    throw new Error(melhoriasError.message);
  }

  if (decisoesError) {
    throw new Error(decisoesError.message);
  }

  const avaliacaoIds = (avaliacoes ?? []).map((avaliacao) => avaliacao.id);
  const avaliadorIds = [...new Set((avaliacoes ?? []).map((avaliacao) => avaliacao.avaliador_id).filter(Boolean))];

  let respostasLista: Array<{
    avaliacao_id: string;
    pergunta_id: string | null;
    nota: number | null;
    justificativa: string | null;
    evidencia: string | null;
  }> = [];

  if (avaliacaoIds.length > 0) {
    const { data, error } = await supabase
      .from('respostas')
      .select('avaliacao_id, pergunta_id, nota, justificativa, evidencia')
      .in('avaliacao_id', avaliacaoIds);

    if (error) {
      throw new Error(error.message);
    }

    respostasLista = data ?? [];
  }

  const avaliadoresPorId = new Map<string, string>();

  if (avaliadorIds.length > 0) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nome')
      .in('id', avaliadorIds as string[]);

    if (error) {
      throw new Error(error.message);
    }

    for (const avaliador of data ?? []) {
      avaliadoresPorId.set(avaliador.id, avaliador.nome);
    }
  }

  const notasPorCodigo = new Map<string, number[]>(
    CODIGOS_PERGUNTAS_UNIVERSAIS.map((codigo) => [codigo, []]),
  );
  const todasNotas: number[] = [];

  const respostasPorAvaliacao = new Map<string, typeof respostasLista>();

  for (const resposta of respostasLista) {
    const lista = respostasPorAvaliacao.get(resposta.avaliacao_id) ?? [];
    lista.push(resposta);
    respostasPorAvaliacao.set(resposta.avaliacao_id, lista);

    if (typeof resposta.nota === 'number') {
      todasNotas.push(resposta.nota);

      if (resposta.pergunta_id) {
        const meta = perguntasMeta.porId.get(resposta.pergunta_id);
        if (meta) {
          const atual = notasPorCodigo.get(meta.codigo) ?? [];
          atual.push(resposta.nota);
          notasPorCodigo.set(meta.codigo, atual);
        }
      }
    }
  }

  const avaliacoesDetalhadas: FichaAvaliacaoDetalhe[] = (avaliacoes ?? []).map((avaliacao) => {
    const respostasAvaliacao = respostasPorAvaliacao.get(avaliacao.id) ?? [];
    const notasAvaliacao = respostasAvaliacao
      .map((resposta) => resposta.nota)
      .filter((nota): nota is number => typeof nota === 'number');

    const respostasDetalhe: FichaRespostaDetalhe[] = CODIGOS_PERGUNTAS_UNIVERSAIS.map((codigo) => {
      const perguntaId = perguntasMeta.porCodigo.get(codigo);
      const resposta = respostasAvaliacao.find((item) => item.pergunta_id === perguntaId);
      const meta = perguntaId ? perguntasMeta.porId.get(perguntaId) : undefined;

      return {
        codigo,
        label: meta?.label ?? codigo,
        nota: typeof resposta?.nota === 'number' ? resposta.nota : null,
        justificativa: resposta?.justificativa?.trim() || null,
      };
    });

    const tipo = avaliacao.tipo as TipoAvaliacao;

    return {
      id: avaliacao.id,
      tipo,
      tipoLabel: TIPO_AVALIACAO_LABELS[tipo] ?? tipo,
      createdAt: avaliacao.created_at,
      avaliadorNome: avaliacao.avaliador_id
        ? (avaliadoresPorId.get(avaliacao.avaliador_id) ?? null)
        : null,
      media: calcularMedia(notasAvaliacao),
      respostas: respostasDetalhe,
    };
  });

  const mediaGeral = calcularMedia(todasNotas);
  const semaforoStatus = getSemaforoPorMedia(mediaGeral);

  return {
    profile: {
      nome: profileRow.nome,
      departamento: profileRow.departamento,
      funcao: profileRow.funcao,
      dataAdmissao: profileRow.data_admissao,
      dataNascimento: profileRow.data_nascimento,
      classificacao: profileRow.classificacao,
      nivelIrata: profileRow.nivel_irata,
      status: profileRow.status,
      ddd: profileRow.ddd,
      telefone: profileRow.telefone,
      expertise: profileRow.expertise,
      formacaoTecnica: profileRow.formacao_tecnica,
      certificacaoEdn: profileRow.certificacao_edn ?? false,
      liderNome,
      tempoEmpresaLabel: tempoEmpresa?.label ?? null,
    },
    mediaGeral,
    totalRespostas: todasNotas.length,
    semaforoStatus,
    semaforoLabel: getSemaforoItem(semaforoStatus).label,
    radar: buildRadarColaborador(notasPorCodigo),
    avaliacoes: avaliacoesDetalhadas,
    melhoriasSalariais: (melhorias ?? []).map((item) => ({
      id: item.id,
      status: item.status,
      tipoLabel: resolveMelhoriaTipoLabel(item.gerente_id, item.justificativa),
      justificativa: item.justificativa,
      createdAt: item.created_at,
    })),
    decisoesAnuais: (decisoes ?? []).map((item) => ({
      anoReferencia: item.ano_referencia,
      tipoBeneficio: item.tipo_beneficio as TipoBeneficioAnual,
      tipoBeneficioLabel: TIPO_BENEFICIO_ANUAL_LABELS[item.tipo_beneficio as TipoBeneficioAnual],
      justificativaFinanceira: item.justificativa_financeira,
      mediaQuinzenalAno: item.media_quinzenal_ano,
      mediaSemestralAno: item.media_semestral_ano,
      createdAt: item.created_at,
    })),
    periodoLabel: resolvePeriodoLabel(options),
  };
}

export async function fetchFichasLote(
  colaboradorIds: string[],
  options?: FichaExportOptions,
): Promise<ColaboradorFichaData[]> {
  const fichas: ColaboradorFichaData[] = [];

  for (const colaboradorId of colaboradorIds) {
    fichas.push(await fetchColaboradorFicha(colaboradorId, options));
  }

  return fichas;
}
