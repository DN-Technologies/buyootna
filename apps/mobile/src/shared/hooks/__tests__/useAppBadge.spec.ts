import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import { AppState } from 'react-native';

import { notificationsService } from '@/shared/api/notifications.service';
import { syncAppBadge, useAppBadge } from '@/shared/hooks/useAppBadge';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useChatStore } from '@/shared/store/useChatStore';

// The real module (jest.setup.js mocks its scheduler for every other file)
jest.unmock('@/shared/hooks/useAppBadge');
jest.mock('expo-notifications', () => ({
  setBadgeCountAsync: jest.fn(async () => true),
}));
jest.mock('@/shared/api/notifications.service', () => ({
  notificationsService: { getBadge: jest.fn() },
}));
jest.mock('@/shared/store/useAuthStore', () => {
  const state = { token: 'jwt' as string | null, activeIdentity: { id: 'i1' } };
  const useAuthStore = Object.assign(
    (selector: (s: typeof state) => unknown) => selector(state),
    { getState: () => state, __state: state },
  );
  return { useAuthStore };
});
jest.mock('@/shared/store/useChatStore', () => {
  const listeners = new Set<() => void>();
  const state = { conversations: [] as { unreadCount: number }[] };
  return {
    useChatStore: {
      getState: () => state,
      subscribe: (fn: () => void) => {
        listeners.add(fn);
        return () => listeners.delete(fn);
      },
      __set: (conversations: { unreadCount: number }[]) => {
        state.conversations = conversations;
        listeners.forEach((fn) => fn());
      },
    },
  };
});

const authState = (useAuthStore as unknown as { __state: { token: string | null } }).__state;
const setChats = (useChatStore as unknown as { __set: (c: { unreadCount: number }[]) => void }).__set;

describe('app icon badge', () => {
  let appStateListener: (state: string) => void;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    authState.token = 'jwt';
    (notificationsService.getBadge as jest.Mock).mockResolvedValue(7);
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, fn) => {
      appStateListener = fn as (state: string) => void;
      return { remove: jest.fn() } as never;
    });
  });

  it('shows what is unread on the server', async () => {
    await syncAppBadge();
    expect(Notifications.setBadgeCountAsync).toHaveBeenCalledWith(7);
  });

  it('clears the number when signed out, without asking the server', async () => {
    authState.token = null;
    await syncAppBadge();
    expect(Notifications.setBadgeCountAsync).toHaveBeenCalledWith(0);
    expect(notificationsService.getBadge).not.toHaveBeenCalled();
  });

  it('syncs on sign-in, when leaving the app, and when unread chats change', async () => {
    jest.useFakeTimers();
    await renderHook(() => useAppBadge('jwt'));
    await waitFor(() => expect(notificationsService.getBadge).toHaveBeenCalledTimes(1));

    await act(async () => appStateListener('background'));
    expect(notificationsService.getBadge).toHaveBeenCalledTimes(2);

    // Two chats read close together: one sync
    await act(async () => {
      setChats([{ unreadCount: 3 }]);
      setChats([{ unreadCount: 0 }]);
      jest.advanceTimersByTime(900);
    });
    expect(notificationsService.getBadge).toHaveBeenCalledTimes(3);
    jest.useRealTimers();
  });

  it('a failed sync never throws', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    (notificationsService.getBadge as jest.Mock).mockRejectedValue(new Error('offline'));
    await expect(syncAppBadge()).resolves.toBeUndefined();
  });
});
