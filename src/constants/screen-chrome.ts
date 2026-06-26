import { SCREEN_TOP_BAR_HEIGHT } from '@/constants/layout';

/** Altura total da faixa superior: safe area + barra de ações. */
export function getScreenTopChromeHeight(topInset: number) {
  return topInset + SCREEN_TOP_BAR_HEIGHT;
}
