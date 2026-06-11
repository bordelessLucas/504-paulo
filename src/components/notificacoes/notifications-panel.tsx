import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import type { Notificacao } from '@/features/notificacoes/types';
import { TIPO_NOTIFICACAO_ICON } from '@/features/notificacoes/types';
import { useNotifications } from '@/features/notificacoes/notifications-context';
import { useTheme } from '@/hooks/use-theme';

function formatNotificationDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function NotificationItem({
  notification,
  onPress,
}: {
  notification: Notificacao;
  onPress: () => void;
}) {
  const theme = useTheme();
  const iconName = TIPO_NOTIFICACAO_ICON[notification.tipo] as keyof typeof Ionicons.glyphMap;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        {
          backgroundColor: notification.lida ? theme.background : theme.backgroundSelected,
          borderColor: theme.border,
        },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.itemIcon, { backgroundColor: theme.accentMuted }]}>
        <Ionicons color={theme.text} name={iconName} size={18} />
      </View>

      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <ThemedText style={styles.itemTitle}>{notification.titulo}</ThemedText>
          {!notification.lida ? <View style={[styles.unreadDot, { backgroundColor: theme.accent }]} /> : null}
        </View>
        <ThemedText themeColor="textSecondary" style={styles.itemMessage}>
          {notification.mensagem}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.itemDate}>
          {formatNotificationDate(notification.createdAt)}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export function NotificationsPanel() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const {
    notifications,
    unreadCount,
    isLoading,
    isPanelOpen,
    closePanel,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications();

  const handleOpen = useCallback(() => {
    void refreshNotifications();
  }, [refreshNotifications]);

  const handleItemPress = useCallback(
    async (notification: Notificacao) => {
      if (!notification.lida) {
        await markAsRead(notification.id);
      }
    },
    [markAsRead],
  );

  return (
    <Modal
      animationType="slide"
      onRequestClose={closePanel}
      onShow={handleOpen}
      transparent
      visible={isPanelOpen}>
      <View style={[styles.overlay, { paddingTop: insets.top }]}>
        <Pressable style={styles.backdrop} onPress={closePanel} />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.background,
              borderColor: theme.border,
              paddingBottom: Math.max(insets.bottom, Spacing.four),
            },
          ]}>
          <View style={styles.header}>
            <View>
              <ThemedText type="heading">Alertas</ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                {unreadCount > 0
                  ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}`
                  : 'Tudo em dia'}
              </ThemedText>
            </View>

            <Pressable accessibilityLabel="Fechar alertas" onPress={closePanel} hitSlop={8}>
              <Ionicons color={theme.textSecondary} name="close" size={24} />
            </Pressable>
          </View>

          {unreadCount > 0 ? (
            <View style={styles.actions}>
              <Button
                label="Marcar todas como lidas"
                onPress={() => void markAllAsRead()}
                variant="secondary"
              />
            </View>
          ) : null}

          {isLoading ? (
            <ActivityIndicator style={styles.loader} />
          ) : notifications.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons color={theme.textSecondary} name="notifications-off-outline" size={32} />
              <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                Nenhum alerta por enquanto. Você será notificado quando houver novidades.
              </ThemedText>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onPress={() => void handleItemPress(notification)}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  sheet: {
    maxHeight: '82%',
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: Spacing.one,
  },
  actions: {
    alignItems: 'flex-start',
  },
  loader: {
    marginVertical: Spacing.six,
  },
  empty: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.two,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  item: {
    flexDirection: 'row',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
    gap: Spacing.one,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  itemTitle: {
    flex: 1,
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  itemDate: {
    fontSize: 11,
    lineHeight: 14,
  },
  pressed: {
    opacity: 0.88,
  },
});
