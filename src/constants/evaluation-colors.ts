import type { SemanticTone } from '@/constants/theme';
import type { ClassificacaoDesempenho } from '@/features/avaliacao/ima';
import { NOTA_ESCALA_LEGENDA } from '@/features/avaliacao/ciclos';
import { ALLOWED_SCORES } from '@/features/avaliacao/validation';

export type AllowedScore = (typeof ALLOWED_SCORES)[number];

export const SCORE_TONES: Record<AllowedScore, SemanticTone> = {
  0: 'danger',
  1: 'warning',
  2: 'info',
  3: 'success',
};

export const CLASSIFICACAO_TONES: Record<ClassificacaoDesempenho, SemanticTone> = {
  excepcional: 'success',
  alta_performance: 'accent',
  atende: 'info',
  desenvolvimento: 'warning',
  critico: 'danger',
};

export const CLASSIFICACAO_SHORT_LABELS: Record<ClassificacaoDesempenho, string> = {
  excepcional: 'Excepcional',
  alta_performance: 'Alta',
  atende: 'Atende',
  desenvolvimento: 'PDI',
  critico: 'Crítico',
};
export const CLASSIFICACAO_THRESHOLDS: Record<ClassificacaoDesempenho, string> = {
  excepcional: 'IMA ≥ 2,7',
  alta_performance: 'IMA ≥ 2,1',
  atende: 'IMA ≥ 1,5',
  desenvolvimento: 'IMA ≥ 1,0',
  critico: 'IMA < 1,0',
};

export function parseNotaLegenda(nota: AllowedScore): { label: string; description: string } {
  const full = NOTA_ESCALA_LEGENDA[nota];
  const separator = ' — ';
  const index = full.indexOf(separator);

  if (index === -1) {
    return { label: full, description: '' };
  }

  return {
    label: full.slice(0, index),
    description: full.slice(index + separator.length),
  };
}

export function getPesoTone(peso: number): SemanticTone {
  if (peso >= 3) return 'danger';
  if (peso >= 2) return 'warning';
  return 'neutral';
}
