import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  TAB_BAR_BASE_HEIGHT,
  TAB_CONTENT_EXTRA_PADDING,
  TAB_FOOTER_EXTRA_PADDING,
} from '@/constants/layout';

export function useTabScreenLayout() {
  const insets = useSafeAreaInsets();
  const measuredTabBarHeight = useBottomTabBarHeight();

  const tabBarHeight =
    measuredTabBarHeight > 0
      ? measuredTabBarHeight
      : TAB_BAR_BASE_HEIGHT + insets.bottom;

  // O conteúdo das tabs já é renderizado acima da tab bar; aqui só adicionamos folga visual.
  const scrollPaddingBottom = TAB_CONTENT_EXTRA_PADDING;
  const footerPaddingBottom = TAB_FOOTER_EXTRA_PADDING;
  // Toast fica fora do tab navigator e precisa compensar a altura real da barra.
  const toastBottomOffset = tabBarHeight + TAB_FOOTER_EXTRA_PADDING;

  return {
    topInset: insets.top,
    bottomInset: insets.bottom,
    tabBarHeight,
    scrollPaddingBottom,
    footerPaddingBottom,
    toastBottomOffset,
  };
}
