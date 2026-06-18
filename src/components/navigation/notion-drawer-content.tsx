import Ionicons from '@expo/vector-icons/Ionicons';
import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { getMenuItemsForRole, getTabLabelForRole, ROLE_LABELS } from '@/navigation/role-menus';
import type { AuthUser } from '@/types/auth';
import type { UserRole } from '@/types/supabase';
import { useTheme } from '@/hooks/use-theme';

type NotionDrawerContentProps = DrawerContentComponentProps & {
  user: AuthUser;
  role: UserRole;
  pendingApprovalCount?: number;
  onSignOut: () => void;
};

export function NotionDrawerContent({
  state,
  navigation,
  user,
  role,
  pendingApprovalCount = 0,
  onSignOut,
}: NotionDrawerContentProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const menuItems = getMenuItemsForRole(role);
  const activeRoute = state.routes[state.index]?.name;

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={[styles.brand, { borderBottomColor: theme.border }]}>
        <ThemedText type="badge">Avalia</ThemedText>
        <ThemedText type="subtitle" style={styles.userName}>
          {user.name}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.userMeta}>
          {ROLE_LABELS[role]}
        </ThemedText>
      </View>

      <DrawerContentScrollView
        contentContainerStyle={styles.menuList}
        showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => {
          const isActive = activeRoute === item.name;
          const label = getTabLabelForRole(item.name, role);
          const badgeCount = item.name === 'Aprovacoes' ? pendingApprovalCount : 0;

          return (
            <Pressable
              key={item.name}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => navigation.navigate(item.name)}
              style={[
                styles.menuItem,
                {
                  backgroundColor: isActive ? theme.backgroundSelected : 'transparent',
                },
              ]}>
              <Ionicons
                color={isActive ? theme.text : theme.textSecondary}
                name={item.icon}
                size={18}
              />
              <ThemedText
                style={[
                  styles.menuLabel,
                  { color: isActive ? theme.text : theme.textSecondary },
                ]}>
                {label}
              </ThemedText>
              {badgeCount > 0 ? (
                <View style={[styles.badge, { backgroundColor: theme.danger }]}>
                  <ThemedText style={styles.badgeText}>{badgeCount}</ThemedText>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </DrawerContentScrollView>

      <View style={[styles.footer, { borderTopColor: theme.border, paddingBottom: insets.bottom + Spacing.two }]}>
        <Pressable
          accessibilityRole="button"
          onPress={onSignOut}
          style={({ pressed }) => [
            styles.menuItem,
            pressed && { opacity: 0.7 },
          ]}>
          <Ionicons color={theme.danger} name="log-out-outline" size={18} />
          <ThemedText style={[styles.menuLabel, { color: theme.danger }]}>Sair da conta</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  brand: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    gap: Spacing.one,
    borderBottomWidth: 1,
  },
  userName: {
    marginTop: Spacing.two,
  },
  userMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  menuList: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    gap: Spacing.one,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    borderRadius: Radius.md,
  },
  badge: {
    marginLeft: 'auto',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11,
    lineHeight: 14,
  },
  menuLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.two,
  },
});
