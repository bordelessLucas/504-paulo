import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Badge } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SCREEN_TOP_BAR_HEIGHT } from '@/constants/layout';
import { PressedOpacity, Radius, Spacing } from '@/constants/theme';
import { useNotifications } from '@/features/notificacoes/notifications-context';
import { useIsDesktopLayout } from '@/hooks/use-is-desktop-layout';
import { useTheme } from '@/hooks/use-theme';
import { useAppNavigation } from '@/navigation/app-navigation-context';
import { HeaderIconButton } from '@/components/navigation/header-icon-button';

export function ScreenTopBar() {
  const insets = useSafeAreaInsets();
  const isDesktopLayout = useIsDesktopLayout();
  const { openDrawer } = useAppNavigation();
  const { unreadCount, openPanel } = useNotifications();

  if (isDesktopLayout) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { paddingTop: insets.top, height: insets.top + SCREEN_TOP_BAR_HEIGHT }]}>
      <View style={styles.row}>
        <HeaderIconButton
          accessibilityLabel="Abrir menu de navegação"
          icon="menu"
          onPress={openDrawer}
        />
        <HeaderIconButton
          accessibilityLabel={
            unreadCount > 0 ? `Abrir alertas, ${unreadCount} não lidos` : 'Abrir alertas'
          }
          badge={unreadCount}
          icon="bell-outline"
          onPress={openPanel}
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
    zIndex: 50,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: SCREEN_TOP_BAR_HEIGHT,
    paddingHorizontal: Spacing.three,
  },
});
