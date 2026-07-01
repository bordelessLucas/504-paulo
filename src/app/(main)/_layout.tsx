import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/features/auth/auth-context';
import { OfflineBootstrap } from '@/features/offline/offline-bootstrap';

/**
 * Layout autenticado — guard de sessão + providers offline.
 * O conteúdo principal fica em `(main)/index.tsx` (padrão Expo Router).
 */
export default function MainLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <OfflineBootstrap>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
      </Stack>
    </OfflineBootstrap>
  );
}
