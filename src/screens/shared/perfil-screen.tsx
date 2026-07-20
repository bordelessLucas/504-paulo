import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { Card } from '@/components/ui/card';
import { ChangePasswordForm } from '@/components/perfil/change-password-form';
import { ProfileAvatarPicker } from '@/components/perfil/profile-avatar-picker';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { SegmentedControl, type SegmentOption } from '@/components/ui/segmented-control';
import { Fonts, layout } from '@/constants/theme';
import type { ThemePreference } from '@/contexts/ThemeContext';
import { useAuth } from '@/features/auth/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { ROLE_LABELS } from '@/navigation/role-menus';

const APPEARANCE_OPTIONS: SegmentOption<ThemePreference>[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'system', label: 'Sistema' },
];

type ProfileInfoRowProps = {
  label: string;
  value: string;
  isLast?: boolean;
};

function ProfileInfoRow({ label, value, isLast = false }: ProfileInfoRowProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.infoRow,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
      ]}>
      <ThemedText themeColor="textSecondary" style={styles.infoLabel}>
        {label}
      </ThemedText>
      <ThemedText style={styles.infoValue}>{value}</ThemedText>
    </View>
  );
}

export function PerfilScreen() {
  const theme = useTheme();
  const { user, signOut, refetchProfile } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl ?? null);

  useEffect(() => {
    setAvatarUrl(user?.avatarUrl ?? null);
  }, [user?.avatarUrl]);

  const handleAvatarUpdated = useCallback(
    async (url: string) => {
      setAvatarUrl(url);
      await refetchProfile();
    },
    [refetchProfile],
  );

  if (!user) {
    return null;
  }

  const rows = [
    { label: 'Nome', value: user.name },
    { label: 'E-mail', value: user.email },
    user.role ? { label: 'Papel', value: ROLE_LABELS[user.role] } : null,
    user.departamento ? { label: 'Departamento', value: user.departamento } : null,
    user.funcao ? { label: 'Função', value: user.funcao } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <TabScreenContainer scrollable contentContainerStyle={styles.content}>
      <ScreenHeader title="Perfil" />

      <ProfileAvatarPicker
        userId={user.id}
        name={user.name}
        avatarUrl={avatarUrl ?? user.avatarUrl}
        onAvatarUpdated={(url) => void handleAvatarUpdated(url)}
      />

      <Card>
        <ThemedText type="subtitle">Minha conta</ThemedText>
        {rows.map((row, index) => (
          <ProfileInfoRow
            key={row.label}
            label={row.label}
            value={row.value}
            isLast={index === rows.length - 1}
          />
        ))}
      </Card>

      <ChangePasswordForm email={user.email} />

      <Card>
        <ThemedText type="subtitle">Aparência</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.appearanceHint}>
          {theme.preference === 'system'
            ? `Seguindo o sistema (${theme.isDark ? 'escuro' : 'claro'}).`
            : `Modo ${theme.isDark ? 'escuro' : 'claro'} ativo.`}
        </ThemedText>
        <SegmentedControl
          options={APPEARANCE_OPTIONS}
          value={theme.preference}
          onChange={theme.setPreference}
        />
      </Card>

      <Button label="Sair da conta" variant="danger" onPress={() => void signOut()} />
    </TabScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: layout.space.lg,
    paddingBottom: layout.space.xl,
  },
  infoRow: {
    gap: layout.space.xs,
    paddingVertical: layout.space.sm,
  },
  infoLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  infoValue: {
    fontFamily: Fonts.sansMedium,
    fontSize: 15,
    lineHeight: 22,
  },
  appearanceHint: {
    fontSize: 13,
    lineHeight: 18,
  },
});
