import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import AvatarPill, { timeOfDayGlyph } from '../AvatarPill';

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

const mockPulse = jest.fn();
jest.mock('@/shared/api/pulse.service', () => ({
  pulseService: { getMine: () => mockPulse() },
}));

const mockSwitch = jest.fn();

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
    mockPulse.mockResolvedValue([]);
  });

  it('closed, it counts unread notifications and chats together', async () => {
    const screen = await render(<AvatarPill authSheetRef={sheet().ref} onSwitchProfile={mockSwitch} />);
    await waitFor(() =>
      expect(screen.getByTestId('avatar-pill-count')).toHaveTextContent('3'),
    );
    expect(screen.getByTestId('avatar-pill-actions', { includeHiddenElements: true }).props.pointerEvents).toBe(
      'none',
    );
  });

  it('shows no count when nothing is unread, but the time of day', async () => {
    mockBadge.mockResolvedValue(0);
    mockUnread.mockResolvedValue(0);
    const screen = await render(<AvatarPill authSheetRef={sheet().ref} onSwitchProfile={mockSwitch} />);
    await waitFor(() => expect(mockBadge).toHaveBeenCalled());
    expect(screen.queryByTestId('avatar-pill-count')).toBeNull();
    expect(screen.getByTestId('avatar-pill-time')).toBeTruthy();
    expect(screen.queryByTestId('pulse-notch')).toBeNull();
  });

  it('the time of day: sun by day, sunset in the evening, moon at night', () => {
    expect(timeOfDayGlyph(5).icon).toBe('sun');
    expect(timeOfDayGlyph(16).icon).toBe('sun');
    expect(timeOfDayGlyph(17).icon).toBe('sunset');
    expect(timeOfDayGlyph(19).icon).toBe('sunset');
    expect(timeOfDayGlyph(20).icon).toBe('moon');
    expect(timeOfDayGlyph(0).icon).toBe('moon');
    expect(timeOfDayGlyph(4).icon).toBe('moon');
  });

  it('nothing unread: the notch shows the pulse, and opens the quick view', async () => {
    mockBadge.mockResolvedValue(0);
    mockUnread.mockResolvedValue(0);
    mockPulse.mockResolvedValue([
      { kind: 'requestOffers', count: 2, refId: 'r1', tone: 'gold' },
      { kind: 'alertMatches', count: 4, refId: null, tone: 'gold' },
    ]);
    const screen = await render(<AvatarPill authSheetRef={sheet().ref} onSwitchProfile={mockSwitch} />);
    await waitFor(() => screen.getByTestId('pulse-notch-requestOffers'));
    expect(screen.queryByTestId('avatar-pill-time')).toBeNull();
    expect(screen.queryByTestId('pulse-quick-view')).toBeNull();

    await fireEvent.press(screen.getByTestId('pulse-notch'));
    expect(screen.getByTestId('pulse-quick-view')).toBeTruthy();
    expect(screen.getByTestId('pulse-row-requestOffers')).toHaveTextContent(/2 عروض على طلباتك/);
    await fireEvent.press(screen.getByTestId('pulse-row-alertMatches'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/(individual)/activity',
      params: { tab: 'alerts' },
    });
    expect(screen.queryByTestId('pulse-quick-view')).toBeNull();
  });

  it('a tap outside closes the quick view', async () => {
    mockBadge.mockResolvedValue(0);
    mockUnread.mockResolvedValue(0);
    mockPulse.mockResolvedValue([{ kind: 'adExpiring', count: 1, refId: 'p1', daysLeft: 0, tone: 'amber' }]);
    const screen = await render(<AvatarPill authSheetRef={sheet().ref} onSwitchProfile={mockSwitch} />);
    await waitFor(() => screen.getByTestId('pulse-notch'));
    await fireEvent.press(screen.getByTestId('pulse-notch'));
    await fireEvent.press(screen.getByTestId('pulse-quick-view-backdrop'));
    expect(screen.queryByTestId('pulse-quick-view')).toBeNull();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('the red count wins over the pulse', async () => {
    mockPulse.mockResolvedValue([{ kind: 'alertMatches', count: 4, refId: 'a1', tone: 'gold' }]);
    const screen = await render(<AvatarPill authSheetRef={sheet().ref} onSwitchProfile={mockSwitch} />);
    await waitFor(() => expect(screen.getByTestId('avatar-pill-count')).toHaveTextContent('3'));
    await waitFor(() => expect(mockPulse).toHaveBeenCalled());
    expect(screen.queryByTestId('pulse-notch')).toBeNull();
    expect(screen.queryByTestId('avatar-pill-time')).toBeNull();
  });

  it('an API without the pulse still shows the unread count', async () => {
    mockPulse.mockRejectedValue(new Error('404'));
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const screen = await render(<AvatarPill authSheetRef={sheet().ref} onSwitchProfile={mockSwitch} />);
    await waitFor(() => expect(screen.getByTestId('avatar-pill-count')).toHaveTextContent('3'));
    warn.mockRestore();
  });

  it('opens to chats and notifications, each routing; › closes it', async () => {
    const screen = await render(<AvatarPill authSheetRef={sheet().ref} onSwitchProfile={mockSwitch} />);
    await waitFor(() => screen.getByTestId('avatar-pill-count'));
    await fireEvent.press(screen.getByTestId('avatar-pill-toggle'));

    expect(screen.getByTestId('avatar-pill-actions', { includeHiddenElements: true }).props.pointerEvents).toBe(
      'auto',
    );
    expect(screen.getByTestId('avatar-pill-notifications-dot')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('avatar-pill-chats'));
    expect(mockPush).toHaveBeenCalledWith('/chat');
    await fireEvent.press(screen.getByTestId('avatar-pill-notifications'));
    expect(mockPush).toHaveBeenCalledWith('/notification-list');

    await fireEvent.press(screen.getByTestId('avatar-pill-toggle'));
    expect(screen.getByTestId('avatar-pill-actions', { includeHiddenElements: true }).props.pointerEvents).toBe(
      'none',
    );
  });

  it('one tap on the photo opens it; two switch profile instead', async () => {
    jest.useFakeTimers();
    try {
      const screen = await render(
        <AvatarPill authSheetRef={sheet().ref} onSwitchProfile={mockSwitch} />,
      );
      const actions = () =>
        screen.getByTestId('avatar-pill-actions', { includeHiddenElements: true })
          .props.pointerEvents;

      await fireEvent.press(screen.getByTestId('avatar-pill-photo'));
      await fireEvent.press(screen.getByTestId('avatar-pill-photo'));
      await act(() => jest.advanceTimersByTime(400));
      expect(mockSwitch).toHaveBeenCalledTimes(1);
      expect(actions()).toBe('none');

      await fireEvent.press(screen.getByTestId('avatar-pill-photo'));
      await act(() => jest.advanceTimersByTime(400));
      expect(actions()).toBe('auto');
      expect(mockSwitch).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it('signed out, a tap asks to sign in', async () => {
    mockToken = null;
    const { ref, present } = sheet();
    const screen = await render(<AvatarPill authSheetRef={ref} onSwitchProfile={mockSwitch} />);
    await fireEvent.press(screen.getByTestId('avatar-pill-toggle'));
    expect(present).toHaveBeenCalled();
    expect(screen.getByTestId('avatar-pill-actions', { includeHiddenElements: true }).props.pointerEvents).toBe(
      'none',
    );
    expect(mockBadge).not.toHaveBeenCalled();
    expect(mockPulse).not.toHaveBeenCalled();
    expect(screen.queryByTestId('avatar-pill-time')).toBeNull();
    expect(screen.queryByTestId('pulse-notch')).toBeNull();
  });
});
