import { getNotificationRoute } from '@/features/individual/utils/notificationRoute';
import type { AppNotification } from '@/shared/api/notifications.service';

const notification = (overrides: Partial<AppNotification>): AppNotification => ({
  id: 'n1',
  userId: 'u1',
  type: 'ALERT_MATCH',
  title: 'تطابق جديد لتنبيهك',
  body: 'شقة للإيجار في السلام',
  identityId: null,
  isRead: false,
  createdAt: '2026-09-24T00:00:00.000Z',
  ...overrides,
});

describe('getNotificationRoute', () => {
  it('opens the matched listing for an alert match', () => {
    expect(
      getNotificationRoute(notification({ data: { propertyId: 'p1' } })),
    ).toBe('/property/p1');
  });

  it('opens nothing for an alert match without link data (older rows)', () => {
    expect(getNotificationRoute(notification({ data: null }))).toBeNull();
  });

  it('opens nothing for other notification types', () => {
    expect(
      getNotificationRoute(
        notification({ type: 'IDENTITY_APPROVED', data: { propertyId: 'p1' } }),
      ),
    ).toBeNull();
  });

  it('opens Active Devices for a new-login security alert', () => {
    expect(
      getNotificationRoute(
        notification({ type: 'NEW_DEVICE_LOGIN', data: { sessionId: 's1' } }),
      ),
    ).toBe('/devices');
  });

  it("opens the request a company answered", () => {
    expect(
      getNotificationRoute(
        notification({ type: 'REQUEST_REPLY', data: { requestId: 'req-1' } }),
      ),
    ).toBe('/request-details/req-1');
  });
});
