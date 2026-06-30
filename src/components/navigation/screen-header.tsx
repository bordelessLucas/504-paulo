import { StyleSheet, View, type ViewProps } from 'react-native';

import { Fonts, layout } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type ScreenHeaderProps = ViewProps & {
  title: string;
  description?: string;
  accessory?: React.ReactNode;
  /** `compact` omite descrição longa e reduz espaçamento. */
  variant?: 'default' | 'compact';
};

export function ScreenHeader({
  title,
  description,
  accessory,
  variant = 'compact',
  style,
  ...rest
}: ScreenHeaderProps) {
  const theme = useTheme();
  const showDescription = variant === 'default' && description;

  return (
    <View style={[styles.header, variant === 'compact' && styles.headerCompact, style]} {...rest}>
      <View style={styles.textBlock}>
        <ThemedText
          style={[
            variant === 'compact' ? styles.titleCompact : styles.title,
            { color: theme.accent, fontFamily: Fonts.display },
          ]}>
          {title}
        </ThemedText>
        {showDescription ? (
          <ThemedText themeColor="textSecondary" style={styles.description}>
            {description}
          </ThemedText>
        ) : null}
      </View>
      {accessory}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: layout.space.sm,
    marginBottom: layout.space.lg,
  },
  headerCompact: {
    marginBottom: layout.space.sm,
  },
  textBlock: {
    gap: layout.space.xs,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
    fontWeight: '800',
  },
  titleCompact: {
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.3,
    fontWeight: '800',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});
