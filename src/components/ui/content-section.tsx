import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, layout } from '@/constants/theme';

type ContentSectionProps = {
  eyebrow?: string;
  title: string;
  children: ReactNode;
};

export function ContentSection({ eyebrow, title, children }: ContentSectionProps) {
  return (
    <View style={styles.section}>
      {eyebrow ? (
        <ThemedText themeColor="textMuted" style={styles.eyebrow}>
          {eyebrow.toUpperCase()}
        </ThemedText>
      ) : null}
      <ThemedText type="sectionTitle">{title}</ThemedText>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: layout.space.md,
  },
  eyebrow: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
  },
  body: {
    gap: layout.space.sm,
  },
});
