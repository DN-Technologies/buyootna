import { fireEvent, render, waitFor } from '@testing-library/react-native';

import AvatarPill from '../AvatarPill';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
// Focus is a mount here (an effect, as on screen, not during render)
jest.mock('@react-navigation/native', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');
  return { useFocusEffect: (effect: () => void) => useEffect(effect, [effect]) };
});
jest.mock('expo-image', () => ({ Image: 'Image' }));
// The swipe and the animation are native; here, what the taps do
jest.mock('react-native-gesture-handler', () => {
  const chain: Record<string, unknown> = {};
  for (const m of ['activeOffsetX', 'onEnd']) chain[m] = () => chain;
  return {
    GestureDetector: ({ children }: { children: unknown }) => children,
    Gesture: { Pan: () => chain },
  };
});
jest.mock('react-native-reanimated', () => ({
  runOnJS: (fn: unknown) => fn,
}));
jest.mock('@/shared/hooks/auth/useIdentity', () => ({
  useIdentity: () => ({ avatarUrl: 'https://cdn.example/me.jpg' }),
}));

let mockToken: string | null = 'token';
jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: (
    select: (s: { token: string | null; activeIdentity: { id: string } }) => unknown,
  ) => select({ token: mockToken, activeIdentity: { id: 'me' } }),
}));

const mockBadge = jest.fn();
const mockUnread = jest.fn();
jest.mock('@/shared/api/notifications.service', () => ({
  notificationsService: {
    getBadge: () => mockBadge(),
    getUnreadCount: () => mockUnread(),
  },
}));

const sheet = () => {
  const present = jest.fn();
  return { ref: { current: { present } } as never, present };
};

describe('AvatarPill', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToken = 'token';
    mockBadge.mockResolvedValue(3); // 2 notifications + 1 chat
    mockUnread.mockResolvedValue(2);
  });

  it('closed, it counts unread notifications and chats together', async () => {
    const screen = await render(<AvatarPill authSheetRef={sheet().ref} />);
    await waitFor(() =>
      expect(screen.getByTestId('avatar-pill-count')).toHaveTextContent('3'),
    );
    expect(screen.queryByTestId('avatar-pill-chats')).toBeNull();
  });

  it('shows no count when nothing is unread', async () => {
    mockBadge.mockResolvedValue(0);
    mockUnread.mockResolvedValue(0);
    const screen = await render(<AvatarPill authSheetRef={sheet().ref} />);
    await waitFor(() => expect(mockBadge).toHaveBeenCalled());
    expect(screen.queryByTestId('avatar-pill-count')).toBeNull();
  });

  it('opens to chats and notifications, each routing; › closes it', async () => {
    const screen = await render(<AvatarPill authSheetRef={sheet().ref} />);
    await waitFor(() => screen.getByTestId('avatar-pill-count'));
    await fireEvent.press(screen.getByTestId('avatar-pill-toggle'));

    expect(screen.queryByTestId('avatar-pill-count')).toBeNull();
    expect(screen.getByTestId('avatar-pill-notifications-dot')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('avatar-pill-chats'));
    expect(mockPush).toHaveBeenCalledWith('/chat');
    await fireEvent.press(screen.getByTestId('avatar-pill-notifications'));
    expect(mockPush).toHaveBeenCalledWith('/notification-list');

    await fireEvent.press(screen.getByTestId('avatar-pill-toggle'));
    expect(screen.queryByTestId('avatar-pill-chats')).toBeNull();
  });

  it('signed out, a tap asks to sign in', async () => {
    mockToken = null;
    const { ref, present } = sheet();
    const screen = await render(<AvatarPill authSheetRef={ref} />);
    await fireEvent.press(screen.getByTestId('avatar-pill-photo'));
    expect(present).toHaveBeenCalled();
    expect(screen.queryByTestId('avatar-pill-chats')).toBeNull();
    expect(mockBadge).not.toHaveBeenCalled();
  });
});
