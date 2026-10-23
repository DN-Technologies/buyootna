import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import HomeTopBar from '../HomeTopBar';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('@react-navigation/native', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');
  return { useFocusEffect: (effect: () => void) => useEffect(effect, [effect]) };
});
jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('react-native-gesture-handler', () => {
  const chain: Record<string, unknown> = {};
  for (const m of ['activeOffsetX', 'onEnd']) chain[m] = () => chain;
  return {
    GestureDetector: ({ children }: { children: unknown }) => children,
    Gesture: { Pan: () => chain },
  };
});
jest.mock('@/shared/hooks/auth/useIdentity', () => ({
  useIdentity: () => ({ avatarUrl: null }),
}));
jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: (select: (s: unknown) => unknown) =>
    select({ token: 't', activeIdentity: { id: 'me' } }),
}));
jest.mock('@/shared/api/notifications.service', () => ({
  notificationsService: {
    getBadge: jest.fn().mockResolvedValue(0),
    getUnreadCount: jest.fn().mockResolvedValue(0),
  },
}));

const renderBar = () =>
  render(
    <HomeTopBar
      mode="home"
      onModeChange={jest.fn()}
      authSheetRef={{ current: null }}
      onSwitchProfile={jest.fn()}
    />,
  );

const layout = (width: number) => ({
  nativeEvent: { layout: { x: 0, y: 0, width, height: 46 } },
});

describe('HomeTopBar', () => {
  it('on a narrow phone the map steps aside while the pill is open', async () => {
    const screen = await renderBar();
    await act(() => {
      fireEvent(screen.getByTestId('home-pill-room'), 'layout', layout(150));
    });
    const map = () => screen.getByTestId('home-map-slot').props.pointerEvents;
    expect(map()).toBe('auto');

    await fireEvent.press(screen.getByTestId('avatar-pill-toggle'));
    await waitFor(() => expect(map()).toBe('none'));

    await fireEvent.press(screen.getByTestId('avatar-pill-toggle'));
    await waitFor(() => expect(map()).toBe('auto'));
  });

  it('where the open pill fits, the map stays', async () => {
    const screen = await renderBar();
    await act(() => {
      fireEvent(screen.getByTestId('home-pill-room'), 'layout', layout(220));
    });
    await fireEvent.press(screen.getByTestId('avatar-pill-toggle'));
    expect(screen.getByTestId('home-map-slot').props.pointerEvents).toBe('auto');
  });
});
