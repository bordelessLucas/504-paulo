import { Redirect } from 'expo-router';

import { AppNavigator } from '@/navigation/AppNavigator';
import { useAuth } from '@/features/auth/auth-context';

import { OfflineBootstrap } from '@/features/offline/offline-bootstrap';

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
      <AppNavigator />
    </OfflineBootstrap>
  );
}
