import {
  calcularImaPonderado,
  classificarPorIma,
  buildMediasPorSecaoFromCodigos,
  type ClassificacaoDesempenho,
} from '@/features/avaliacao/ima';
import {
  SECAO_OFFSHORE_RADAR,
  type SecaoOffshore,
} from '@/features/avaliacao/secoes-offshore';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/supabase';

export type PotencialNivel = 'baixo' | 'medio' | 'alto';

export type NineBoxQuadrante =
  | 'critico'
  | 'desenvolvimento'
  | 'enigma'
  | 'questionavel'
  | 'solido'
  | 'alto_potencial'
  | 'confiavel'
  | 'futuro_lider'
  | 'estrela';

export const NINE_BOX_LABELS: Record<NineBoxQuadrante, string> = {
  critico: '1 — Crítico',
  desenvolvimento: '2 — Desenvolvimento',
  enigma: '3 — Enigma',
  questionavel: '4 — Questionável',
  solido: '5 — Colaborador Sólido',
  alto_potencial: '6 — Alto Potencial',
  confiavel: '7 — Profissional Confiável',
  futuro_lider: '8 — Futuro Líder',
  estrela: '9 — Estrela',
};

export const NINE_BOX_ACOES: Record<NineBoxQuadrante, string> = {
  critico: 'Análise crítica / PDI intensivo',
  desenvolvimento: 'PDI intensivo',
  enigma: 'Investigar potencial',
  questionavel: 'Avaliar fit',
  solido: 'Manter / engajar',
  alto_potencial: 'Acelerar desenvolvimento',
  confiavel: 'Reconhecimento',
  futuro_lider: 'Desenvolvimento liderança',
  estrela: 'Promoção / sucessão',
};

export type ColaboradorExecutivo = {
  id: string;
  nome: string;
  funcao: string | null;
  departamento: string | null;
  ima: number | null;
  potencial: PotencialNivel;
  quadrante: NineBoxQuadrante;
  acao: string;
  classificacao: ClassificacaoDesempenho | null;
};

export type RiscoTurnoverItem = {
  id: string;
  nome: string;
  funcao: string | null;
  tempoEmpresaAnos: number | null;
  imaAtual: number | null;
  imaAnterior: number | null;
  tendencia: 'crescente' | 'estavel' | 'decrescente';
  risco: 'ok' | 'atencao' | 'turnover' | 'perda';
};

export type PlanoSucessaoRow = {
  id: string;
  posicaoChave: string;
  titularNome: string | null;
  sucessor1Nome: string | null;
  prontidaoS1: string | null;
  sucessor2Nome: string | null;
  prontidaoS2: string | null;
  gapIdentificado: string | null;
  acaoDesenvolvimento: string | null;
};

export type DashboardExecutivoData = {
  totalColaboradores: number;
  imaMedio: number | null;
  pctAltaPerformance: number;
  pctCritico: number;
  porDepartamento: {
    departamento: string;
    total: number;
    imaMedio: number | null;
  }[];
  nineBox: ColaboradorExecutivo[];
  riscos: RiscoTurnoverItem[];
  sucessao: PlanoSucessaoRow[];
};

function performanceBand(ima: number | null): 'baixa' | 'media' | 'alta' {
  if (ima === null) return 'media';
  if (ima < 1.5) return 'baixa';
  if (ima >= 2.1) return 'alta';
  return 'media';
}

export function calcularQuadranteNineBox(
  ima: number | null,
  potencial: PotencialNivel,
): NineBoxQuadrante {
  const perf = performanceBand(ima);

  if (perf === 'alta' && potencial === 'alto') return 'estrela';
  if (perf === 'alta' && potencial === 'medio') return 'futuro_lider';
  if (perf === 'alta' && potencial === 'baixo') return 'confiavel';
  if (perf === 'media' && potencial === 'alto') return 'alto_potencial';
  if (perf === 'media' && potencial === 'medio') return 'solido';
  if (perf === 'media' && potencial === 'baixo') return 'questionavel';
  if (perf === 'baixa' && potencial === 'alto') return 'enigma';
  if (perf === 'baixa' && potencial === 'medio') return 'desenvolvimento';
  return 'critico';
}

