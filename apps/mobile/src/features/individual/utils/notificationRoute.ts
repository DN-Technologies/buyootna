import type { AppNotification } from '@/shared/api/notifications.service';

/** Screen a notification opens when tapped, or null if it only marks read. */
export function getNotificationRoute(
  notification: AppNotification,
): string | null {
  if (notification.type === 'ALERT_MATCH' && notification.data?.propertyId) {
    return `/property/${notification.data.propertyId}`;
  }
  // A company answered: the request with its offers
  if (notification.type === 'REQUEST_REPLY' && notification.data?.requestId) {
    return `/request-details/${notification.data.requestId}`;
  }
  // A request sent to the company/office: it, on the company's side (opened
  // as the persona it was sent to, see openAsPersona)
  if (notification.type === 'REQUEST_RECEIVED' && notification.data?.requestId) {
    return `/(company)/(requests)/${notification.data.requestId}`;
  }
  // A comment on the company's or office's reel: that reel
  if (notification.type === 'REEL_COMMENT' && notification.data?.reelId) {
    return `/reels?startId=${notification.data.reelId}`;
  }
  // Security alert: open Active Devices so an unknown device can be removed
  if (notification.type === 'NEW_DEVICE_LOGIN') {
    return '/devices';
  }
  return null;
}
