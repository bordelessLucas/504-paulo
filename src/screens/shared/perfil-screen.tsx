import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ScreenShell } from '@/components/navigation/screen-shell';
import { Button } from '@/components/ui/button';
import { ROLE_LABELS } from '@/navigation/role-menus';
import { useAuth } from '@/features/auth/auth-context';

export function PerfilScreen() {
  const { user, signOut } = useAuth();

  return (
    <ScreenShell title="Perfil" description="Dados da sua conta no Avalia.">
      <ThemedText type="subtitle">{user?.name}</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.line}>
        {user?.email}
      </ThemedText>
      {user?.role ? (
        <ThemedText type="badge">{ROLE_LABELS[user.role]}</ThemedText>
      ) : null}

      <Button label="Sair da conta" variant="secondary" onPress={() => void signOut()} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  line: {
    fontSize: 15,
    lineHeight: 22,
  },
});
