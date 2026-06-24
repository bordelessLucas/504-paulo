import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { NotificationsPanel } from '@/components/notificacoes/notifications-panel';
import { BrandColors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useNotifications } from '@/features/notificacoes/notifications-context';
import { useTheme } from '@/hooks/use-theme';

type NotificationBellButtonProps = {
  compact?: boolean;
};

export function NotificationBellButton({ compact = false }: NotificationBellButtonProps) {
  const theme = useTheme();
  const { unreadCount, openPanel } = useNotifications();

  const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount);
  const iconSize = compact ? 18 : 22;

  return (
    <Pressable
      accessibilityLabel={
        unreadCount > 0 ? `Abrir alertas, ${unreadCount} não lidos` : 'Abrir alertas'
      }
      accessibilityRole="button"
      onPress={openPanel}
      style={({ pressed }) => [
        compact ? styles.compactButton : styles.button,
        {
          backgroundColor: BrandColors.card,
          borderColor: theme.border,
          shadowColor: BrandColors.primary,
        },
        pressed && styles.pressed,
      ]}>
      <Ionicons color={BrandColors.primary} name="notifications-outline" size={iconSize} />

      {unreadCount > 0 ? (
        <View style={[styles.badge, { backgroundColor: theme.danger }]}>
          <ThemedText style={styles.badgeText}>{badgeLabel}</ThemedText>
        </View>
      ) : null}
    </Pressable>
  );
}

export function NotificationBell() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <View pointerEvents="box-none" style={[styles.container, { top: insets.top + Spacing.two }]}>
        <NotificationBellButton />
      </View>

      <NotificationsPanel />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: Spacing.four,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  compactButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: BrandColors.card,
  },
  badgeText: {
    color: BrandColors.textOnPrimary,
    fontFamily: Fonts.sansSemiBold,
    fontSize: 10,
    lineHeight: 12,
  },
  pressed: {
    opacity: 0.88,
  },
});
