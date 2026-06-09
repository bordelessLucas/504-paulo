import { StyleSheet, View } from 'react-native';

import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenShellProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function ScreenShell({ title, description, children }: ScreenShellProps) {
  const theme = useTheme();

  return (
    <TabScreenContainer maxContentWidth={MaxContentWidth + 360}>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="heading">{title}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.description}>
            {description}
          </ThemedText>
        </View>

        {children ? (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            ]}>
            {children}
          </View>
        ) : null}
      </View>
    </TabScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.two,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.two,
  },
});
