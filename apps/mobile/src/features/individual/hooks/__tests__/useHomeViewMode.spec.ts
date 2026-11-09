// QA: the home list's view switch reset every time the app was reopened.
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  act,
  cleanup,
  renderHook,
  waitFor,
} from '@testing-library/react-native';

import { resetHomeViewModeForTests, useHomeViewMode } from '../useHomeViewMode';

const mockStore = new Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn() },
}));
const getItem = AsyncStorage.getItem as jest.Mock;
const setItem = AsyncStorage.setItem as jest.Mock;

// A fresh launch: this session's memory gone, the device's storage kept
const relaunch = () => resetHomeViewModeForTests();

describe('useHomeViewMode', () => {
  beforeEach(() => {
    mockStore.clear();
    relaunch();
    getItem.mockReset();
    setItem.mockReset();
    getItem.mockImplementation((key: string) =>
      Promise.resolve(mockStore.get(key) ?? null),
    );
    setItem.mockImplementation((key: string, value: string) => {
      mockStore.set(key, value);
      return Promise.resolve();
    });
  });

  it('opens on the quick list the first time', async () => {
    const { result } = await renderHook(() => useHomeViewMode());
    await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalled());
    expect(result.current[0]).toBe('list');
  });

  it('remembers the photos view after the app is closed and reopened', async () => {
    const first = await renderHook(() => useHomeViewMode());
    await act(async () => first.result.current[1]('card'));
    expect(mockStore.get('home:viewMode')).toBe('card');
    await cleanup();

    relaunch();
    const reopened = await renderHook(() => useHomeViewMode());
    await waitFor(() => expect(reopened.result.current[0]).toBe('card'));
  });

  it('and switching back to the list is remembered too', async () => {
    mockStore.set('home:viewMode', 'card');
    const first = await renderHook(() => useHomeViewMode());
    await waitFor(() => expect(first.result.current[0]).toBe('card'));
    await act(async () => first.result.current[1]('list'));
    await cleanup();

    relaunch();
    const reopened = await renderHook(() => useHomeViewMode());
    await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalledTimes(2));
    expect(reopened.result.current[0]).toBe('list');
  });

  it('shows the choice at once when home opens again in the same session', async () => {
    const first = await renderHook(() => useHomeViewMode());
    await act(async () => first.result.current[1]('card'));
    await cleanup();

    const again = await renderHook(() => useHomeViewMode());
    // No wait for storage: the first render already has it
    expect(again.result.current[0]).toBe('card');
  });

  it('ignores anything else stored under the key', async () => {
    mockStore.set('home:viewMode', 'grid');
    const { result } = await renderHook(() => useHomeViewMode());
    await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalled());
    expect(result.current[0]).toBe('list');
  });

  it('a tap before the saved view loads is kept', async () => {
    mockStore.set('home:viewMode', 'list');
    let release: () => void = () => {};
    getItem.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          release = () => resolve('list');
        }),
    );
    const { result } = await renderHook(() => useHomeViewMode());
    await act(async () => result.current[1]('card'));
    await act(async () => release());

    expect(result.current[0]).toBe('card');
  });

  it('works when storage throws outright (no native module)', async () => {
    getItem.mockImplementationOnce(() => {
      throw new Error('AsyncStorage is null');
    });
    setItem.mockImplementationOnce(() => {
      throw new Error('AsyncStorage is null');
    });
    const { result } = await renderHook(() => useHomeViewMode());
    await waitFor(() => expect(getItem).toHaveBeenCalled());
    expect(result.current[0]).toBe('list');
    await act(async () => result.current[1]('card'));
    expect(result.current[0]).toBe('card');
  });

  it('works when storage fails (the list, and no crash)', async () => {
    getItem.mockRejectedValueOnce(new Error('io'));
    setItem.mockRejectedValueOnce(new Error('io'));
    const { result } = await renderHook(() => useHomeViewMode());
    await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalled());
    expect(result.current[0]).toBe('list');
    await act(async () => result.current[1]('card'));
    expect(result.current[0]).toBe('card');
  });
});
