import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Divider } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DrawerNavItem } from '@/components/navigation/drawer-nav-item';
import { DrawerProfileCard } from '@/components/navigation/drawer-profile-card';
import { Fonts, layout, PressedOpacity } from '@/constants/theme';
import { getScreenTopChromeHeight } from '@/constants/screen-chrome';
import { useIsDesktopLayout } from '@/hooks/use-is-desktop-layout';
import { hapticSelection } from '@/lib/haptics';
import { getMenuItemsForRole, getTabLabelForRole, ROLE_LABELS } from '@/navigation/role-menus';
import type { MainTabParamList } from '@/navigation/types';
import type { AuthUser } from '@/types/auth';
import type { UserRole } from '@/types/supabase';
import { useTheme } from '@/hooks/use-theme';

type NotionDrawerContentProps = DrawerContentComponentProps & {
  user: AuthUser;
  role: UserRole;
  pendingApprovalCount?: number;
  onSignOut: () => void;
  closeOnNavigate?: boolean;
};

export function NotionDrawerContent({
  state,
  navigation,
  user,
  role,
  pendingApprovalCount = 0,
  onSignOut,
  closeOnNavigate = false,
}: NotionDrawerContentProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isDesktopLayout = useIsDesktopLayout();
  const menuItems = getMenuItemsForRole(role);
  const activeRoute = state.routes[state.index]?.name as keyof MainTabParamList | undefined;

  const topOffset = isDesktopLayout
    ? insets.top
    : getScreenTopChromeHeight(insets.top) + layout.space.xs;

  const handleNavigate = (routeName: keyof MainTabParamList) => {
    void hapticSelection();

    if (activeRoute !== routeName) {
      navigation.jumpTo(routeName);
    }

    if (closeOnNavigate) {
      navigation.closeDrawer();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: topOffset }]}>
      <DrawerProfileCard userName={user.name} roleLabel={ROLE_LABELS[role]} />

      <DrawerContentScrollView
        contentContainerStyle={styles.menuList}
        showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => {
          const isActive = activeRoute === item.name;
          const label = getTabLabelForRole(item.name, role);
          const badgeCount = item.name === 'Aprovacoes' ? pendingApprovalCount : 0;

          return (
            <DrawerNavItem
              key={item.name}
              icon={item.icon}
              isActive={isActive}
              label={label}
              badgeCount={badgeCount}
              onPress={() => handleNavigate(item.name)}
            />
          );
        })}
      </DrawerContentScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + layout.space.sm }]}>
        <Divider style={{ backgroundColor: theme.border }} />
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void hapticSelection();
            onSignOut();
          }}
          style={({ pressed }) => [
            styles.signOutRow,
            pressed && { opacity: PressedOpacity },
          ]}>
          <Ionicons color={theme.danger} name="log-out-outline" size={22} />
          <Text style={[styles.signOutLabel, { color: theme.danger, fontFamily: Fonts.sansMedium }]}>
            Sair da conta
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuList: {
    paddingTop: layout.space.xs,
    paddingBottom: layout.space.sm,
  },
  footer: {
    paddingTop: layout.space.sm,
    paddingHorizontal: layout.space.md,
  },
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.space.sm,
    minHeight: 48,
    paddingVertical: layout.space.sm,
  },
  signOutLabel: {
    fontSize: 15,
    lineHeight: 20,
  },
});
