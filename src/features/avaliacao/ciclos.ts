import type { TipoAvaliacao, UserRole } from '@/types/supabase';

export const SECAO_PERGUNTAS_UNIVERSAIS = 'UNIVERSAL';

export function getQuinzenaStartDate(referenceDate = new Date()): string {
  const day = referenceDate.getDate();
  const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), day <= 15 ? 1 : 16);

  return start.toISOString().slice(0, 10);
}

export function getSemestreStartDate(referenceDate = new Date()): string {
  const startMonth = referenceDate.getMonth() < 6 ? 0 : 6;
  const start = new Date(referenceDate.getFullYear(), startMonth, 1);

  return start.toISOString().slice(0, 10);
}

export function resolveTipoAvaliacaoPorRole(role: UserRole | null | undefined): TipoAvaliacao {
  if (role === 'gestor' || role === 'gerente') {
    return 'semestral';
  }

  return 'quinzenal';
}

export function getCicloInicioPorTipo(tipo: TipoAvaliacao, referenceDate = new Date()): string {
  return tipo === 'semestral' ? getSemestreStartDate(referenceDate) : getQuinzenaStartDate(referenceDate);
}

export const TIPO_AVALIACAO_LABELS: Record<TipoAvaliacao, string> = {
  quinzenal: 'Quinzenal — Avaliação de Bordo',
  semestral: 'Semestral — Avaliação de Gestores',
};

export const NOTA_ESCALA_LEGENDA: Record<number, string> = {
  0: 'Insuficiente — não atende aos requisitos básicos',
  1: 'Regular — atende parcialmente; precisa de desenvolvimento',
  2: 'Bom — atende totalmente aos padrões da empresa',
  3: 'Excelente — supera expectativas; referência',
};
