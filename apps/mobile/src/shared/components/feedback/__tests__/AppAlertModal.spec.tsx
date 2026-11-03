import { act, fireEvent, render } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { useAlertStore } from '@/shared/store/useAlertStore';

import AppAlertModal from '../AppAlertModal';

const open = (onPress: () => void) =>
  act(() => {
    useAlertStore
      .getState()
      .showAlert('خيارات', '', [{ text: 'مشاركة الملف الشخصي', onPress }]);
  });

describe('AppAlertModal button actions', () => {
  const realOS = Platform.OS;

  beforeEach(() => {
    jest.useFakeTimers();
    useAlertStore.setState({ visible: false });
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    Platform.OS = realOS;
  });

  it('iOS: runs the action once the alert has closed, not while it fades', async () => {
    Platform.OS = 'ios';
    const onPress = jest.fn();
    const screen = await render(<AppAlertModal />);
    await open(onPress);

    await fireEvent.press(screen.getByText('مشاركة الملف الشخصي'));
    expect(useAlertStore.getState().visible).toBe(false);
    expect(onPress).not.toHaveBeenCalled();

    // The dismissal (or the fallback timer) runs it, once
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('Android: runs the action at once', async () => {
    Platform.OS = 'android';
    const onPress = jest.fn();
    const screen = await render(<AppAlertModal />);
    await open(onPress);

    await fireEvent.press(screen.getByText('مشاركة الملف الشخصي'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
