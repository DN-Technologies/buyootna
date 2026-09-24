import type { AppNotification } from '@/shared/api/notifications.service';

/** Screen a notification opens when tapped, or null if it only marks read. */
export function getNotificationRoute(
  notification: AppNotification,
): string | null {
  if (notification.type === 'ALERT_MATCH' && notification.data?.propertyId) {
    return `/property/${notification.data.propertyId}`;
  }
  return null;
}
