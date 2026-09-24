import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { AppNotification } from '@/shared/api/notifications.service';

import NotificationCard, { formatRelativeTime } from '../NotificationCard';

const mockNotification: AppNotification = {
  id: 'notif-1',
  userId: 'user-1',
  type: 'IDENTITY_APPROVED',
  title: 'عقار جديد مطابق لبحثك',
  body: 'شقة في السالمية • 2 غرفة • 85,000 د.ك',
  identityId: null,
  isRead: false,
  createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
};

describe('NotificationCard', () => {
  it('renders notification title, body, and relative timestamp', async () => {
    const onPress = jest.fn();
    const onMenuPress = jest.fn();

    const { findByText, findByLabelText } = await render(
      <NotificationCard
        notification={mockNotification}
        onPress={onPress}
        onMenuPress={onMenuPress}
      />,
    );

    const titleEl = await findByText('عقار جديد مطابق لبحثك');
    expect(titleEl).toBeTruthy();
    expect(await findByText('شقة في السالمية • 2 غرفة • 85,000 د.ك')).toBeTruthy();
    expect(await findByText('منذ 10 دقائق')).toBeTruthy();

    fireEvent.press(titleEl);
    expect(onPress).toHaveBeenCalledWith(mockNotification);

    const menuButton = await findByLabelText('خيارات الإشعار');
    fireEvent.press(menuButton);
    expect(onMenuPress).toHaveBeenCalled();
  });

  it('renders invoice notification properly', async () => {
    const invoiceNotif: AppNotification = {
      ...mockNotification,
      id: 'notif-inv',
      title: 'وصلتك فاتورة جديدة من شركة المستقبل',
      body: 'ادوات تشطيب محل تجاري',
      isRead: true,
    };

    const { findByText } = await render(
      <NotificationCard
        notification={invoiceNotif}
        onPress={jest.fn()}
        onMenuPress={jest.fn()}
      />,
    );

    expect(await findByText('وصلتك فاتورة جديدة من شركة المستقبل')).toBeTruthy();
    expect(await findByText('ادوات تشطيب محل تجاري')).toBeTruthy();
  });

  describe('formatRelativeTime', () => {
    it('formats relative times correctly', () => {
      const now = Date.now();
      expect(formatRelativeTime(new Date(now - 10000).toISOString())).toBe('الآن');
      expect(formatRelativeTime(new Date(now - 60000).toISOString())).toBe('منذ دقيقة');
      expect(formatRelativeTime(new Date(now - 120000).toISOString())).toBe('منذ دقيقتين');
      expect(formatRelativeTime(new Date(now - 600000).toISOString())).toBe('منذ 10 دقائق');
      expect(formatRelativeTime(new Date(now - 3600000).toISOString())).toBe('منذ ساعة');
      expect(formatRelativeTime(new Date(now - 7200000).toISOString())).toBe('منذ ساعتين');
      expect(formatRelativeTime(new Date(now - 86400000).toISOString())).toBe('منذ يوم');
      expect(formatRelativeTime(new Date(now - 172800000).toISOString())).toBe('منذ يومين');
    });
  });
});
