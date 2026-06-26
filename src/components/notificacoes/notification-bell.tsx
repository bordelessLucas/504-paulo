import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { brand } from '@/constants/brand';
import { Fonts, layout, PressedOpacity } from '@/constants/theme';
import { useNotifications } from '@/features/notificacoes/notifications-context';
import { useTheme } from '@/hooks/use-theme';
import { hapticSelection } from '@/lib/haptics';

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
      onPress={() => {
        void hapticSelection();
        openPanel();
      }}
      style={({ pressed }) => [
        compact ? styles.compactButton : styles.button,
        theme.shadow.card,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border,
        },
        pressed && styles.pressed,
      ]}>
      <Ionicons color={theme.accent} name="notifications-outline" size={iconSize} />

      {unreadCount > 0 ? (
        <View style={[styles.badge, { backgroundColor: theme.danger, borderColor: theme.background }]}>
          <ThemedText style={[styles.badgeText, { color: brand.white }]}>{badgeLabel}</ThemedText>
        </View>
      ) : null}
    </Pressable>
  );
}

export function NotificationBell() {
  return <NotificationBellButton />;
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: layout.radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  compactButton: {
    width: 36,
    height: 36,
    borderRadius: layout.radius.sm,
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
  },
  badgeText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 10,
    lineHeight: 12,
  },
  pressed: {
    opacity: PressedOpacity,
    transform: [{ scale: 0.96 }],
  },
});
