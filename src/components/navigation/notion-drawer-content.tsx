import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DrawerNavItem } from '@/components/navigation/drawer-nav-item';
import { DrawerProfileCard } from '@/components/navigation/drawer-profile-card';
import { brandRgb } from '@/constants/brand';
import { Fonts, layout, PressedOpacity } from '@/constants/theme';
import { getScreenTopChromeHeight } from '@/constants/screen-chrome';
import { useIsDesktopLayout } from '@/hooks/use-is-desktop-layout';
import { hapticSelection } from '@/lib/haptics';
import {
  getMenuSectionsForRole,
  getTabLabelForRole,
  ROLE_LABELS,
} from '@/navigation/role-menus';
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
  const menuSections = getMenuSectionsForRole(role);
  const activeRoute = state.routes[state.index]?.name as keyof MainTabParamList | undefined;

  const topOffset = isDesktopLayout
    ? insets.top
    : getScreenTopChromeHeight(insets.top) + layout.space.xs;

  const handleNavigate = (routeName: keyof MainTabParamList) => {
    void hapticSelection();

    if (activeRoute !== routeName) {
      (navigation as { jumpTo: (name: string) => void }).jumpTo(routeName);
    }

    if (closeOnNavigate) {
      navigation.closeDrawer();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: topOffset }]}>
      <View style={styles.brandHeader}>
        <View style={[styles.brandMark, { backgroundColor: brandRgb(theme.accent, 0.15) }]}>
          <Ionicons color={theme.accent} name="analytics" size={18} />
        </View>
        <View style={styles.brandText}>
          <Text style={[styles.brandVertek, { color: theme.accent, fontFamily: Fonts.display }]}>
            Vertek
          </Text>
          <Text style={[styles.brandAvalia, { color: theme.textSecondary, fontFamily: Fonts.sansMedium }]}>
            Avalia
          </Text>
        </View>
      </View>

      <DrawerProfileCard userName={user.name} roleLabel={ROLE_LABELS[role]} />

      <DrawerContentScrollView
        contentContainerStyle={styles.menuList}
        showsVerticalScrollIndicator={false}>
        {menuSections.map((section, sectionIndex) => (
          <View
            key={`${section.title}-${sectionIndex}`}
            style={sectionIndex > 0 ? styles.sectionSpacing : undefined}>
            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{section.title}</Text>
            {section.items.map((item) => {
              const isActive = activeRoute === item.name;
              const label = getTabLabelForRole(item.name, role);
              const badgeCount = item.name === 'Aprovacoes' ? pendingApprovalCount : 0;

              return (
                <DrawerNavItem
                  key={`${section.title}-${item.name}`}
                  icon={item.icon}
                  isActive={isActive}
                  label={label}
                  badgeCount={badgeCount}
                  onPress={() => handleNavigate(item.name)}
                />
              );
            })}
          </View>
        ))}
      </DrawerContentScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + layout.space.sm }]}>
        <View style={[styles.footerDivider, { backgroundColor: theme.border }]} />
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
          <View style={[styles.signOutIcon, { backgroundColor: theme.dangerMuted }]}>
            <Ionicons color={theme.danger} name="log-out-outline" size={18} />
          </View>
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
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.space.sm,
    paddingHorizontal: layout.space.lg,
    marginBottom: layout.space.sm,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: layout.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  brandVertek: {
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  brandAvalia: {
    fontSize: 14,
    lineHeight: 18,
  },
  menuList: {
    paddingTop: layout.space.xs,
    paddingBottom: layout.space.sm,
  },
  sectionSpacing: {
    marginTop: layout.space.md,
  },
  sectionTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    paddingHorizontal: layout.space.lg,
    marginBottom: layout.space.xs,
  },
  footer: {
    paddingTop: layout.space.sm,
    paddingHorizontal: layout.space.md,
  },
  footerDivider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: layout.space.sm,
  },
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.space.sm,
    minHeight: 44,
    paddingVertical: layout.space.xs,
    paddingHorizontal: layout.space.xs,
  },
  signOutIcon: {
    width: 32,
    height: 32,
    borderRadius: layout.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutLabel: {
    fontSize: 15,
    lineHeight: 20,
  },
});
