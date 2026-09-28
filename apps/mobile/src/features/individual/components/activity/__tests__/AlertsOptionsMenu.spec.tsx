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

  it('is reused by the ads tab with its own label, and can be disabled', async () => {
    const onDeleteAllPress = jest.fn();

    const { getByTestId, getByText, queryByText } = await render(
      <AlertsOptionsMenu
        visible={true}
        onClose={jest.fn()}
        onDeleteAllPress={onDeleteAllPress}
        deleteAllLabel="حذف جميع الإعلانات"
        deleteAllTestID="delete-all-ads-menu-item"
        deleteAllDisabled
      />,
    );

    expect(getByText('حذف جميع الإعلانات')).toBeTruthy();
    expect(queryByText('حذف جميع التنبيهات')).toBeNull();
    const item = getByTestId('delete-all-ads-menu-item');
    expect(item).toBeDisabled();
    await fireEvent.press(item);
    expect(onDeleteAllPress).not.toHaveBeenCalled();
  });
});
