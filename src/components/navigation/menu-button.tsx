import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressedOpacity, Radius, Shadows, Spacing } from '@/constants/theme';
import { useIsDesktopLayout } from '@/hooks/use-is-desktop-layout';
import { useTheme } from '@/hooks/use-theme';
import { useAppNavigation } from '@/navigation/app-navigation-context';

export function MenuButton() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { openDrawer } = useAppNavigation();
  const isDesktopLayout = useIsDesktopLayout();

  if (isDesktopLayout) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={[styles.container, { top: insets.top + Spacing.two }]}>
      <Pressable
        accessibilityLabel="Abrir menu de navegação"
        accessibilityRole="button"
        onPress={openDrawer}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.border,
          },
          Shadows.sm,
          pressed && styles.pressed,
        ]}>
        <Ionicons color={theme.primary} name="menu-outline" size={22} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.four,
    zIndex: 50,
    overflow: 'visible',
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  pressed: {
    opacity: PressedOpacity,
  },
});
