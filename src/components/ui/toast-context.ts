import { createContext, type Context } from 'react';

import type { NotificationToastPayload, ToastVariant } from '@/components/ui/toast-types';

export type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
  showNotificationToast: (payload: Omit<NotificationToastPayload, 'kind'>) => void;
};

/**
 * Singleton global — evita context “fantasma” no web quando o Metro
 * faz bundle splitting e carrega duas cópias do módulo de toast.
 */
const GLOBAL_KEY = '__vertek_toast_context__' as const;

type GlobalToastStore = typeof globalThis & {
  [GLOBAL_KEY]?: Context<ToastContextValue | null>;
};

export function getToastContext() {
  const globalStore = globalThis as GlobalToastStore;

  if (!globalStore[GLOBAL_KEY]) {
    globalStore[GLOBAL_KEY] = createContext<ToastContextValue | null>(null);
  }

  return globalStore[GLOBAL_KEY];
}
