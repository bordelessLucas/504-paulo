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

import { ThemedView } from '@/components/themed-view';
import {
  SCREEN_PADDING_LEFT,
  SCREEN_PADDING_RIGHT,
} from '@/constants/layout';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useIsDesktopLayout } from '@/hooks/use-is-desktop-layout';
import { useTabScreenLayout } from '@/hooks/use-tab-screen-layout';

type TabScreenContainerProps = {
  children: ReactNode;
  edges?: Edge[];
  scrollable?: boolean;
  keyboardShouldPersistTaps?: 'handled' | 'always' | 'never';
  contentContainerStyle?: StyleProp<ViewStyle>;
  maxContentWidth?: number;
  withHorizontalPadding?: boolean;
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
  reserveHeaderActions = true,
  refreshControl,
}: TabScreenContainerProps) {
  const { scrollPaddingBottom } = useTabScreenLayout();
  const isDesktopLayout = useIsDesktopLayout();
  const resolvedMaxWidth =
    maxContentWidth ?? (isDesktopLayout ? 0 : MaxContentWidth + 360);

  const horizontalInsets = withHorizontalPadding
    ? {
        paddingLeft: SCREEN_PADDING_LEFT,
        paddingRight: reserveHeaderActions ? SCREEN_PADDING_RIGHT : SCREEN_PADDING_LEFT,
        paddingTop: Spacing.four,
      }
    : null;

  const paddedContentStyle = [
    horizontalInsets,
    scrollable && { paddingBottom: scrollPaddingBottom },
    !scrollable && { paddingBottom: scrollPaddingBottom },
    resolvedMaxWidth > 0 && styles.centeredContent,
    resolvedMaxWidth > 0 && { maxWidth: resolvedMaxWidth },
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
  centeredContent: {
    width: '100%',
    alignSelf: 'center',
  },
});
