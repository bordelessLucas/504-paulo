import { type Href, Redirect, Stack } from 'expo-router';

import { useAuth } from '@/features/auth/auth-context';
import { useSubscription } from '@/features/subscription/subscription-context';

/**
 * Grupo de rota do paywall — planos e troca obrigatória de senha no 1º acesso.
 */
export default function PaywallLayout() {
  const { user, isLoading: isAuthLoading, pendingRegistration } = useAuth();
  const { isSubscribed, isLoading: isSubscriptionLoading } = useSubscription();

  if (isAuthLoading) {
    return null;
  }

  if (user?.mustChangePassword) {
    return (
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="trocar-senha" />
      </Stack>
    );
  }

  // Já assinante → volta para o app.
  if (isSubscribed) {
    return <Redirect href={'/(main)/' as Href} />;
  }

  // Usuário autenticado sem plano: aguarda o carregamento da assinatura.
  if (user) {
    if (isSubscriptionLoading) {
      return null;
    }

    return (
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="planos" />
      </Stack>
    );
  }

  // Novo cadastro pendente (conta ainda não criada) pode ver o paywall.
  if (pendingRegistration) {
    return (
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="planos" />
      </Stack>
    );
  }

  return <Redirect href="/(auth)/login" />;
}
