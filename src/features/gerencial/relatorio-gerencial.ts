import {
  classificarPorIma,
  type ClassificacaoDesempenho,
} from '@/features/avaliacao/ima';
import type { ColaboradorRanking, GestorPreenchimentoStatus } from '@/features/gerencial/dashboard-api';

export type FaixaEquipeKey = ClassificacaoDesempenho;

export type FaixaEquipeItem = {
  key: FaixaEquipeKey;
  label: string;
  rangeLabel: string;
  count: number;
};

export type GestorCicloStatus = 'concluido' | 'em_andamento' | 'critico';

export type GestorStatusRow = {
  id: string;
  nome: string;
  departamento: string | null;
  cicloLabel: string;
  total: number;
  avaliados: number;
  pendentes: number;
  percentual: number;
  status: GestorCicloStatus;
  statusLabel: string;
  acao: string;
};

export type RankingTratativaRow = ColaboradorRanking & {
  classificacao: ClassificacaoDesempenho | null;
  classificacaoLabel: string;
  tratativa: string;
};

/** Faixas do Excel 2.5 adaptadas à escala oficial 0–3 (`classificarPorIma`). */
export const FAIXAS_EQUIPE_META: Array<{
  key: FaixaEquipeKey;
  label: string;
  rangeLabel: string;
}> = [
  { key: 'excepcional', label: 'Excepcionais', rangeLabel: '≥ 2,7' },
  { key: 'alta_performance', label: 'Alta Performance', rangeLabel: '2,1 – 2,6' },
  { key: 'atende', label: 'Atende', rangeLabel: '1,5 – 2,0' },
  { key: 'desenvolvimento', label: 'Em desenvolvimento', rangeLabel: '1,0 – 1,4' },
  { key: 'critico', label: 'Crítico', rangeLabel: '< 1,0' },
];

const CLASSIFICACAO_CURTA: Record<ClassificacaoDesempenho, string> = {
  excepcional: 'Excepcional',
  alta_performance: 'Alta performance',
  atende: 'Atende',
  desenvolvimento: 'Em desenvolvimento',
  critico: 'Crítico',
};

const TRATATIVA_CURTA: Record<ClassificacaoDesempenho, string> = {
  excepcional: 'Elegível — promoção/reajuste',
  alta_performance: 'Elegível — reajuste parcial',
  atende: 'Manter + PDI rotina',
  desenvolvimento: 'PDI urgente — 30 dias',
  critico: 'Risco — PDI crítico',
};

export function buildAnaliseGeralEquipe(ranking: ColaboradorRanking[]): FaixaEquipeItem[] {
  const counts: Record<FaixaEquipeKey, number> = {
    excepcional: 0,
    alta_performance: 0,
    atende: 0,
    desenvolvimento: 0,
    critico: 0,
  };

  for (const item of ranking) {
    const classificacao = classificarPorIma(item.media);
    if (classificacao) {
      counts[classificacao] += 1;
    }
  }

  return FAIXAS_EQUIPE_META.map((meta) => ({
    ...meta,
    count: counts[meta.key],
  }));
}

/**
 * Top / Bottom exclusivos por IMA (maior → menor).
 * - Com ≥ 2×limit pessoas: Top N e Bottom N sem overlap.
 * - Com menos pessoas: divide melhor/pior metade (sem repetir ninguém).
 */
export function splitTopBottomRankings(
  rankingDesc: ColaboradorRanking[],
  limit: number,
): { top: ColaboradorRanking[]; bottom: ColaboradorRanking[] } {
  const n = rankingDesc.length;
  if (n === 0) {
    return { top: [], bottom: [] };
  }

  const rankingAsc = [...rankingDesc].reverse();

  if (n === 1) {
    return { top: rankingDesc, bottom: [] };
  }

  const topCount =
    n >= limit * 2 ? limit : Math.min(limit, Math.max(1, Math.ceil(n / 2)));
  const bottomCount =
    n >= limit * 2 ? limit : Math.min(limit, Math.max(1, Math.floor(n / 2)));

  const top = rankingDesc.slice(0, topCount);
  const topIds = new Set(top.map((item) => item.id));
  const bottom = rankingAsc.filter((item) => !topIds.has(item.id)).slice(0, bottomCount);

  return { top, bottom };
}

