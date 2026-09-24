import { fireEvent, render } from '@testing-library/react-native';

import AlertsOptionsMenu from '../AlertsOptionsMenu';

describe('AlertsOptionsMenu', () => {
  it('renders nothing when visible is false', async () => {
    const { queryByText } = await render(
      <AlertsOptionsMenu
        visible={false}
        onClose={jest.fn()}
        onDeleteAllPress={jest.fn()}
      />,
    );

    expect(queryByText('حذف جميع التنبيهات')).toBeNull();
  });

  it('renders menu item when visible is true', async () => {
    const { getByText } = await render(
      <AlertsOptionsMenu
        visible={true}
        onClose={jest.fn()}
        onDeleteAllPress={jest.fn()}
      />,
    );

    expect(getByText('حذف جميع التنبيهات')).toBeTruthy();
  });

  it('calls onDeleteAllPress and onClose when menu item is pressed', async () => {
    const onClose = jest.fn();
    const onDeleteAllPress = jest.fn();

    const { getByTestId } = await render(
      <AlertsOptionsMenu
        visible={true}
        onClose={onClose}
        onDeleteAllPress={onDeleteAllPress}
      />,
    );

    fireEvent.press(getByTestId('delete-all-alerts-menu-item'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onDeleteAllPress).toHaveBeenCalledTimes(1);
  });
});
