import {
  CLASSIFICACAO_DESEMPENHO_LABELS,
  classificarPorIma,
  type ClassificacaoDesempenho,
} from '@/features/avaliacao/ima';

/** Percentuais sugeridos alinhados à análise anual do Excel (Rev Jul 2026). */
const PERCENTUAL_POR_CLASSIFICACAO: Record<ClassificacaoDesempenho, number | null> = {
  excepcional: 0.33,
  alta_performance: 0.2,
  atende: null,
  desenvolvimento: null,
  critico: null,
};

const RECOMENDACAO_POR_CLASSIFICACAO: Record<ClassificacaoDesempenho, string> = {
  excepcional: 'ELEGÍVEL — promoção / reajuste / bonificação',
  alta_performance: 'ELEGÍVEL — reajuste parcial ou bonificação',
  atende: 'MANTER + PDI de rotina',
  desenvolvimento: 'PDI URGENTE — 30 dias',
  critico: 'RISCO OPERACIONAL — bloquear reajuste e abrir PDI crítico',
};

export type AnaliseReajusteSugerida = {
  classificacao: ClassificacaoDesempenho | null;
  classificacaoLabel: string | null;
  percentualSugerido: number | null;
  novoSalario: number | null;
  recomendacao: string;
};

export function calcularAnaliseReajuste(
  ima: number | null,
  salarioBase: number | null,
): AnaliseReajusteSugerida {
  const classificacao = classificarPorIma(ima);
  const classificacaoLabel = classificacao
    ? CLASSIFICACAO_DESEMPENHO_LABELS[classificacao]
    : null;
  const percentualSugerido = classificacao
    ? PERCENTUAL_POR_CLASSIFICACAO[classificacao]
    : null;

  const novoSalario =
    salarioBase != null && percentualSugerido != null
      ? Number((salarioBase * (1 + percentualSugerido)).toFixed(2))
      : null;

  const recomendacao = classificacao
    ? RECOMENDACAO_POR_CLASSIFICACAO[classificacao]
    : 'Sem IMA suficiente para recomendar';

  return {
    classificacao,
    classificacaoLabel,
    percentualSugerido,
    novoSalario,
    recomendacao,
  };
}

export function formatPercentualReajuste(value: number | null): string {
  if (value == null) {
    return '—';
  }

  return `${(value * 100).toFixed(0)}%`;
}

export function formatMoedaBrl(value: number | null): string {
  if (value == null) {
    return '—';
  }

  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  });
}
