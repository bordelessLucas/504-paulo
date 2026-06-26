import { brandRgb } from '@/constants/brand';
import { getScreenTopChromeHeight } from '@/constants/screen-chrome';
import { layout } from '@/constants/theme';
import { useIsDesktopLayout } from '@/hooks/use-is-desktop-layout';
import { useTheme } from '@/hooks/use-theme';
import { hapticSelection } from '@/lib/haptics';
import { useNotifications } from '@/features/notificacoes/notifications-context';
import { useAppNavigation } from '@/navigation/app-navigation-context';
import { HeaderIconButton } from '@/components/navigation/header-icon-button';
import { SCREEN_TOP_BAR_HEIGHT } from '@/constants/layout';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ScreenTopBar() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const isDesktopLayout = useIsDesktopLayout();
  const { toggleDrawer, drawerStatus } = useAppNavigation();
  const { unreadCount, openPanel } = useNotifications();
  const isDrawerOpen = drawerStatus === 'open';

  if (isDesktopLayout) {
    return null;
  }

  const chromeHeight = getScreenTopChromeHeight(insets.top);

  return (
    <View pointerEvents="box-none" style={[styles.container, { height: chromeHeight }]}>
      <View
        style={[
          styles.pill,
          theme.shadow.card,
          {
            marginTop: insets.top,
            backgroundColor: brandRgb(theme.primary, 0.96),
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
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 200,
    paddingHorizontal: layout.space.md,
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
});
