import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useToast } from '@/components/ui/toast';
import {
  fetchNotificacoes,
  fetchUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  sendTestNotification,
} from '@/features/notificacoes/api';
import {
  getNotificationToastConfig,
  truncateNotificationMessage,
} from '@/features/notificacoes/notification-toast-config';
import type { Notificacao } from '@/features/notificacoes/types';
import { useAuth } from '@/features/auth/auth-context';
import { supabase } from '@/lib/supabase';

type NotificationToastAction = (notification: Notificacao) => void;

type NotificationsContextValue = {
  notifications: Notificacao[];
  unreadCount: number;
  isLoading: boolean;
  isPanelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  registerNotificationToastAction: (handler: NotificationToastAction | null) => void;
  fireTestNotification: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

const POLL_INTERVAL_MS = 45_000;

function mapRealtimeRow(record: Record<string, unknown>): Notificacao {
  return {
    id: String(record.id),
    destinatarioId: String(record.destinatario_id),
    tipo: record.tipo as Notificacao['tipo'],
    titulo: String(record.titulo),
    mensagem: String(record.mensagem),
    metadata: (record.metadata as Record<string, unknown>) ?? {},
    lida: Boolean(record.lida),
    createdAt: String(record.created_at),
  };
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { showNotificationToast } = useToast();
  const [notifications, setNotifications] = useState<Notificacao[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);
  const isPanelOpenRef = useRef(false);
  const toastActionRef = useRef<NotificationToastAction | null>(null);

  const registerNotificationToastAction = useCallback((handler: NotificationToastAction | null) => {
    toastActionRef.current = handler;
  }, []);

  const openPanel = useCallback(() => {
    setIsPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  useEffect(() => {
    isPanelOpenRef.current = isPanelOpen;
  }, [isPanelOpen]);

  const presentNotificationToast = useCallback(
    (notification: Notificacao, options?: { force?: boolean }) => {
      if (!options?.force && isPanelOpenRef.current) {
        return;
      }

      const { icon, variant } = getNotificationToastConfig(notification);

      showNotificationToast({
        id: notification.id,
        title: notification.titulo,
        message: truncateNotificationMessage(notification.mensagem),
        icon,
        variant,
        onPress: () => {
          void markNotificationAsRead(notification.id);
          setNotifications((current) =>
            current.map((item) =>
              item.id === notification.id ? { ...item, lida: true } : item,
            ),
          );
          setUnreadCount((current) => Math.max(0, current - 1));

          if (toastActionRef.current) {
            toastActionRef.current(notification);
            return;
          }

          openPanel();
        },
      });
    },
    [openPanel, showNotificationToast],
  );

  const handleNewNotification = useCallback(
    (nova: Notificacao) => {
      if (seenNotificationIdsRef.current.has(nova.id)) {
        return;
      }

      seenNotificationIdsRef.current.add(nova.id);

      setNotifications((current) => {
        if (current.some((item) => item.id === nova.id)) {
          return current;
        }

        return [nova, ...current];
      });

      if (!nova.lida) {
        setUnreadCount((current) => current + 1);

        if (!isInitialLoadRef.current) {
          presentNotificationToast(nova);
        }
      }
    },
    [presentNotificationToast],
  );

  const refreshNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setIsLoading(true);

    try {
      const [lista, count] = await Promise.all([
        fetchNotificacoes(),
        fetchUnreadNotificationCount(),
      ]);

      const shouldAnnounce = !isInitialLoadRef.current;

      for (const item of lista) {
        if (!seenNotificationIdsRef.current.has(item.id)) {
          seenNotificationIdsRef.current.add(item.id);

          if (!item.lida && shouldAnnounce) {
            presentNotificationToast(item);
          }
        }
      }

      setNotifications(lista);
      setUnreadCount(count);
    } catch (error) {
      console.warn(
        '[Notificações] Falha ao carregar:',
        error instanceof Error ? error.message : error,
      );
    } finally {
      isInitialLoadRef.current = false;
      setIsLoading(false);
    }
  }, [presentNotificationToast, user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    await markNotificationAsRead(notificationId);

    setNotifications((current) =>
      current.map((item) => (item.id === notificationId ? { ...item, lida: true } : item)),
    );
    setUnreadCount((current) => Math.max(0, current - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await markAllNotificationsAsRead();

    setNotifications((current) => current.map((item) => ({ ...item, lida: true })));
    setUnreadCount(0);
  }, []);

  const fireTestNotification = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    try {
      const notification = await sendTestNotification(user.id);
      const isLocal = notification.id.startsWith('local-test-');

      const deliver = () => {
        if (seenNotificationIdsRef.current.has(notification.id)) {
          presentNotificationToast(notification, { force: true });
          return;
        }

        seenNotificationIdsRef.current.add(notification.id);
        setNotifications((current) => {
          if (current.some((item) => item.id === notification.id)) {
            return current;
          }

          return [notification, ...current];
        });
        setUnreadCount((current) => current + 1);
        presentNotificationToast(notification, { force: true });
      };

      if (isLocal) {
        deliver();
        return;
      }

      // Realtime entrega o INSERT; fallback se o canal demorar.
      setTimeout(() => {
        if (!seenNotificationIdsRef.current.has(notification.id)) {
          deliver();
        }
      }, 1200);
    } catch (error) {
      console.warn(
        '[Notificações] Falha no teste:',
        error instanceof Error ? error.message : error,
      );
    }
  }, [presentNotificationToast, user?.id]);

  useEffect(() => {
    isInitialLoadRef.current = true;
    seenNotificationIdsRef.current.clear();
    void refreshNotifications();
  }, [refreshNotifications, user?.id]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let isMounted = true;

    const channel = supabase
      .channel(`notificacoes:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificacoes',
          filter: `destinatario_id=eq.${user.id}`,
        },
        (payload) => {
          if (!isMounted) {
            return;
          }

          handleNewNotification(mapRealtimeRow(payload.new as Record<string, unknown>));
        },
      )
      .subscribe((status, error) => {
        if (status === 'SUBSCRIBED') {
          console.info('[Notificações] Realtime conectado');
          return;
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(
            '[Notificações] Realtime indisponível:',
            error?.message ?? status,
          );
        }
      });

    return () => {
      isMounted = false;
      void supabase.removeChannel(channel);
    };
  }, [handleNewNotification, user?.id]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const poll = setInterval(() => {
      void refreshNotifications();
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(poll);
    };
  }, [refreshNotifications, user?.id]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        void refreshNotifications();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);

    return () => {
      subscription.remove();
    };
  }, [refreshNotifications, user?.id]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      isPanelOpen,
      openPanel,
      closePanel,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      registerNotificationToastAction,
      fireTestNotification,
    }),
    [
      closePanel,
      fireTestNotification,
      isLoading,
      isPanelOpen,
      markAllAsRead,
      markAsRead,
      notifications,
      openPanel,
      refreshNotifications,
      registerNotificationToastAction,
      unreadCount,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de NotificationsProvider.');
  }

  return context;
}
