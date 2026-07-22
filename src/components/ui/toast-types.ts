import type { TabIconName } from '@/navigation/types';

export type ToastVariant = 'success' | 'error' | 'info';

export type ToastKind = 'default' | 'notification';

export type DefaultToastPayload = {
  kind: 'default';
  message: string;
  variant: ToastVariant;
};

export type NotificationToastPayload = {
  kind: 'notification';
  id: string;
  title: string;
  message: string;
  icon: TabIconName;
  variant: ToastVariant;
  onPress?: () => void;
};

export type ToastPayload = DefaultToastPayload | NotificationToastPayload;
