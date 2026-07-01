import { StyleSheet, View } from 'react-native';
import { Avatar, Text, useTheme as usePaperTheme } from 'react-native-paper';

import { Fonts, layout } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ROLE_LABELS } from '@/navigation/role-menus';
import type { AuthUser } from '@/types/auth';

type ColaboradorDashboardHeaderProps = {
  user: AuthUser;
};

function resolveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

export function ColaboradorDashboardHeader({ user }: ColaboradorDashboardHeaderProps) {
  const theme = useTheme();
  const paperTheme = usePaperTheme();
  const cargoLine = [user.funcao, user.departamento].filter(Boolean).join(' · ');

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surfaceCard,
          borderColor: theme.border,
        },
      ]}>
      {user.avatarUrl ? (
        <Avatar.Image size={56} source={{ uri: user.avatarUrl }} />
      ) : (
        <Avatar.Text
          size={56}
          label={resolveInitials(user.name)}
          style={{ backgroundColor: paperTheme.colors.primaryContainer }}
          labelStyle={{ color: paperTheme.colors.onPrimaryContainer, fontFamily: Fonts.sansSemiBold }}
        />
      )}

      <View style={styles.textBlock}>
        <Text
          variant="titleMedium"
          style={{ color: paperTheme.colors.onSurface, fontFamily: Fonts.sansBold }}>
          {user.name}
        </Text>
        {cargoLine ? (
          <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant, fontFamily: Fonts.sans }}>
            {cargoLine}
          </Text>
        ) : null}
        <Text variant="labelMedium" style={{ color: paperTheme.colors.primary, fontFamily: Fonts.sansMedium }}>
          {ROLE_LABELS.colaborador}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.space.md,
    padding: layout.space.lg,
    borderRadius: layout.radius.lg,
    borderWidth: 1,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
});
