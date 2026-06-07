export const MEDIA_MINIMA_REAJUSTE = 2.0;

export const MENSAGEM_INELEGIVEL_REAJUSTE =
  'Colaborador inelegível para reajuste devido à média de performance (Abaixo de 2.0)';

export function isElegivelParaReajuste(media: number | null, totalRespostas: number): boolean {
  if (totalRespostas === 0 || media === null) {
    return false;
  }

  return media >= MEDIA_MINIMA_REAJUSTE;
}
