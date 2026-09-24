import { fireEvent, render } from '@testing-library/react-native';

import NotificationDeleteToast from '../NotificationDeleteToast';

describe('NotificationDeleteToast', () => {
  it('renders toast with undo button and triggers onUndo', async () => {
    const onUndo = jest.fn();
    const onDismiss = jest.fn();

    const { getByText } = await render(
      <NotificationDeleteToast
        visible={true}
        onUndo={onUndo}
        onDismiss={onDismiss}
        duration={2000}
      />,
    );

    expect(getByText('تم حذف الإشعار')).toBeTruthy();
    const undoButton = getByText('تراجع');
    expect(undoButton).toBeTruthy();

    fireEvent.press(undoButton);
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when visible is false', async () => {
    const { queryByText } = await render(
      <NotificationDeleteToast
        visible={false}
        onUndo={jest.fn()}
        onDismiss={jest.fn()}
      />,
    );

    expect(queryByText('تم حذف الإشعار')).toBeNull();
  });
});
