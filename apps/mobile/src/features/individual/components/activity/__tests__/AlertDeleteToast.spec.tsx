import { fireEvent, render } from '@testing-library/react-native';

import AlertDeleteToast from '../AlertDeleteToast';

describe('AlertDeleteToast', () => {
  it('renders nothing when not visible', async () => {
    const { queryByText } = await render(
      <AlertDeleteToast
        visible={false}
        onUndo={jest.fn()}
        onDismiss={jest.fn()}
      />,
    );
    expect(queryByText('تم حذف التنبيه بنجاح.')).toBeNull();
  });

  it('renders message and undo button when visible', async () => {
    const { getByText } = await render(
      <AlertDeleteToast
        visible={true}
        onUndo={jest.fn()}
        onDismiss={jest.fn()}
      />,
    );
    expect(getByText('تم حذف التنبيه بنجاح.')).toBeTruthy();
    expect(getByText('تراجع')).toBeTruthy();
  });

  it('triggers onUndo when undo button is pressed', async () => {
    const onUndo = jest.fn();
    const { getByText } = await render(
      <AlertDeleteToast
        visible={true}
        onUndo={onUndo}
        onDismiss={jest.fn()}
      />,
    );
    fireEvent.press(getByText('تراجع'));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });
});
