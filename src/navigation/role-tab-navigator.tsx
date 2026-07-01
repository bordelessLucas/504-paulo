import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_BASE_HEIGHT } from '@/constants/layout';
import { Fonts } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { usePendingApprovalCount } from '@/hooks/use-pending-approval-count';
import { AppNavigationTabBridge } from '@/navigation/app-navigation-tab-bridge';
import {
  getPrimaryTabForRole,
  getTabLabelForRole,
  getTabsForRole,
} from '@/navigation/role-menus';
import { TAB_SCREENS, TabIcon } from '@/navigation/tab-screens';
import type { MainTabParamList } from '@/navigation/types';
import type { UserRole } from '@/types/supabase';

const Tab = createBottomTabNavigator<MainTabParamList>();

type RoleTabNavigatorProps = {
  role: UserRole;
};

/**
 * Navegação inferior por papel — otimizada para uso em campo (polegar, baixa carga cognitiva).
 */
export function RoleTabNavigator({ role }: RoleTabNavigatorProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const tabs = getTabsForRole(role);
  const initialRouteName = getPrimaryTabForRole(role);
  const pendingApprovalCount = usePendingApprovalCount();

  if (!user) {
    return null;
  }

  const tabBarHeight = TAB_BAR_BASE_HEIGHT + insets.bottom;

  return (
    <Tab.Navigator
      detachInactiveScreens={false}
      initialRouteName={initialRouteName}
      screenLayout={({ children }) => (
        <>
          <AppNavigationTabBridge />
          {children}
        </>
      )}
      screenOptions={({ route }) => {
        const tab = tabs.find((item) => item.name === route.name);

        return {
          headerShown: false,
          lazy: false,
          freezeOnBlur: true,
          tabBarActiveTintColor: theme.accent,
          tabBarInactiveTintColor: theme.textMuted,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            height: tabBarHeight,
            paddingTop: 6,
            paddingBottom: Math.max(insets.bottom, 6),
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            borderTopWidth: 1,
          },
          tabBarLabelStyle: {
            fontFamily: Fonts.sans,
            fontSize: 10,
            marginTop: 2,
          },
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={tab?.icon ?? 'ellipse-outline'} color={color} focused={focused} />
          ),
          sceneStyle: {
            backgroundColor: theme.background,
          },
        };
      }}>
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={TAB_SCREENS[tab.name]}
          options={{
            title: getTabLabelForRole(tab.name, role),
            tabBarBadge:
              tab.name === 'Aprovacoes' && pendingApprovalCount > 0
                ? pendingApprovalCount
                : undefined,
            tabBarAccessibilityLabel: getTabLabelForRole(tab.name, role),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
