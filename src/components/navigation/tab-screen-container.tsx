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
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTabScreenLayout } from '@/hooks/use-tab-screen-layout';

type TabScreenContainerProps = {
  children: ReactNode;
  edges?: Edge[];
  scrollable?: boolean;
  keyboardShouldPersistTaps?: 'handled' | 'always' | 'never';
  contentContainerStyle?: StyleProp<ViewStyle>;
  maxContentWidth?: number;
  withHorizontalPadding?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
};

export function TabScreenContainer({
  children,
  edges = ['top'],
  scrollable = false,
  keyboardShouldPersistTaps = 'handled',
  contentContainerStyle,
  maxContentWidth = MaxContentWidth + 360,
  withHorizontalPadding = true,
  refreshControl,
}: TabScreenContainerProps) {
  const { scrollPaddingBottom } = useTabScreenLayout();

  const paddedContentStyle = [
    withHorizontalPadding && styles.horizontalPadding,
    scrollable && { paddingBottom: scrollPaddingBottom },
    maxContentWidth > 0 && styles.centeredContent,
    maxContentWidth > 0 && { maxWidth: maxContentWidth },
    contentContainerStyle,
  ];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={edges}>
        {scrollable ? (
          <ScrollView
            contentContainerStyle={paddedContentStyle}
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
  horizontalPadding: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  centeredContent: {
    width: '100%',
    alignSelf: 'center',
  },
});
