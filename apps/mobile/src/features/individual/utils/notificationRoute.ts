import type { AppNotification } from '@/shared/api/notifications.service';

/** Screen a notification opens when tapped, or null if it only marks read. */
export function getNotificationRoute(
  notification: AppNotification,
): string | null {
  if (notification.type === 'ALERT_MATCH' && notification.data?.propertyId) {
    return `/property/${notification.data.propertyId}`;
  }
  // Security alert: open Active Devices so an unknown device can be removed
  if (notification.type === 'NEW_DEVICE_LOGIN') {
    return '/devices';
  }
  return null;
}
