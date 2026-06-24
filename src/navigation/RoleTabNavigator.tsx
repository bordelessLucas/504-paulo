import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppNavigationBridge } from '@/navigation/app-navigation-bridge';
import { TAB_BAR_BASE_HEIGHT } from '@/constants/layout';
import { BrandColors, Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { usePendingApprovalCount } from '@/hooks/use-pending-approval-count';
import { getPrimaryTabForRole, getTabLabelForRole, getTabsForRole } from '@/navigation/role-menus';
import { TAB_SCREENS, TabIcon } from '@/navigation/tab-screens';
import type { MainTabParamList } from '@/navigation/types';
import type { UserRole } from '@/types/supabase';

const Tab = createBottomTabNavigator<MainTabParamList>();

type RoleTabNavigatorProps = {
  role: UserRole;
};

export function RoleTabNavigator({ role }: RoleTabNavigatorProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabs = getTabsForRole(role);
  const initialRouteName = getPrimaryTabForRole(role);
  const tabBarBottomInset = Math.max(insets.bottom, Spacing.two);
  const pendingApprovalCount = usePendingApprovalCount();

  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenLayout={({ children }) => (
        <>
          <AppNavigationBridge />
          {children}
        </>
      )}
      safeAreaInsets={{ bottom: tabBarBottomInset }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: BrandColors.card,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: TAB_BAR_BASE_HEIGHT + tabBarBottomInset,
          paddingTop: Spacing.one,
          paddingBottom: tabBarBottomInset,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
        },
        tabBarLabelStyle: {
          fontFamily: Fonts.sansMedium,
          fontSize: 10,
          lineHeight: 12,
          marginTop: 2,
        },
        tabBarBadgeStyle: {
          backgroundColor: theme.secondary,
          color: theme.textOnPrimary,
          fontFamily: Fonts.sansSemiBold,
          fontSize: 10,
        },
      }}>
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={TAB_SCREENS[tab.name]}
          options={{
            title: getTabLabelForRole(tab.name, role),
            tabBarIcon: ({ color, focused }) => (
              <TabIcon color={color} focused={focused} name={tab.icon} />
            ),
            tabBarBadge:
              tab.name === 'Aprovacoes' && pendingApprovalCount > 0
                ? pendingApprovalCount
                : undefined,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
