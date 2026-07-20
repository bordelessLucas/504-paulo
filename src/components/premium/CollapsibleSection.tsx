import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { GlassCard } from '@/components/premium/GlassCard';
import { SectionTitle } from '@/components/premium/SectionTitle';
import { ThemedText } from '@/components/themed-text';
import { layout } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { hapticSelection } from '@/lib/haptics';

type CollapsibleSectionProps = {
  title: string;
  children: ReactNode;
  count?: number;
  defaultExpanded?: boolean;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function CollapsibleSection({
  title,
  children,
  count,
  defaultExpanded = false,
  actionLabel,
  onActionPress,
}: CollapsibleSectionProps) {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <GlassCard padding="compact">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        onPress={() => {
          void hapticSelection();
          setIsExpanded((prev) => !prev);
        }}
        style={styles.header}>
        <View style={styles.headerLeft}>
          <SectionTitle title={title} />
          {count != null && count > 0 ? (
            <View style={[styles.countPill, { backgroundColor: theme.accentMuted }]}>
              <ThemedText style={[styles.countText, { color: theme.accent }]}>{count}</ThemedText>
            </View>
          ) : null}
        </View>
        <Ionicons
          color={theme.textMuted}
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
        />
      </Pressable>

      {isExpanded ? (
        <View style={styles.body}>
          {children}
          {actionLabel && onActionPress ? (
            <Pressable accessibilityRole="button" onPress={onActionPress} hitSlop={8}>
              <ThemedText type="link" themeColor="accent" style={styles.action}>
                {actionLabel}
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: layout.space.sm,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.space.sm,
    flexWrap: 'wrap',
  },
  countPill: {
    minWidth: 24,
    height: 24,
    borderRadius: layout.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    alignSelf: 'center',
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
    textAlign: 'center',
  },
  body: {
    marginTop: layout.space.md,
    gap: layout.space.sm,
  },
  action: {
    marginTop: layout.space.xs,
    fontSize: 13,
  },
});
