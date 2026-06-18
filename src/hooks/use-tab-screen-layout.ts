import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  TAB_BAR_BASE_HEIGHT,
  TAB_CONTENT_EXTRA_PADDING,
  TAB_FOOTER_EXTRA_PADDING,
} from '@/constants/layout';
import { useNavigationLayout } from '@/navigation/navigation-layout-context';

export function useTabScreenLayout() {
  const insets = useSafeAreaInsets();
  const { hasBottomTabs } = useNavigationLayout();

  const tabBarHeight = hasBottomTabs ? TAB_BAR_BASE_HEIGHT + insets.bottom : 0;
  const scrollPaddingBottom = TAB_CONTENT_EXTRA_PADDING;
  const footerPaddingBottom = TAB_FOOTER_EXTRA_PADDING;
  const toastBottomOffset = hasBottomTabs
    ? tabBarHeight + TAB_FOOTER_EXTRA_PADDING
    : TAB_FOOTER_EXTRA_PADDING + insets.bottom;

  return {
    topInset: insets.top,
    bottomInset: insets.bottom,
    tabBarHeight,
    scrollPaddingBottom,
    footerPaddingBottom,
    toastBottomOffset,
  };
}
