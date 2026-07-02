import { createDrawerNavigator } from '@react-navigation/drawer';

import { AppNavigationBridge } from '@/navigation/app-navigation-bridge';
import { NotionDrawerContent } from '@/components/navigation/notion-drawer-content';
import { DESKTOP_SIDEBAR_WIDTH, MOBILE_DRAWER_WIDTH } from '@/constants/layout';
import { useAuth } from '@/features/auth/auth-context';
import { useIsDesktopLayout } from '@/hooks/use-is-desktop-layout';
import { brandRgb } from '@/constants/brand';
import { useTheme } from '@/hooks/use-theme';
import { usePendingApprovalCount } from '@/hooks/use-pending-approval-count';
import { getPrimaryTabForRole, getTabLabelForRole, getTabsForRole } from '@/navigation/role-menus';
import { TAB_SCREENS } from '@/navigation/tab-screens';
import type { MainTabParamList } from '@/navigation/types';
import type { UserRole } from '@/types/supabase';

const Drawer = createDrawerNavigator<MainTabParamList>();

type RoleDrawerNavigatorProps = {
  role: UserRole;
};

export function RoleDrawerNavigator({ role }: RoleDrawerNavigatorProps) {
  const theme = useTheme();
  const isDesktopLayout = useIsDesktopLayout();
  const { user, signOut } = useAuth();
  const tabs = getTabsForRole(role);
  const initialRouteName = getPrimaryTabForRole(role);
  const pendingApprovalCount = usePendingApprovalCount();

  if (!user) {
    return null;
  }

  return (
    <Drawer.Navigator
      initialRouteName={initialRouteName}
      drawerContent={(props) => (
        <NotionDrawerContent
          {...props}
          role={role}
          user={user}
          pendingApprovalCount={pendingApprovalCount}
          onSignOut={() => void signOut()}
          closeOnNavigate={!isDesktopLayout}
        />
      )}
      screenLayout={({ children }) => (
        <>
          <AppNavigationBridge />
          {children}
        </>
      )}
      screenOptions={{
        drawerType: isDesktopLayout ? 'permanent' : 'front',
        headerShown: false,
        swipeEnabled: !isDesktopLayout,
        overlayColor: brandRgb(theme.primary, 0.55),
        lazy: true,
        freezeOnBlur: true,
        drawerStyle: {
          width: isDesktopLayout ? DESKTOP_SIDEBAR_WIDTH : MOBILE_DRAWER_WIDTH,
          backgroundColor: theme.background,
          borderRightWidth: isDesktopLayout ? 1 : 0,
          borderRightColor: theme.border,
        },
        sceneStyle: {
          backgroundColor: theme.background,
        },
      }}>
      {tabs.map((tab) => (
        <Drawer.Screen
          key={tab.name}
          name={tab.name}
          component={TAB_SCREENS[tab.name]}
          options={{
            title: getTabLabelForRole(tab.name, role),
          }}
        />
      ))}
    </Drawer.Navigator>
  );
}
