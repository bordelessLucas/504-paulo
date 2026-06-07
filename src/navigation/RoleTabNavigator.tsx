import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { ComponentType } from 'react';

import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getPrimaryTabForRole, getTabsForRole } from '@/navigation/role-menus';
import type { MainTabParamList, TabIconName } from '@/navigation/types';
import { AdminDashboardScreen } from '@/screens/admin/admin-dashboard-screen';
import { DashboardsGerenciaisScreen } from '@/screens/admin/dashboards-gerenciais-screen';
import { AprovacoesScreen } from '@/screens/admin/aprovacoes-screen';
import { PainelAnualEstrategicoScreen } from '@/screens/admin/painel-anual-estrategico';
import { PainelAvaliacaoScreen } from '@/screens/avaliacao/painel-screen';
import { MinhaEquipeTabScreen } from '@/screens/avaliacao/minha-equipe-tab-screen';
import { DashboardColaboradorScreen } from '@/screens/colaborador/dashboard-screen';
import { MinhasAvaliacoesScreen } from '@/screens/colaborador/minhas-avaliacoes-screen';
import { PainelReajusteScreen } from '@/screens/gerente/painel-reajuste-screen';
import { PerfilScreen } from '@/screens/shared/perfil-screen';
import type { UserRole } from '@/types/supabase';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_SCREENS: Record<keyof MainTabParamList, ComponentType> = {
  DashboardColaborador: DashboardColaboradorScreen,
  MinhasAvaliacoes: MinhasAvaliacoesScreen,
  PainelAvaliacao: PainelAvaliacaoScreen,
  MinhaEquipe: MinhaEquipeTabScreen,
  PainelReajuste: PainelReajusteScreen,
  AdminDashboard: AdminDashboardScreen,
  DashboardsGerenciais: DashboardsGerenciaisScreen,
  Aprovacoes: AprovacoesScreen,
  PainelAnualEstrategico: PainelAnualEstrategicoScreen,
  Perfil: PerfilScreen,
};

function TabIcon({ name, color }: { name: TabIconName; color: string }) {
  return <Ionicons color={color} name={name} size={20} />;
}

type RoleTabNavigatorProps = {
  role: UserRole;
};

export function RoleTabNavigator({ role }: RoleTabNavigatorProps) {
  const theme = useTheme();
  const tabs = getTabsForRole(role);
  const initialRouteName = getPrimaryTabForRole(role);

  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 58,
          paddingTop: Spacing.one,
          paddingBottom: Spacing.one,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontFamily: Fonts.sansMedium,
          fontSize: 11,
          lineHeight: 14,
        },
      }}>
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={TAB_SCREENS[tab.name]}
          options={{
            title: tab.label,
            tabBarIcon: ({ color }) => <TabIcon color={color} name={tab.icon} />,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
