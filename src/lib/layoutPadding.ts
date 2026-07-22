import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { StyleProp, ViewStyle } from "react-native";

import {
  DESKTOP_CONTENT_PADDING_HORIZONTAL,
  DESKTOP_CONTENT_PADDING_TOP,
  SCREEN_CONTENT_TOP_OFFSET,
  SCREEN_PADDING_HORIZONTAL,
  TAB_BAR_BASE_HEIGHT,
  TAB_CONTENT_EXTRA_PADDING,
} from "@/constants/layout";
import { layout } from "@/constants/theme";
import { useIsDesktopLayout } from "@/hooks/use-is-desktop-layout";
import { useNavigationLayout } from "@/navigation/navigation-layout-context";

const FLOATING_TAB_BAR = {
  height: 58,
  marginBottom: 14,
  sideMargin: 18,
  extraClearance: 12,
} as const;

export function useTabBarHeight() {
  const insets = useSafeAreaInsets();
  const { hasBottomTabs } = useNavigationLayout();

  if (!hasBottomTabs) {
    return insets.bottom + layout.space.md;
  }

  return TAB_BAR_BASE_HEIGHT + insets.bottom;
}

type ListContentStyleOptions = {
  withTabBar?: boolean;
  withFab?: boolean;
  safeTop?: boolean;
};

export function useListContentStyle(options: ListContentStyleOptions = {}) {
  const insets = useSafeAreaInsets();
  const isDesktop = useIsDesktopLayout();
  const tabBarHeight = useTabBarHeight();
  const { hasBottomTabs } = useNavigationLayout();

  const withTabBar = options.withTabBar ?? hasBottomTabs;
  const withFab = options.withFab ?? false;
  const safeTop = options.safeTop ?? !isDesktop;

  const paddingBottom =
    (withTabBar ? tabBarHeight : TAB_CONTENT_EXTRA_PADDING + insets.bottom) +
    (withFab ? layout.space.xxl : 0);

  const paddingTop = safeTop
    ? SCREEN_CONTENT_TOP_OFFSET
    : isDesktop
      ? DESKTOP_CONTENT_PADDING_TOP
      : layout.space.lg;

  return {
    paddingHorizontal: isDesktop
      ? DESKTOP_CONTENT_PADDING_HORIZONTAL
      : SCREEN_PADDING_HORIZONTAL,
    paddingTop,
    paddingBottom,
  } satisfies StyleProp<ViewStyle>;
}

export function useFabBottom(withTabBar = true) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();

  if (!withTabBar) {
    return insets.bottom + layout.space.lg;
  }

  return TAB_BAR_BASE_HEIGHT + insets.bottom - layout.space.sm;
}

/** @deprecated Use useTabBarHeight — mantém compatibilidade com tab bar clássica */
export function useClassicTabBarHeight() {
  const insets = useSafeAreaInsets();
  const { hasBottomTabs } = useNavigationLayout();
  return hasBottomTabs ? TAB_BAR_BASE_HEIGHT + insets.bottom : 0;
}
