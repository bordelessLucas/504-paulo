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
} from '@/features/notificacoes/api';
import type { Notificacao } from '@/features/notificacoes/types';
import { useAuth } from '@/features/auth/auth-context';
import { supabase } from '@/lib/supabase';

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
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notificacao[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());

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

      setNotifications(lista);
      setUnreadCount(count);

      for (const item of lista) {
        seenNotificationIdsRef.current.add(item.id);
      }
    } catch (error) {
      console.warn(
        '[Notificações] Falha ao carregar:',
        error instanceof Error ? error.message : error,
      );
    } finally {
      setIsLoading(false);
    }
  }, [user]);

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

  const openPanel = useCallback(() => {
    setIsPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  useEffect(() => {
    seenNotificationIdsRef.current.clear();
    void refreshNotifications();
  }, [refreshNotifications, user?.id]);

  const handleIncomingNotification = useCallback(
    (nova: Notificacao, options?: { showToast?: boolean }) => {
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

        if (options?.showToast !== false) {
          showToast(nova.titulo, 'info');
        }
      }
    },
    [showToast],
  );

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

          handleIncomingNotification(mapRealtimeRow(payload.new as Record<string, unknown>));
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
  }, [handleIncomingNotification, user?.id]);

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
    }),
    [
      closePanel,
      isLoading,
      isPanelOpen,
      markAllAsRead,
      markAsRead,
      notifications,
      openPanel,
      refreshNotifications,
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
