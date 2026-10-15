import { renderHook } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTabBarHeight } from '../useTabBarHeight';

const setPlatform = (os: 'ios' | 'android') =>
  Object.defineProperty(Platform, 'OS', { get: () => os, configurable: true });
const withBottomInset = (bottom: number) =>
  (useSafeAreaInsets as jest.Mock).mockReturnValue({ top: 0, bottom, left: 0, right: 0 });

describe('useTabBarHeight', () => {
  const originalOS = Platform.OS;
  afterAll(() => setPlatform(originalOS as 'ios' | 'android'));

  // QA (Galaxy A36): the system's navigation bar covered the tabs. Drawing
  // edge to edge, the tabs must sit above its real height
  it('leaves room for the 3-button navigation bar on Android', async () => {
    setPlatform('android');
    withBottomInset(48);
    const { result } = await renderHook(() => useTabBarHeight());

    expect(result.current.bottomInset).toBe(48);
    expect(result.current.tabBarHeight).toBe(60 + 48);
    expect(result.current.scrollContentBottomPadding).toBe(60 + 48 + 40);
  });

  it('keeps at least the design 16px on Android with gesture navigation or none', async () => {
    setPlatform('android');
    withBottomInset(0);
    const { result } = await renderHook(() => useTabBarHeight());

    expect(result.current.bottomInset).toBe(16);
    expect(result.current.tabBarHeight).toBe(76);
  });

  it('keeps the iPhone home-indicator inset as it was', async () => {
    setPlatform('ios');
    withBottomInset(34);
    const { result } = await renderHook(() => useTabBarHeight());

    expect(result.current.bottomInset).toBe(34);
    expect(result.current.tabBarHeight).toBe(94);
  });
});
