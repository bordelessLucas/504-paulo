import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, layout } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type StructuredRowProps = {
  leading?: ReactNode;
  title: string;
  description?: string;
  trailing?: ReactNode;
};

export function StructuredRow({ leading, title, description, trailing }: StructuredRowProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: theme.surfaceCard,
          borderColor: theme.border,
        },
      ]}>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.content}>
        <ThemedText type="smallBold">{title}</ThemedText>
        {description ? (
          <ThemedText themeColor="textSecondary" type="small" style={styles.description}>
            {description}
          </ThemedText>
        ) : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.space.md,
    paddingHorizontal: layout.space.lg,
    paddingVertical: layout.space.md,
    borderRadius: layout.radius.sm,
    borderWidth: 1,
  },
  leading: {
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: layout.space.xs,
  },
  description: {
    fontFamily: Fonts.sans,
  },
  trailing: {
    flexShrink: 0,
  },
});
