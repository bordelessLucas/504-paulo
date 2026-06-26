import { StyleSheet, View } from 'react-native';

import { Fonts, layout } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ROLE_LABELS } from '@/navigation/role-menus';
import type { UserRole } from '@/types/supabase';

type PremiumHeaderProps = {
  userName: string;
  role?: UserRole | null;
  /** Texto auxiliar — omita para manter o header enxuto. */
  subtitle?: string;
};

export function PremiumHeader({ userName, role, subtitle }: PremiumHeaderProps) {
  const firstName = userName.split(' ')[0] ?? userName;
  const roleLabel = role ? ROLE_LABELS[role] : null;

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.greeting, { fontFamily: Fonts.sansBold }]}>
        Olá, {firstName}
      </ThemedText>
      {roleLabel ? (
        <ThemedText themeColor="textMuted" style={styles.role}>
          {roleLabel}
        </ThemedText>
      ) : null}
      {subtitle ? (
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 2,
    marginBottom: layout.space.xs,
  },
  greeting: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
    fontWeight: '800',
  },
  role: {
    fontSize: 13,
    lineHeight: 18,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: layout.space.xs,
  },
});
