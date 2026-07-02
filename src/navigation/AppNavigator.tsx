import { NavigationIndependentTree } from '@react-navigation/native';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ScreenTopBar } from '@/components/navigation/screen-top-bar';
import { NotificationsPanel } from '@/components/notificacoes/notifications-panel';
import { NotificationToastBridge } from '@/components/notificacoes/notification-toast-bridge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { NotificationsProvider } from '@/features/notificacoes/notifications-context';
import { AppNavigationProvider } from '@/navigation/app-navigation-context';
import { NavigationLayoutProvider } from '@/navigation/navigation-layout-context';
import { RoleHybridNavigator } from '@/navigation/role-hybrid-navigator';

export function AppNavigator() {
  const { user, isLoading, isProfileReady, refetchProfile, signOut } = useAuth();
  const role = user?.role ?? null;

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
          <ThemedText type="description" themeColor="textSecondary">
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
        <NavigationLayoutProvider hasBottomTabs={false}>
          <AppNavigationProvider>
            <View style={styles.appShell}>
              <RoleHybridNavigator key={role} role={role} />
              <NotificationToastBridge />
              <ScreenTopBar />
              <NotificationsPanel />
            </View>
          </AppNavigationProvider>
        </NavigationLayoutProvider>
      </NotificationsProvider>
    </NavigationIndependentTree>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    overflow: 'visible',
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
});