export function resolveGestorCicloStatus(percentual: number): {
  status: GestorCicloStatus;
  statusLabel: string;
  acao: string;
} {
  if (percentual >= 100) {
    return {
      status: 'concluido',
      statusLabel: '100% Concluído',
      acao: 'Manter',
    };
  }

  if (percentual >= 80) {
    return {
      status: 'em_andamento',
      statusLabel: 'Em Andamento',
      acao: 'Finalizar pendentes',
    };
  }

  return {
    status: 'critico',
    statusLabel: 'Crítico',
    acao: 'Priorizar avaliações',
  };
}

export function buildStatusGestores(
  statusPreenchimento: GestorPreenchimentoStatus[],
): GestorStatusRow[] {
  return statusPreenchimento.map((gestor) => {
    const avaliados = Math.max(gestor.total - gestor.pendentes, 0);
    const percentual =
      gestor.total > 0 ? Math.round((avaliados / gestor.total) * 1000) / 10 : 0;
    const resolved = resolveGestorCicloStatus(percentual);

    return {
      id: gestor.id,
      nome: gestor.nome,
      departamento: gestor.departamento,
      cicloLabel: gestor.cicloLabel,
      total: gestor.total,
      avaliados,
      pendentes: gestor.pendentes,
      percentual,
      ...resolved,
    };
  });
}

export function buildResumoCiclo(statusPreenchimento: GestorPreenchimentoStatus[]): {
  totalEscopo: number;
  concluidas: number;
  pendentes: number;
  percentualConclusao: number;
} {
  const totalEscopo = statusPreenchimento.reduce((sum, item) => sum + item.total, 0);
  const pendentes = statusPreenchimento.reduce((sum, item) => sum + item.pendentes, 0);
  const concluidas = Math.max(totalEscopo - pendentes, 0);
  const percentualConclusao =
    totalEscopo > 0 ? Math.round((concluidas / totalEscopo) * 1000) / 10 : 0;

  return { totalEscopo, concluidas, pendentes, percentualConclusao };
}

export type ResumoExecutivo = {
  totalFuncionarios: number;
  concluidas: number;
  pendentes: number;
  percentualConclusao: number;
  fonte: 'ciclo' | 'ima';
  fonteLabel: string;
};

/**
 * Preferência: preenchimento do ciclo por gestor.
 * Fallback: cobertura de colaboradores com IMA (quando não há gestores no ciclo).
 */
export function buildResumoExecutivo(params: {
  totalColaboradores: number;
  rankingCompleto: ColaboradorRanking[];
  statusPreenchimento: GestorPreenchimentoStatus[];
}): ResumoExecutivo {
  const ciclo = buildResumoCiclo(params.statusPreenchimento);

  if (ciclo.totalEscopo > 0) {
    return {
      totalFuncionarios: params.totalColaboradores,
      concluidas: ciclo.concluidas,
      pendentes: ciclo.pendentes,
      percentualConclusao: ciclo.percentualConclusao,
      fonte: 'ciclo',
      fonteLabel: 'Com base no ciclo atual (quinzena/semestre) por gestor.',
    };
  }

  const comIma = params.rankingCompleto.length;
  const semIma = Math.max(params.totalColaboradores - comIma, 0);
  const percentual =
    params.totalColaboradores > 0
      ? Math.round((comIma / params.totalColaboradores) * 1000) / 10
      : 0;

  return {
    totalFuncionarios: params.totalColaboradores,
    concluidas: comIma,
    pendentes: semIma,
    percentualConclusao: percentual,
    fonte: 'ima',
    fonteLabel:
      'Sem gestores no ciclo — KPIs usam cobertura de IMA (colaboradores com notas aprovadas).',
  };
}

export function buildRankingComTratativa(
  items: ColaboradorRanking[],
): RankingTratativaRow[] {
  return items.map((item) => {
    const classificacao = classificarPorIma(item.media);
    return {
      ...item,
      classificacao,
      classificacaoLabel: classificacao
        ? CLASSIFICACAO_CURTA[classificacao]
        : 'Sem classificação',
      tratativa: classificacao
        ? TRATATIVA_CURTA[classificacao]
        : 'Sem tratativa',
    };
  });
}

export function faixaTone(
  key: FaixaEquipeKey,
): 'success' | 'accent' | 'info' | 'warning' | 'danger' {
  switch (key) {
    case 'excepcional':
      return 'success';
    case 'alta_performance':
      return 'accent';
    case 'atende':
      return 'info';
    case 'desenvolvimento':
      return 'warning';
    case 'critico':
      return 'danger';
  }
}

export function gestorStatusTone(
  status: GestorCicloStatus,
): 'success' | 'warning' | 'danger' {
  if (status === 'concluido') return 'success';
  if (status === 'em_andamento') return 'warning';
  return 'danger';
}
