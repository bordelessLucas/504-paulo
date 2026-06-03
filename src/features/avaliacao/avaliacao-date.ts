/** Nome da coluna de data em `avaliacoes` (banco remoto usa `created_at`). */
export const AVALIACAO_DATA_COLUMN = 'created_at' as const;

export type AvaliacaoComData = {
  created_at: string;
};

export function getAvaliacaoDataIso(avaliacao: AvaliacaoComData): string {
  return avaliacao.created_at;
}

export function getAvaliacaoDataDate(avaliacao: AvaliacaoComData): string {
  return avaliacao.created_at.slice(0, 10);
}
