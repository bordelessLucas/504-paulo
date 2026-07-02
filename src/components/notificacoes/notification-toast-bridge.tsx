import { useEffect } from 'react';

import { resolveNotificationTab } from '@/features/notificacoes/resolve-notification-tab';
import type { Notificacao } from '@/features/notificacoes/types';
import { useNotifications } from '@/features/notificacoes/notifications-context';
import { useAuthRole } from '@/hooks/use-auth-role';
import { useAppNavigation } from '@/navigation/app-navigation-context';

/**
 * Conecta toasts de notificação à navegação in-app (quando há rota destino).
 */
export function NotificationToastBridge() {
  const { role } = useAuthRole();
  const { navigateToTab } = useAppNavigation();
  const { closePanel, openPanel, registerNotificationToastAction } = useNotifications();

  useEffect(() => {
    registerNotificationToastAction((notification: Notificacao) => {
      const targetTab = resolveNotificationTab(notification.tipo, role);

      if (targetTab && navigateToTab(targetTab)) {
        closePanel();
        return;
      }

      openPanel();
    });

    return () => {
      registerNotificationToastAction(null);
    };
  }, [closePanel, navigateToTab, openPanel, registerNotificationToastAction, role]);

  return null;
}
