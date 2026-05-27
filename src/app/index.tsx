import { Redirect } from 'expo-router';

import { useAuth } from '@/features/auth/auth-context';

export default function IndexScreen() {
  const { user } = useAuth();

  if (user) {
    return <Redirect href="/(main)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
