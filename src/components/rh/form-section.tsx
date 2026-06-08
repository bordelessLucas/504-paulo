import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FormSectionProps = {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
};

export function FormSection({ title, children, defaultExpanded = true }: FormSectionProps) {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: theme.background,
          borderColor: '#F0F0F0',
        },
      ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        onPress={() => setIsExpanded((current) => !current)}
        style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
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
    borderWidth: 1,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 15,
  },
  chevron: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 18,
    lineHeight: 22,
  },
  body: {
    padding: Spacing.three,
    gap: Spacing.three,
    borderTopWidth: 0,
  },
});
