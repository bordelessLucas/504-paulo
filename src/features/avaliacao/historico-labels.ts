import type { StatusValidacaoEnum, TipoAvaliacao } from '@/types/supabase';

export const STATUS_VALIDACAO_LABELS: Record<StatusValidacaoEnum, string> = {
  pendente_rh: 'Aguardando RH',
  pendente_ceo: 'Aguardando CEO',
  aprovada: 'Aprovada',
  recusada: 'Recusada',
  devolvida: 'Devolvida',
};

export const STATUS_VALIDACAO_SHORT: Record<StatusValidacaoEnum, string> = {
  pendente_rh: 'RH',
  pendente_ceo: 'CEO',
  aprovada: 'OK',
  recusada: 'Recusada',
  devolvida: 'Devolvida',
};

export const TIPO_AVALIACAO_FILTRO: readonly (TipoAvaliacao | 'todas')[] = [
  'todas',
  'quinzenal',
  'semestral',
  'anual',
] as const;

export type TipoAvaliacaoFiltro = (typeof TIPO_AVALIACAO_FILTRO)[number];

export const TIPO_AVALIACAO_FILTRO_LABELS: Record<TipoAvaliacaoFiltro, string> = {
  todas: 'Todas',
  quinzenal: 'Quinzenal',
  semestral: 'Semestral',
  anual: 'Anual',
};
