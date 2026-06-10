export const PERGUNTAS_UNIVERSAIS_RADAR = [
  { codigo: 'P1', label: 'Técnica e Prazos' },
  { codigo: 'P2', label: 'Segurança e SMS' },
  { codigo: 'P3', label: 'Postura e Convivência' },
] as const;

export const CODIGOS_PERGUNTAS_UNIVERSAIS = PERGUNTAS_UNIVERSAIS_RADAR.map((item) => item.codigo);
