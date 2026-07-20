import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FormSectionProps = {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  embedded?: boolean;
};

export function FormSection({
  title,
  children,
  defaultExpanded = true,
  embedded = false,
}: FormSectionProps) {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <View
      style={[
        embedded ? styles.sectionEmbedded : styles.section,
        {
          backgroundColor: theme.surfaceCard,
          borderColor: theme.border,
        },
      ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        onPress={() => setIsExpanded((current) => !current)}
        style={[
          styles.header,
          embedded
            ? { borderBottomColor: theme.border }
            : { borderBottomColor: theme.border },
          !isExpanded && embedded ? styles.headerCollapsedEmbedded : null,
        ]}>
        <ThemedText
          style={[styles.title, embedded ? styles.titleEmbedded : null]}
          type={embedded ? undefined : 'subtitle'}>
          {title}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.chevron}>
          {isExpanded ? '−' : '+'}
        </ThemedText>
      </Pressable>

      {isExpanded ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  sectionEmbedded: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerCollapsedEmbedded: {
    borderBottomWidth: 0,
  },
  title: {
    fontSize: 15,
  },
  titleEmbedded: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  chevron: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 18,
    lineHeight: 22,
  },
  body: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
});
