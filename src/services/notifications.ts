/**
 * Notification service for QadaMate
 * Supports browser Web Notifications API and sound reminders.
 */

import { playGentleChime } from './audio';

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  try {
    return await Notification.requestPermission();
  } catch {
    return 'default';
  }
}

export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

export function getNotificationPermissionStatus(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

export function triggerPrayerNotification(
  prayerName: string,
  message: string,
  playSound = true
): void {
  if (playSound) {
    playGentleChime();
  }

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(`QadaMate: Time for ${prayerName} Salah`, {
        body: message,
        icon: '/favicon.ico',
        tag: `prayer-${prayerName}-${Date.now()}`,
      });
    } catch {
      // Notification failed or restricted in frame
    }
  }
}
