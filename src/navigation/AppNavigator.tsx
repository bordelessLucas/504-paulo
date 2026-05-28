import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationIndependentTree } from '@react-navigation/native';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { NotionDrawerContent } from '@/components/navigation/notion-drawer-content';
import { ThemedView } from '@/components/themed-view';
import { Fonts, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { getDrawerItemStyle, getInitialRouteForRole } from '@/navigation/role-menus';
import type { MainDrawerParamList } from '@/navigation/types';
import { AprovacoesScreen } from '@/screens/admin/aprovacoes-screen';
import { PainelAdminScreen } from '@/screens/admin/painel-admin-screen';
import { PainelAvaliacaoScreen } from '@/screens/avaliacao/painel-screen';
import { MinhaEquipeScreen } from '@/screens/avaliacao/minha-equipe-screen';
import { ColaboradorDashboardScreen } from '@/screens/colaborador/dashboard-screen';
import { MinhasAvaliacoesScreen } from '@/screens/colaborador/minhas-avaliacoes-screen';
import { PerfilScreen } from '@/screens/shared/perfil-screen';
import { useTheme } from '@/hooks/use-theme';
import type { UserRole } from '@/types/supabase';

const Drawer = createDrawerNavigator<MainDrawerParamList>();

function getEffectiveRole(role: UserRole | undefined): UserRole {
  return role ?? 'colaborador';
}

export function AppNavigator() {
  const theme = useTheme();
  const { user, isLoading, signOut, refetchProfile } = useAuth();

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

  const role = getEffectiveRole(user.role);
  const initialRouteName = getInitialRouteForRole(role);

  const drawerScreenOptions = (routeName: keyof MainDrawerParamList) => ({
    drawerItemStyle: getDrawerItemStyle(role, routeName),
    headerShown: routeName !== 'PainelAvaliacao',
    headerStyle: {
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    } as object,
    headerTitleStyle: {
      fontFamily: Fonts.sansSemiBold,
      fontSize: 16,
      color: theme.text,
    },
    headerTintColor: theme.text,
  });

  return (
    <NavigationIndependentTree>
      <Drawer.Navigator
        key={role}
        initialRouteName={initialRouteName}
        drawerContent={(props) => (
          <NotionDrawerContent
            {...props}
            role={role}
            user={user}
            onSignOut={() => void signOut()}
          />
        )}
        screenOptions={{
          drawerType: 'front',
          drawerStyle: {
            width: 280,
            backgroundColor: theme.background,
          },
          sceneStyle: {
            backgroundColor: theme.background,
          },
        }}>
        <Drawer.Screen
          name="ColaboradorDashboard"
          component={ColaboradorDashboardScreen}
          options={{
            ...drawerScreenOptions('ColaboradorDashboard'),
            title: 'Dashboard',
          }}
        />
        <Drawer.Screen
          name="MinhasAvaliacoes"
          component={MinhasAvaliacoesScreen}
          options={{
            ...drawerScreenOptions('MinhasAvaliacoes'),
            title: 'Minhas avaliações',
          }}
        />
        <Drawer.Screen
          name="PainelAvaliacao"
          component={PainelAvaliacaoScreen}
          options={{
            ...drawerScreenOptions('PainelAvaliacao'),
            title: 'Painel de avaliação',
          }}
        />
        <Drawer.Screen
          name="MinhaEquipe"
          component={MinhaEquipeScreen}
          options={{
            ...drawerScreenOptions('MinhaEquipe'),
            title: 'Minha equipe',
          }}
        />
        <Drawer.Screen
          name="PainelAdmin"
          component={PainelAdminScreen}
          options={{
            ...drawerScreenOptions('PainelAdmin'),
            title: 'Painel administrativo',
          }}
        />
        <Drawer.Screen
          name="Aprovacoes"
          component={AprovacoesScreen}
          options={{
            ...drawerScreenOptions('Aprovacoes'),
            title: 'Aprovações',
          }}
        />
        <Drawer.Screen
          name="Perfil"
          component={PerfilScreen}
          options={{
            ...drawerScreenOptions('Perfil'),
            title: 'Perfil',
          }}
        />
      </Drawer.Navigator>
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
