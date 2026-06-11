import { NavigationIndependentTree } from '@react-navigation/native';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { NotificationBell } from '@/components/notificacoes/notification-bell';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { NotificationsProvider } from '@/features/notificacoes/notifications-context';
import { RoleTabNavigator } from '@/navigation/RoleTabNavigator';

export function AppNavigator() {
  const { user, isLoading, isProfileReady, refetchProfile, signOut } = useAuth();
  const role = user?.role ?? null;

  useEffect(() => {
    if (user && isProfileReady && !role) {
      void refetchProfile();
    }
  }, [user?.id, isProfileReady, role, refetchProfile]);

  if (isLoading || (user && !isProfileReady)) {
    return (
      <ThemedView style={styles.loading}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!role) {
    return (
      <ThemedView style={styles.loading}>
        <View style={styles.errorBox}>
          <ThemedText type="subtitle">Perfil de acesso não encontrado</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.errorText}>
            Não foi possível identificar seu papel ({user.email}). Verifique se o perfil está
            cadastrado em `profiles` com o campo `role` correto (ex.: ceo).
          </ThemedText>
          <Button label="Tentar novamente" variant="secondary" onPress={() => void refetchProfile()} />
          <Button label="Sair da conta" variant="ghost" onPress={() => void signOut()} />
        </View>
      </ThemedView>
    );
  }

  return (
    <NavigationIndependentTree>
      <NotificationsProvider>
        <View style={styles.appShell}>
          <RoleTabNavigator key={role} role={role} />
          <NotificationBell />
        </View>
      </NotificationsProvider>
    </NavigationIndependentTree>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  errorBox: {
    width: '100%',
    maxWidth: 420,
    gap: Spacing.three,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
