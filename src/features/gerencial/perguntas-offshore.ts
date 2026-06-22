import { SECAO_OFFSHORE_RADAR } from '@/features/avaliacao/secoes-offshore';

/** Radar 12 eixos offshore (substitui P1/P2/P3 quando seed offshore ativo). */
export const PERGUNTAS_OFFSHORE_RADAR = SECAO_OFFSHORE_RADAR.map((item) => ({
  codigo: item.codigo,
  label: item.label,
}));

export const CODIGOS_SECOES_OFFSHORE = PERGUNTAS_OFFSHORE_RADAR.map((item) => item.codigo);

/** @deprecated Mantido para retrocompatibilidade */
export const PERGUNTAS_UNIVERSAIS_RADAR = [
  { codigo: 'P1', label: 'Técnica e Prazos' },
  { codigo: 'P2', label: 'Segurança e SMS' },
  { codigo: 'P3', label: 'Postura e Convivência' },
] as const;

export const CODIGOS_PERGUNTAS_UNIVERSAIS = PERGUNTAS_UNIVERSAIS_RADAR.map((item) => item.codigo);
