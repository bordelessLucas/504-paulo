import { Spacing } from '@/constants/theme';

/** Altura da faixa superior (menu + notificações), abaixo do safe area. */
export const SCREEN_TOP_BAR_HEIGHT = 48;

/** Padding horizontal padrão das telas. */
export const SCREEN_PADDING_HORIZONTAL = Spacing.three;

/** @deprecated Use SCREEN_PADDING_HORIZONTAL */
export const SCREEN_PADDING_LEFT = SCREEN_PADDING_HORIZONTAL;

/** @deprecated Use SCREEN_PADDING_HORIZONTAL */
export const SCREEN_PADDING_RIGHT = SCREEN_PADDING_HORIZONTAL;

/** Folga no topo do conteúdo para não sobrepor a barra menu + notificações (mobile). */
export const SCREEN_CONTENT_TOP_OFFSET = SCREEN_TOP_BAR_HEIGHT + Spacing.two;

/** Altura base dos ícones + label da tab bar (sem home indicator). */
export const TAB_BAR_BASE_HEIGHT = 56;

/** Folga extra entre o fim do conteúdo rolável e a borda inferior da tela. */
export const TAB_CONTENT_EXTRA_PADDING = Spacing.four;

/** Folga para footers fixos acima da borda inferior da área útil. */
export const TAB_FOOTER_EXTRA_PADDING = Spacing.three;

/** Largura mínima para painéis master-detail (lista + detalhe lado a lado). */
export const SPLIT_LAYOUT_MIN_WIDTH = 768;

/** Largura da sidebar fixa no layout desktop. */
export const DESKTOP_SIDEBAR_WIDTH = 272;

/** Largura do drawer deslizante no mobile. */
export const MOBILE_DRAWER_WIDTH = 300;

/** Insets padrão de conteúdo de tela em mobile. */
export function getScreenContentInsets(options?: { top?: number; bottom?: number }) {
  return {
    paddingLeft: SCREEN_PADDING_HORIZONTAL,
    paddingRight: SCREEN_PADDING_HORIZONTAL,
    paddingTop: options?.top ?? SCREEN_CONTENT_TOP_OFFSET,
    paddingBottom: options?.bottom,
  };
}
