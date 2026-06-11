import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { NotificationsPanel } from '@/components/notificacoes/notifications-panel';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useNotifications } from '@/features/notificacoes/notifications-context';
import { useTheme } from '@/hooks/use-theme';

export function NotificationBell() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { unreadCount, openPanel } = useNotifications();

  const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <>
      <View pointerEvents="box-none" style={[styles.container, { top: insets.top + Spacing.two }]}>
        <Pressable
          accessibilityLabel={
            unreadCount > 0
              ? `Abrir alertas, ${unreadCount} não lidos`
              : 'Abrir alertas'
          }
          accessibilityRole="button"
          onPress={openPanel}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: theme.background,
              borderColor: theme.border,
              shadowColor: theme.text,
            },
            pressed && styles.pressed,
          ]}>
          <Ionicons color={theme.text} name="notifications-outline" size={22} />

          {unreadCount > 0 ? (
            <View style={[styles.badge, { backgroundColor: theme.danger }]}>
              <ThemedText style={styles.badgeText}>{badgeLabel}</ThemedText>
            </View>
          ) : null}
        </Pressable>
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
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontFamily: Fonts.sansSemiBold,
    fontSize: 10,
    lineHeight: 12,
  },
  pressed: {
    opacity: 0.88,
  },
});
