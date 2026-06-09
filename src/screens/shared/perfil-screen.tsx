import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { ChangePasswordForm } from '@/components/perfil/change-password-form';
import { ProfileAvatarPicker } from '@/components/perfil/profile-avatar-picker';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { ROLE_LABELS } from '@/navigation/role-menus';

type ProfileInfoRowProps = {
  label: string;
  value: string;
};

function ProfileInfoRow({ label, value }: ProfileInfoRowProps) {
  const theme = useTheme();

  return (
    <View style={[styles.infoRow, { borderBottomColor: '#F0F0F0' }]}>
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

  return (
    <TabScreenContainer scrollable contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <ThemedText type="heading">Perfil</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.description}>
          Gerencie sua conta, foto e senha de acesso.
        </ThemedText>
      </View>

      <ProfileAvatarPicker
        userId={user.id}
        name={user.name}
        avatarUrl={avatarUrl ?? user.avatarUrl}
        onAvatarUpdated={(url) => void handleAvatarUpdated(url)}
      />

      <View
        style={[
          styles.card,
          { backgroundColor: theme.background, borderColor: '#F0F0F0' },
        ]}>
        <ThemedText type="subtitle">Minha conta</ThemedText>

        <ProfileInfoRow label="Nome" value={user.name} />
        <ProfileInfoRow label="E-mail" value={user.email} />

        {user.role ? (
          <ProfileInfoRow label="Papel" value={ROLE_LABELS[user.role]} />
        ) : null}

        {user.departamento ? (
          <ProfileInfoRow label="Departamento" value={user.departamento} />
        ) : null}

        {user.funcao ? <ProfileInfoRow label="Função" value={user.funcao} /> : null}
      </View>

      <ChangePasswordForm email={user.email} />

      <Button label="Sair da conta" variant="secondary" onPress={() => void signOut()} />
    </TabScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.one,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  infoRow: {
    gap: Spacing.one,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
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
});
