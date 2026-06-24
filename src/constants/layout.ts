import { Spacing } from '@/constants/theme';

/** Espaço reservado à direita para o sino de notificações flutuante (44px + folga). */
export const HEADER_ACTIONS_CLEARANCE = 48;

/** Padding horizontal padrão das telas (esquerda). */
export const SCREEN_PADDING_LEFT = Spacing.four;

/** Padding horizontal padrão das telas (direita, com folga para o sino). */
export const SCREEN_PADDING_RIGHT = Spacing.four + HEADER_ACTIONS_CLEARANCE;

/** Altura base dos ícones + label da tab bar (sem home indicator). */
export const TAB_BAR_BASE_HEIGHT = 56;

/** Folga extra entre o fim do conteúdo rolável e a borda inferior da tela. */
export const TAB_CONTENT_EXTRA_PADDING = Spacing.four;

/** Folga para footers fixos acima da borda inferior da área útil. */
export const TAB_FOOTER_EXTRA_PADDING = Spacing.three;

/** Largura mínima para painéis master-detail (lista + detalhe lado a lado). */
export const SPLIT_LAYOUT_MIN_WIDTH = 768;

/** Largura da sidebar fixa no layout desktop. */
export const DESKTOP_SIDEBAR_WIDTH = 260;

/** Insets padrão de conteúdo de tela (mobile com sino global). */
export function getScreenContentInsets(options?: { top?: number; bottom?: number }) {
  return {
    paddingLeft: SCREEN_PADDING_LEFT,
    paddingRight: SCREEN_PADDING_RIGHT,
    paddingTop: options?.top ?? Spacing.four,
    paddingBottom: options?.bottom,
  };
}
