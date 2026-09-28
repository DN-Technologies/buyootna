import { fireEvent, render } from '@testing-library/react-native';

import AdsOptionsMenu from '../AdsOptionsMenu';

describe('AdsOptionsMenu', () => {
  it('renders nothing when visible is false', async () => {
    const { queryByText } = await render(
      <AdsOptionsMenu
        visible={false}
        onClose={jest.fn()}
        onToggleVisibilityPress={jest.fn()}
        onDeleteAllPress={jest.fn()}
      />,
    );

    expect(queryByText('اخفاء جميع الاعلانات')).toBeNull();
    expect(queryByText('حذف الكل')).toBeNull();
  });

  it('renders hide ads and delete all when visible is true and allHidden is false', async () => {
    const { getByText, queryByText } = await render(
      <AdsOptionsMenu
        visible={true}
        onClose={jest.fn()}
        allHidden={false}
        onToggleVisibilityPress={jest.fn()}
        onDeleteAllPress={jest.fn()}
      />,
    );

    expect(getByText('اخفاء جميع الاعلانات')).toBeTruthy();
    expect(queryByText('اظهار جميع الاعلانات')).toBeNull();
    expect(getByText('حذف الكل')).toBeTruthy();
  });

  it('renders show ads when allHidden is true', async () => {
    const { getByText, queryByText } = await render(
      <AdsOptionsMenu
        visible={true}
        onClose={jest.fn()}
        allHidden={true}
        onToggleVisibilityPress={jest.fn()}
        onDeleteAllPress={jest.fn()}
      />,
    );

    expect(getByText('اظهار جميع الاعلانات')).toBeTruthy();
    expect(queryByText('اخفاء جميع الاعلانات')).toBeNull();
    expect(getByText('حذف الكل')).toBeTruthy();
  });

  it('calls onToggleVisibilityPress and onClose when toggle option is pressed', async () => {
    const onClose = jest.fn();
    const onToggleVisibilityPress = jest.fn();

    const { getByTestId } = await render(
      <AdsOptionsMenu
        visible={true}
        onClose={onClose}
        onToggleVisibilityPress={onToggleVisibilityPress}
        onDeleteAllPress={jest.fn()}
      />,
    );

    await fireEvent.press(getByTestId('toggle-visibility-menu-item'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onToggleVisibilityPress).toHaveBeenCalledTimes(1);
  });

  it('calls onDeleteAllPress and onClose when delete all option is pressed', async () => {
    const onClose = jest.fn();
    const onDeleteAllPress = jest.fn();

    const { getByTestId } = await render(
      <AdsOptionsMenu
        visible={true}
        onClose={onClose}
        onToggleVisibilityPress={jest.fn()}
        onDeleteAllPress={onDeleteAllPress}
      />,
    );

    await fireEvent.press(getByTestId('delete-all-ads-menu-item'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onDeleteAllPress).toHaveBeenCalledTimes(1);
  });

  it('disables options when disabled is true', async () => {
    const onToggleVisibilityPress = jest.fn();
    const onDeleteAllPress = jest.fn();

    const { getByTestId } = await render(
      <AdsOptionsMenu
        visible={true}
        onClose={jest.fn()}
        disabled={true}
        onToggleVisibilityPress={onToggleVisibilityPress}
        onDeleteAllPress={onDeleteAllPress}
      />,
    );

    const toggleItem = getByTestId('toggle-visibility-menu-item');
    const deleteItem = getByTestId('delete-all-ads-menu-item');

    expect(toggleItem).toBeDisabled();
    expect(deleteItem).toBeDisabled();

    await fireEvent.press(toggleItem);
    await fireEvent.press(deleteItem);

    expect(onToggleVisibilityPress).not.toHaveBeenCalled();
    expect(onDeleteAllPress).not.toHaveBeenCalled();
  });
});