async function fetchMediasImaPorColaborador(
  colaboradorIds: string[],
): Promise<Map<string, number>> {
  const result = new Map<string, number>();

  if (colaboradorIds.length === 0) {
    return result;
  }

  const { data: avaliacoes, error } = await supabase
    .from('avaliacoes')
    .select('id, avaliado_id')
    .in('avaliado_id', colaboradorIds)
    .eq('status', 'aprovada');

  if (error) {
    throw new Error(error.message);
  }

  const avaliacaoIds = (avaliacoes ?? []).map((a) => a.id);
  if (avaliacaoIds.length === 0) {
    return result;
  }

  const { data: respostas, error: respostasError } = await supabase
    .from('respostas')
    .select('avaliacao_id, nota, perguntas(codigo, secao_departamento)')
    .in('avaliacao_id', avaliacaoIds);

  if (respostasError) {
    throw new Error(respostasError.message);
  }

  const notasPorColaboradorCodigo = new Map<string, Map<string, number[]>>();

  for (const avaliacao of avaliacoes ?? []) {
    if (!notasPorColaboradorCodigo.has(avaliacao.avaliado_id)) {
      notasPorColaboradorCodigo.set(avaliacao.avaliado_id, new Map());
    }
  }

  const avaliacaoParaColaborador = new Map(
    (avaliacoes ?? []).map((a) => [a.id, a.avaliado_id]),
  );

  for (const resposta of respostas ?? []) {
    if (typeof resposta.nota !== 'number') continue;
    const colaboradorId = avaliacaoParaColaborador.get(resposta.avaliacao_id);
    const codigo = (resposta.perguntas as { codigo?: string } | null)?.codigo;
    if (!colaboradorId || !codigo) continue;

    const mapa = notasPorColaboradorCodigo.get(colaboradorId) ?? new Map();
    const atual = mapa.get(codigo) ?? [];
    atual.push(resposta.nota);
    mapa.set(codigo, atual);
    notasPorColaboradorCodigo.set(colaboradorId, mapa);
  }

  for (const [colaboradorId, notasPorCodigo] of notasPorColaboradorCodigo) {
    const mediasSecao = buildMediasPorSecaoFromCodigos(notasPorCodigo);
    const ima = calcularImaPonderado(mediasSecao);
    if (ima !== null) {
      result.set(colaboradorId, ima);
    }
  }

  return result;
}

