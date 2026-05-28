import { Redirect } from 'expo-router';

import { AppNavigator } from '@/navigation/AppNavigator';
import { useAuth } from '@/features/auth/auth-context';

export default function MainLayout() {
  const { user, isLoading } = useAuth();

  if (!isLoading && !user) {
    return <Redirect href="/(auth)/login" />;
  }

  return <AppNavigator />;
}
