import { fireEvent, render } from '@testing-library/react-native';

import UndoToast from '../UndoToast';

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  // An iPhone with a Dynamic Island
  useSafeAreaInsets: () => ({ top: 47, bottom: 34, left: 0, right: 0 }),
}));

describe('UndoToast', () => {
  // QA: «تم إخفاء الخدمة بنجاح» sat under the clock and the Dynamic Island
  it('sits below the status bar', async () => {
    const { getByTestId } = await render(
      <UndoToast
        visible
        message="تم إخفاء الخدمة بنجاح."
        onUndo={jest.fn()}
        onDismiss={jest.fn()}
      />,
    );
    expect(getByTestId('undo-toast')).toHaveStyle({ top: 55 });
  });

  it('«تراجع» undoes', async () => {
    const onUndo = jest.fn();
    const { getByTestId } = await render(
      <UndoToast visible message="x" onUndo={onUndo} onDismiss={jest.fn()} />,
    );
    await fireEvent.press(getByTestId('undo-toast-undo'));
    expect(onUndo).toHaveBeenCalled();
  });
});
