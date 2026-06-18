import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_BASE_HEIGHT } from '@/constants/layout';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
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
  const tabBarHeight = TAB_BAR_BASE_HEIGHT + insets.bottom;

  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      safeAreaInsets={{ bottom: insets.bottom }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingTop: Spacing.two,
          paddingBottom: Math.max(insets.bottom, Spacing.two),
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          paddingVertical: Spacing.one,
        },
        tabBarLabelStyle: {
          fontFamily: Fonts.sansMedium,
          fontSize: 10,
          lineHeight: 13,
          marginTop: 2,
        },
      }}>
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={TAB_SCREENS[tab.name]}
          options={{
            title: getTabLabelForRole(tab.name, role),
            tabBarIcon: ({ color }) => <TabIcon color={color} name={tab.icon} />,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
