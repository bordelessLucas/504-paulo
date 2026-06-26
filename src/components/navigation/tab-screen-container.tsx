import type { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type RefreshControlProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { SCREEN_CONTENT_TOP_OFFSET, SCREEN_PADDING_HORIZONTAL } from '@/constants/layout';
import { layout } from '@/constants/theme';
import { useIsDesktopLayout } from '@/hooks/use-is-desktop-layout';
import { useListContentStyle } from '@/lib/layoutPadding';
import { useTabScreenLayout } from '@/hooks/use-tab-screen-layout';
import { ThemedView } from '@/components/themed-view';

type TabScreenContainerProps = {
  children: ReactNode;
  edges?: Edge[];
  scrollable?: boolean;
  keyboardShouldPersistTaps?: 'handled' | 'always' | 'never';
  contentContainerStyle?: StyleProp<ViewStyle>;
  maxContentWidth?: number;
  withHorizontalPadding?: boolean;
  /** @deprecated Barra superior global já reserva o espaço; mantido por compatibilidade. */
  reserveHeaderActions?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
};

export function TabScreenContainer({
  children,
  edges = ['top'],
  scrollable = false,
  keyboardShouldPersistTaps = 'handled',
  contentContainerStyle,
  maxContentWidth,
  withHorizontalPadding = true,
  refreshControl,
}: TabScreenContainerProps) {
  const { scrollPaddingBottom } = useTabScreenLayout();
  const isDesktopLayout = useIsDesktopLayout();
  const listInsets = useListContentStyle({ safeTop: !isDesktopLayout, withTabBar: false });

  const horizontalInsets = withHorizontalPadding
    ? {
        paddingHorizontal: SCREEN_PADDING_HORIZONTAL,
        paddingTop: isDesktopLayout ? layout.space.lg : listInsets.paddingTop ?? SCREEN_CONTENT_TOP_OFFSET,
      }
    : null;

  const paddedContentStyle = [
    horizontalInsets,
    { paddingBottom: scrollPaddingBottom },
    maxContentWidth != null && maxContentWidth > 0
      ? { maxWidth: maxContentWidth, alignSelf: 'center' as const, flex: 1 }
      : styles.fullWidth,
    contentContainerStyle,
  ];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={edges}>
        {scrollable ? (
          <ScrollView
            contentContainerStyle={[styles.scrollGrow, paddedContentStyle]}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
            refreshControl={refreshControl}
            showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.fill, paddedContentStyle]}>{children}</View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  scrollGrow: {
    flexGrow: 1,
  },
  fullWidth: {
    width: '100%' as const,
    alignSelf: 'stretch' as const,
  },
});

/** Alias semântico alinhado ao guia VERTEK. */
export const ScreenLayout = TabScreenContainer;
