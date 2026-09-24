import { fireEvent, render } from '@testing-library/react-native';

import { AppNotification } from '@/shared/api/notifications.service';

import NotificationOptionsMenu from '../NotificationOptionsMenu';

const mockNotification: AppNotification = {
  id: 'notif-1',
  userId: 'user-1',
  type: 'IDENTITY_APPROVED',
  title: 'عقار جديد',
  body: 'تفاصيل العقار',
  identityId: null,
  isRead: false,
  createdAt: new Date().toISOString(),
};

describe('NotificationOptionsMenu', () => {
  it('renders mark as read and delete actions, and triggers callbacks', async () => {
    const onMarkAsRead = jest.fn();
    const onDelete = jest.fn();
    const onClose = jest.fn();

    const { getByText } = await render(
      <NotificationOptionsMenu
        visible={true}
        notification={mockNotification}
        anchorY={200}
        onClose={onClose}
        onMarkAsRead={onMarkAsRead}
        onDelete={onDelete}
      />,
    );

    const markReadBtn = getByText('تعليم كمقروء');
    const deleteBtn = getByText('حذف');

    expect(markReadBtn).toBeTruthy();
    expect(deleteBtn).toBeTruthy();

    fireEvent.press(markReadBtn);
    expect(onClose).toHaveBeenCalled();
    expect(onMarkAsRead).toHaveBeenCalledWith(mockNotification);

    fireEvent.press(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith(mockNotification);
  });

  it('renders nothing when visible is false', async () => {
    const { queryByText } = await render(
      <NotificationOptionsMenu
        visible={false}
        notification={mockNotification}
        onClose={jest.fn()}
        onMarkAsRead={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(queryByText('تعليم كمقروء')).toBeNull();
    expect(queryByText('حذف')).toBeNull();
  });
});
