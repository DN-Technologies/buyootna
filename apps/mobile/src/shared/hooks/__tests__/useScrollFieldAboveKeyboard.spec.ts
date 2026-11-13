import { act, renderHook } from '@testing-library/react-native';
import { Keyboard, type LayoutChangeEvent } from 'react-native';

import { useScrollFieldAboveKeyboard } from '@/shared/hooks/useScrollFieldAboveKeyboard';

// QA: the keyboard covered «وصف» while typing a quote request
const layoutAt = (y: number) =>
  ({ nativeEvent: { layout: { x: 0, y, width: 300, height: 130 } } }) as LayoutChangeEvent;

type Listener = (e?: { endCoordinates: { height: number } }) => void;

function setup(visible: boolean) {
  const scrollTo = jest.fn();
  const ref = { current: { scrollTo } };
  const listeners: Record<string, Listener[]> = {};
  const remove = jest.fn();
  jest.spyOn(Keyboard, 'addListener').mockImplementation(((
    event: string,
    cb: Listener,
  ) => {
    (listeners[event] ??= []).push(cb);
    return { remove };
  }) as unknown as typeof Keyboard.addListener);
  jest.spyOn(Keyboard, 'isVisible').mockReturnValue(visible);
  const fire = (event: string, height = 0) =>
    act(async () => {
      for (const cb of listeners[event] ?? []) cb({ endCoordinates: { height } });
    });
  return { scrollTo, ref, fire, remove };
}

const settle = () =>
  act(async () => {
    jest.advanceTimersByTime(100);
  });

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('useScrollFieldAboveKeyboard', () => {
  it('scrolls the field into view once the keyboard is up', async () => {
    const { scrollTo, ref, fire } = setup(false);
    const { result } = await renderHook(() => useScrollFieldAboveKeyboard(ref));

    await act(async () => {
      result.current.onLayout(layoutAt(520));
      result.current.onFocus();
    });
    await settle();
    expect(scrollTo).not.toHaveBeenCalled();

    await fire('keyboardDidShow', 336);
    await settle();
    expect(scrollTo).toHaveBeenCalledWith({ y: 488, animated: true });
  });

  it('scrolls at once when the keyboard is already up', async () => {
    const { scrollTo, ref } = setup(true);
    const { result } = await renderHook(() => useScrollFieldAboveKeyboard(ref));

    await act(async () => {
      result.current.onLayout(layoutAt(10));
      result.current.onFocus();
    });
    await settle();
    expect(scrollTo).toHaveBeenCalledWith({ y: 0, animated: true });
  });

  // A bottom sheet doesn't shrink: it pads by this so the field can rise
  it("gives the keyboard's height while it is up", async () => {
    const { ref, fire } = setup(false);
    const { result } = await renderHook(() => useScrollFieldAboveKeyboard(ref));
    expect(result.current.keyboardSpace).toBe(0);

    await fire('keyboardDidShow', 336);
    expect(result.current.keyboardSpace).toBe(336);
    await fire('keyboardDidHide');
    expect(result.current.keyboardSpace).toBe(0);
  });

  it('stops listening when the screen closes', async () => {
    const { ref, remove } = setup(false);
    const { result, unmount } = await renderHook(() =>
      useScrollFieldAboveKeyboard(ref),
    );
    await act(async () => result.current.onFocus());
    await act(async () => unmount());
    expect(remove).toHaveBeenCalledTimes(3);
  });
});
