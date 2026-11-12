import { act, renderHook } from '@testing-library/react-native';
import { Keyboard, type LayoutChangeEvent, type ScrollView } from 'react-native';

import { useScrollFieldAboveKeyboard } from '@/shared/hooks/useScrollFieldAboveKeyboard';

// QA: in «طلب عرض سعر» the keyboard covered «وصف» while typing
const layoutAt = (y: number) =>
  ({ nativeEvent: { layout: { x: 0, y, width: 300, height: 130 } } }) as LayoutChangeEvent;

function setup() {
  const scrollTo = jest.fn();
  const ref = { current: { scrollTo } as unknown as ScrollView };
  const listeners: Record<string, () => void> = {};
  const remove = jest.fn();
  jest.spyOn(Keyboard, 'addListener').mockImplementation(((
    event: string,
    cb: () => void,
  ) => {
    listeners[event] = cb;
    return { remove };
  }) as unknown as typeof Keyboard.addListener);
  return { scrollTo, ref, listeners, remove };
}

afterEach(() => jest.restoreAllMocks());

describe('useScrollFieldAboveKeyboard', () => {
  it('scrolls the field into view once the keyboard is up', async () => {
    const { scrollTo, ref, listeners } = setup();
    jest.spyOn(Keyboard, 'isVisible').mockReturnValue(false);
    const { result } = await renderHook(() => useScrollFieldAboveKeyboard(ref));

    await act(async () => {
      result.current.onLayout(layoutAt(520));
      result.current.onFocus();
    });
    expect(scrollTo).not.toHaveBeenCalled();

    await act(async () => listeners.keyboardDidShow());
    expect(scrollTo).toHaveBeenCalledWith({ y: 488, animated: true });
  });

  it('scrolls at once when the keyboard is already up', async () => {
    const { scrollTo, ref } = setup();
    jest.spyOn(Keyboard, 'isVisible').mockReturnValue(true);
    const { result } = await renderHook(() => useScrollFieldAboveKeyboard(ref));

    await act(async () => {
      result.current.onLayout(layoutAt(10));
      result.current.onFocus();
    });
    expect(scrollTo).toHaveBeenCalledWith({ y: 0, animated: true });
  });

  it('stops waiting for the keyboard when the screen closes', async () => {
    const { ref, remove } = setup();
    jest.spyOn(Keyboard, 'isVisible').mockReturnValue(false);
    const { result, unmount } = await renderHook(() =>
      useScrollFieldAboveKeyboard(ref),
    );
    await act(async () => result.current.onFocus());
    await act(async () => unmount());
    expect(remove).toHaveBeenCalled();
  });
});
