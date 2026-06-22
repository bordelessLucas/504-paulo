import {
  SECAO_OFFSHORE_PESOS,
  SECOES_OFFSHORE,
  type SecaoOffshore,
} from '@/features/avaliacao/secoes-offshore';

export type MediasPorSecao = Partial<Record<SecaoOffshore, number>>;

const PESO_TOTAL_IMA = SECOES_OFFSHORE.reduce(
  (sum, secao) => sum + SECAO_OFFSHORE_PESOS[secao],
  0,
);

/**
 * IMA = (GO×3 + SB×3 + LG + PE + PR + MA + TR + SM + RH + FA + PG + IN) / 16
 * Seções sem nota são ignoradas; o denominador usa apenas seções preenchidas.
 */
export function calcularImaPonderado(mediasPorSecao: MediasPorSecao): number | null {
  let somaPonderada = 0;
  let pesoUsado = 0;

  for (const secao of SECOES_OFFSHORE) {
    const media = mediasPorSecao[secao];
    if (typeof media !== 'number' || Number.isNaN(media)) {
      continue;
    }
    const peso = SECAO_OFFSHORE_PESOS[secao];
    somaPonderada += media * peso;
    pesoUsado += peso;
  }

  if (pesoUsado === 0) {
    return null;
  }

  return somaPonderada / pesoUsado;
}

/** IMA completo quando todas as 12 seções estão preenchidas. */
export function calcularImaCompleto(mediasPorSecao: MediasPorSecao): number | null {
  let somaPonderada = 0;

  for (const secao of SECOES_OFFSHORE) {
    const media = mediasPorSecao[secao];
    if (typeof media !== 'number' || Number.isNaN(media)) {
      return null;
    }
    somaPonderada += media * SECAO_OFFSHORE_PESOS[secao];
  }

  return somaPonderada / PESO_TOTAL_IMA;
}

export type ClassificacaoDesempenho =
  | 'excepcional'
  | 'alta_performance'
  | 'atende'
  | 'desenvolvimento'
  | 'critico';

export const CLASSIFICACAO_DESEMPENHO_LABELS: Record<ClassificacaoDesempenho, string> = {
  excepcional: 'Excepcional (Top Performer)',
  alta_performance: 'Alta Performance',
  atende: 'Atende às Expectativas',
  desenvolvimento: 'Em Desenvolvimento',
  critico: 'Risco Operacional / Crítico',
};

export function classificarPorIma(ima: number | null): ClassificacaoDesempenho | null {
  if (ima === null || Number.isNaN(ima)) {
    return null;
  }
  if (ima >= 2.7) return 'excepcional';
  if (ima >= 2.1) return 'alta_performance';
  if (ima >= 1.5) return 'atende';
  if (ima >= 1.0) return 'desenvolvimento';
  return 'critico';
}

export function classificarPorNota(nota: number): ClassificacaoDesempenho {
  if (nota >= 3) return 'excepcional';
  if (nota >= 2) return 'atende';
  if (nota >= 1) return 'desenvolvimento';
  return 'critico';
}

export function buildMediasPorSecaoFromCodigos(
  notasPorCodigo: Map<string, number[]>,
): MediasPorSecao {
  const medias: MediasPorSecao = {};

  for (const secao of SECOES_OFFSHORE) {
    const notasSecao: number[] = [];
    for (let i = 1; i <= 3; i += 1) {
      const codigo = `${secao}${i}`;
      const notas = notasPorCodigo.get(codigo) ?? [];
      notasSecao.push(...notas);
    }
    if (notasSecao.length > 0) {
      medias[secao] = notasSecao.reduce((a, b) => a + b, 0) / notasSecao.length;
    }
  }

  return medias;
}
