import { fireEvent, render } from '@testing-library/react-native';

import NotificationTabs from '../NotificationTabs';

describe('NotificationTabs', () => {
  it('renders tabs and triggers onTabChange', async () => {
    const onTabChange = jest.fn();
    const onMarkAllRead = jest.fn();

    const { findByText } = await render(
      <NotificationTabs
        activeTab="ALL"
        onTabChange={onTabChange}
        hasUnread={true}
        onMarkAllRead={onMarkAllRead}
      />,
    );

    expect(await findByText('الكل')).toBeTruthy();
    expect(await findByText('غير مقروء')).toBeTruthy();
    expect(await findByText('تحديد الكل كمقروء')).toBeTruthy();

    fireEvent.press(await findByText('غير مقروء'));
    expect(onTabChange).toHaveBeenCalledWith('UNREAD');

    fireEvent.press(await findByText('تحديد الكل كمقروء'));
    expect(onMarkAllRead).toHaveBeenCalledTimes(1);
  });

  it('disables mark all read when hasUnread is false', async () => {
    const onTabChange = jest.fn();
    const onMarkAllRead = jest.fn();

    const { findByText } = await render(
      <NotificationTabs
        activeTab="ALL"
        onTabChange={onTabChange}
        hasUnread={false}
        onMarkAllRead={onMarkAllRead}
      />,
    );

    const markAllBtn = await findByText('تحديد الكل كمقروء');
    expect(markAllBtn).toBeTruthy();

    fireEvent.press(markAllBtn);
    expect(onMarkAllRead).not.toHaveBeenCalled();
  });
});
