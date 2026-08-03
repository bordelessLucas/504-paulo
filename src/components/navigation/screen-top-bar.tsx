import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { HeaderIconButton } from '@/components/navigation/header-icon-button';
import { RoleContextChip } from '@/components/navigation/role-context-chip';
import { GlobalSearchModal } from '@/components/search/global-search-modal';
import { getScreenTopChromeHeight } from '@/constants/screen-chrome';
import { SCREEN_TOP_BAR_HEIGHT } from '@/constants/layout';
import { layout, zIndex } from '@/constants/theme';
import { useAuthRole } from '@/hooks/use-auth-role';
import { useIsDesktopLayout } from '@/hooks/use-is-desktop-layout';
import { useTheme } from '@/hooks/use-theme';
import { hapticSelection } from '@/lib/haptics';
import { useNotifications } from '@/features/notificacoes/notifications-context';
import { useAppNavigation } from '@/navigation/app-navigation-context';
import { brandRgb } from '@/constants/brand';

export function ScreenTopBar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { role } = useAuthRole();
  const isDesktopLayout = useIsDesktopLayout();
  const { toggleDrawer, drawerStatus } = useAppNavigation();
  const { unreadCount, openPanel } = useNotifications();
  const isDrawerOpen = drawerStatus === 'open';

  if (isDesktopLayout) {
    return null;
  }

  const chromeHeight = getScreenTopChromeHeight(insets.top);

  return (
    <View pointerEvents="box-none" style={[styles.container, { height: chromeHeight, zIndex: zIndex.header }]}>
      <View
        pointerEvents="none"
        style={[
          styles.backdrop,
          {
            height: chromeHeight,
            backgroundColor: theme.surfaceBase,
            borderBottomColor: theme.border,
          },
        ]}
      />
      <View
        style={[
          styles.pill,
          theme.shadow.card,
          {
            marginTop: insets.top,
            backgroundColor: theme.surfaceCard,
            borderColor: brandRgb(theme.accent, isDrawerOpen ? 0.35 : 0.2),
          },
        ]}>
        <HeaderIconButton
          accessibilityLabel={isDrawerOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
          icon={isDrawerOpen ? 'close' : 'menu'}
          variant="ghost"
          onPress={() => {
            void hapticSelection();
            toggleDrawer();
          }}
          tintColor={isDrawerOpen ? theme.accentSoft : theme.text}
        />
        {role ? (
          <View style={styles.roleChip} pointerEvents="none">
            <RoleContextChip role={role} />
          </View>
        ) : null}
        <View style={styles.actions}>
          <HeaderIconButton
            accessibilityLabel="Pesquisar páginas e colaboradores"
            icon="magnify"
            variant="ghost"
            onPress={() => {
              void hapticSelection();
              setIsSearchOpen(true);
            }}
            tintColor={theme.text}
          />
        <HeaderIconButton
          accessibilityLabel={
            unreadCount > 0 ? `Abrir alertas, ${unreadCount} não lidos` : 'Abrir alertas'
          }
          badge={unreadCount}
          icon="bell-outline"
          variant="ghost"
          onPress={() => {
            void hapticSelection();
            openPanel();
          }}
          tintColor={theme.text}
        />
        </View>
      </View>
      <GlobalSearchModal visible={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: layout.space.lg,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: SCREEN_TOP_BAR_HEIGHT,
    paddingHorizontal: layout.space.sm,
    borderRadius: layout.radius.pill,
    borderWidth: 1,
  },
  roleChip: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