export async function fetchDashboardExecutivo(): Promise<DashboardExecutivoData> {
  const { data: colaboradores, error } = await supabase
    .from('profiles')
    .select('id, nome, funcao, departamento, data_admissao')
    .eq('role', 'colaborador')
    .eq('status', 'ativo');

  if (error) {
    throw new Error(error.message);
  }

  const lista = colaboradores ?? [];
  const ids = lista.map((c) => c.id);

  const [imaMap, potencialRows, sucessaoRows] = await Promise.all([
    fetchMediasImaPorColaborador(ids),
    supabase.from('colaborador_potencial').select('colaborador_id, potencial'),
    supabase
      .from('plano_sucessao')
      .select(
        'id, posicao_chave, prontidao_s1, prontidao_s2, gap_identificado, acao_desenvolvimento, titular:profiles!plano_sucessao_titular_id_fkey(nome), s1:profiles!plano_sucessao_sucessor_1_id_fkey(nome), s2:profiles!plano_sucessao_sucessor_2_id_fkey(nome)',
      ),
  ]);

  const potencialMap = new Map<string, PotencialNivel>();
  for (const row of potencialRows.data ?? []) {
    potencialMap.set(row.colaborador_id, row.potencial as PotencialNivel);
  }

  const nineBox: ColaboradorExecutivo[] = lista.map((c) => {
    const ima = imaMap.get(c.id) ?? null;
    const potencial = potencialMap.get(c.id) ?? 'medio';
    const quadrante = calcularQuadranteNineBox(ima, potencial);
    return {
      id: c.id,
      nome: c.nome,
      funcao: c.funcao,
      departamento: c.departamento,
      ima,
      potencial,
      quadrante,
      acao: NINE_BOX_ACOES[quadrante],
      classificacao: classificarPorIma(ima),
    };
  });

  const imas = nineBox.map((c) => c.ima).filter((v): v is number => v !== null);
  const imaMedio =
    imas.length > 0 ? imas.reduce((a, b) => a + b, 0) / imas.length : null;
  const pctAlta =
    nineBox.length > 0
      ? Math.round(
          (nineBox.filter((c) => (c.ima ?? 0) >= 2.1).length / nineBox.length) * 100,
        )
      : 0;
  const pctCrit =
    nineBox.length > 0
      ? Math.round((nineBox.filter((c) => (c.ima ?? 0) < 1).length / nineBox.length) * 100)
      : 0;

  const deptMap = new Map<string, number[]>();
  for (const item of nineBox) {
    const dept = item.departamento?.trim() || 'Sem departamento';
    const arr = deptMap.get(dept) ?? [];
    if (item.ima !== null) arr.push(item.ima);
    deptMap.set(dept, arr);
  }

  const porDepartamento = [...deptMap.entries()].map(([departamento, valores]) => ({
    departamento,
    total: nineBox.filter((c) => (c.departamento?.trim() || 'Sem departamento') === departamento)
      .length,
    imaMedio:
      valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : null,
  }));

  const riscos: RiscoTurnoverItem[] = nineBox.slice(0, 30).map((c) => {
    const profile = lista.find((p) => p.id === c.id) as Profile | undefined;
    const admissao = profile?.data_admissao ? new Date(profile.data_admissao) : null;
    const anos = admissao
      ? (Date.now() - admissao.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      : null;
    const imaAtual = c.ima;
    const imaAnterior: number | null = null;
    let tendencia: RiscoTurnoverItem['tendencia'] = 'estavel';
    if (imaAtual !== null && imaAnterior !== null) {
      if (imaAtual > imaAnterior + 0.15) tendencia = 'crescente';
      else if (imaAtual < imaAnterior - 0.15) tendencia = 'decrescente';
    }
    let risco: RiscoTurnoverItem['risco'] = 'ok';
    if (imaAtual !== null && imaAtual >= 4.5) risco = 'perda';
    else if (imaAtual !== null && imaAtual < 2.5 && tendencia === 'decrescente') risco = 'turnover';
    else if (imaAtual !== null && imaAtual < 2.5) risco = 'atencao';

    return {
      id: c.id,
      nome: c.nome,
      funcao: c.funcao,
      tempoEmpresaAnos: anos !== null ? Math.round(anos * 10) / 10 : null,
      imaAtual,
      imaAnterior,
      tendencia,
      risco,
    };
  });

  const sucessao: PlanoSucessaoRow[] = (sucessaoRows.data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: row.id as string,
      posicaoChave: row.posicao_chave as string,
      titularNome: (r.titular as { nome?: string } | null)?.nome ?? null,
      sucessor1Nome: (r.s1 as { nome?: string } | null)?.nome ?? null,
      prontidaoS1: row.prontidao_s1,
      sucessor2Nome: (r.s2 as { nome?: string } | null)?.nome ?? null,
      prontidaoS2: row.prontidao_s2,
      gapIdentificado: row.gap_identificado,
      acaoDesenvolvimento: row.acao_desenvolvimento,
    };
  });

  return {
    totalColaboradores: lista.length,
    imaMedio,
    pctAltaPerformance: pctAlta,
    pctCritico: pctCrit,
    porDepartamento,
    nineBox,
    riscos,
    sucessao,
  };
}

export { SECAO_OFFSHORE_RADAR };
