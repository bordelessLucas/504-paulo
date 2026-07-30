const PREF_KEY = 'vertek.push.pref';

export type NotificationPermissionState = NotificationPermission | 'unsupported';

export function getNotificationPermission(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  const result = await Notification.requestPermission();
  localStorage.setItem(PREF_KEY, result);
  return result;
}

export function getStoredPushPreference(): string | null {
  return localStorage.getItem(PREF_KEY);
}

export async function showLocalNotification(title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.showNotification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
      });
      return true;
    }
  }
  new Notification(title, { body, icon: '/pwa-192x192.png' });
  return true;
}
