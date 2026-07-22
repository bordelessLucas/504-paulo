import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type RefreshControlProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import {
  DESKTOP_CONTENT_MAX_WIDTH,
  DESKTOP_CONTENT_PADDING_HORIZONTAL,
  DESKTOP_CONTENT_PADDING_TOP,
  SCREEN_CONTENT_TOP_OFFSET,
  SCREEN_PADDING_HORIZONTAL,
} from '@/constants/layout';
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
  /**
   * Largura máxima do conteúdo.
   * No desktop, o padrão é DESKTOP_CONTENT_MAX_WIDTH.
   * Passe `0` para ocupar toda a largura disponível.
   */
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
  const listInsets = useListContentStyle({ safeTop: !isDesktopLayout });

  const resolvedMaxWidth =
    maxContentWidth !== undefined
      ? maxContentWidth
      : isDesktopLayout
        ? DESKTOP_CONTENT_MAX_WIDTH
        : undefined;

  const horizontalInsets = withHorizontalPadding
    ? {
        paddingHorizontal: isDesktopLayout
          ? DESKTOP_CONTENT_PADDING_HORIZONTAL
          : SCREEN_PADDING_HORIZONTAL,
        paddingTop: isDesktopLayout
          ? DESKTOP_CONTENT_PADDING_TOP
          : (listInsets.paddingTop ?? SCREEN_CONTENT_TOP_OFFSET),
      }
    : null;

  const widthConstraint =
    resolvedMaxWidth != null && resolvedMaxWidth > 0
      ? {
          maxWidth: resolvedMaxWidth,
          width: '100%' as const,
          alignSelf: 'center' as const,
          ...(!scrollable ? { flex: 1 } : null),
        }
      : styles.fullWidth;

  const paddedContentStyle = [
    horizontalInsets,
    { paddingBottom: scrollPaddingBottom },
    widthConstraint,
    contentContainerStyle,
  ];

  const content = scrollable ? (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={[styles.scrollGrow, paddedContentStyle]}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.fill, paddedContentStyle]}>{children}</View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={edges}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.fill}>
          {content}
        </KeyboardAvoidingView>
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
