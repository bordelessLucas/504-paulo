import { type Href, Redirect, Stack } from 'expo-router';

import { useAuth } from '@/features/auth/auth-context';
import { OfflineBootstrap } from '@/features/offline/offline-bootstrap';
import { useSubscription } from '@/features/subscription/subscription-context';

/**
 * Layout autenticado — guard de sessão + assinatura + providers offline.
 * O conteúdo principal fica em `(main)/index.tsx` (padrão Expo Router).
 */
export default function MainLayout() {
  const { user, isLoading } = useAuth();
  const { isSubscribed, isLoading: isSubscriptionLoading } = useSubscription();

  if (isLoading || isSubscriptionLoading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!isSubscribed) {
    return <Redirect href={'/(paywall)/planos' as Href} />;
  }

  return (
    <OfflineBootstrap>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
      </Stack>
    </OfflineBootstrap>
  );
}
