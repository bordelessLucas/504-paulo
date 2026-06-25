import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { Divider, Drawer, Surface, Text as PaperText, useTheme as usePaperTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fonts, Spacing } from '@/constants/theme';
import { getMenuItemsForRole, getTabLabelForRole, ROLE_LABELS } from '@/navigation/role-menus';
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
  const paperTheme = usePaperTheme();
  const insets = useSafeAreaInsets();
  const menuItems = getMenuItemsForRole(role);
  const activeRoute = state.routes[state.index]?.name;

  const handleNavigate = (routeName: string) => {
    navigation.navigate(routeName);
    if (closeOnNavigate) {
      navigation.closeDrawer();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background, paddingTop: insets.top }]}>
      <Surface style={[styles.brand, { backgroundColor: paperTheme.colors.surface }]} elevation={0}>
        <View style={styles.brandLogo}>
          <Text style={[styles.brandVertek, { color: theme.primary, fontFamily: Fonts.display }]}>
            Vertek
          </Text>
          <Text style={[styles.brandAvalia, { color: theme.text, fontFamily: Fonts.sansMedium }]}>
            Avalia
          </Text>
        </View>
        <PaperText variant="titleMedium" style={styles.userName}>
          {user.name}
        </PaperText>
        <PaperText variant="bodySmall" style={{ color: paperTheme.colors.onSurfaceVariant }}>
          {ROLE_LABELS[role]}
        </PaperText>
      </Surface>

      <DrawerContentScrollView
        contentContainerStyle={styles.menuList}
        showsVerticalScrollIndicator={false}>
        <Drawer.Section title="Navegação" showDivider={false}>
          {menuItems.map((item) => {
            const isActive = activeRoute === item.name;
            const label = getTabLabelForRole(item.name, role);
            const badgeCount = item.name === 'Aprovacoes' ? pendingApprovalCount : 0;

            const displayLabel = badgeCount > 0 ? `${label} (${badgeCount})` : label;

            return (
              <Drawer.Item
                key={item.name}
                label={displayLabel}
                icon={({ color, size }) => (
                  <Ionicons color={color} name={item.icon} size={size} />
                )}
                active={isActive}
                onPress={() => handleNavigate(item.name)}
                style={[
                  styles.drawerItem,
                  isActive && { backgroundColor: paperTheme.colors.primaryContainer },
                ]}
              />
            );
          })}
        </Drawer.Section>
      </DrawerContentScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.two }]}>
        <Divider />
        <Drawer.Item
          label="Sair da conta"
          icon={({ color, size }) => (
            <Ionicons color={paperTheme.colors.error} name="log-out-outline" size={size} />
          )}
          onPress={onSignOut}
          style={styles.signOutItem}
          theme={{ colors: { onSurfaceVariant: paperTheme.colors.error } }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  brand: {
    marginHorizontal: Spacing.three,
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: 12,
    gap: Spacing.one,
  },
  brandLogo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
  },
  brandVertek: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0.5,
  },
  brandAvalia: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  userName: {
    marginTop: Spacing.two,
  },
  menuList: {
    paddingBottom: Spacing.two,
  },
  drawerItem: {
    marginHorizontal: Spacing.two,
    borderRadius: 10,
  },
  footer: {
    paddingTop: Spacing.one,
  },
  signOutItem: {
    marginHorizontal: Spacing.two,
  },
});
