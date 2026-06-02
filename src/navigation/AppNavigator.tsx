import { NavigationIndependentTree } from '@react-navigation/native';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { useAuthRole } from '@/hooks/use-auth-role';
import { RoleTabNavigator } from '@/navigation/RoleTabNavigator';
import type { UserRole } from '@/types/supabase';

function getEffectiveRole(role: UserRole | null | undefined): UserRole {
  return role ?? 'colaborador';
}

export function AppNavigator() {
  const { user, isLoading, refetchProfile } = useAuth();
  const { role } = useAuthRole();

  useEffect(() => {
    if (user) {
      void refetchProfile();
    }
  }, [user?.id, refetchProfile]);

  if (isLoading) {
    return (
      <ThemedView style={styles.loading}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const effectiveRole = getEffectiveRole(role);

  return (
    <NavigationIndependentTree>
      <RoleTabNavigator key={effectiveRole} role={effectiveRole} />
    </NavigationIndependentTree>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
});
