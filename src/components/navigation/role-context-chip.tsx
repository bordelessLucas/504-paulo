import { StyleSheet, Text, View } from 'react-native';

import { ROLE_LABELS } from '@/navigation/role-menus';
import { Fonts, layout, type SemanticTone } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { UserRole } from '@/types/supabase';

const ROLE_TONES: Partial<Record<UserRole, SemanticTone>> = {
  supervisor: 'accent',
  gerente: 'accent',
  gestor: 'warning',
  rh: 'warning',
  ceo: 'warning',
  admin: 'warning',
  colaborador: 'info',
};

type RoleContextChipProps = {
  role: UserRole;
};

export function RoleContextChip({ role }: RoleContextChipProps) {
  const theme = useTheme();
  const tone = ROLE_TONES[role] ?? 'neutral';
  const palette = theme.semantic[tone];

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
        },
      ]}>
      <Text style={[styles.label, { color: palette.text, fontFamily: Fonts.sansSemiBold }]}>
        {ROLE_LABELS[role]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: layout.radius.pill,
    paddingHorizontal: layout.space.md,
    paddingVertical: layout.space.xs,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.4,
  },
});
