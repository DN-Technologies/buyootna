import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import {
  AppNotification,
  notificationsService,
} from '@/shared/api/notifications.service';

import { useNotificationList } from '../useNotificationList';

jest.mock('@/shared/api/notifications.service', () => ({
  notificationsService: {
    list: jest.fn(),
    markAsRead: jest.fn(),
    markAsUnread: jest.fn(),
    markAllAsRead: jest.fn(),
    remove: jest.fn(),
  },
}));

jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: (selector: (s: { token: string }) => unknown) =>
    selector({ token: 'tok' }),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

const readNotification: AppNotification = {
  id: 'n1',
  userId: 'u1',
  type: 'ALERT_MATCH',
  title: 't',
  body: 'b',
  identityId: null,
  isRead: true,
  createdAt: '2026-09-24T00:00:00.000Z',
};

async function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const utils = await renderHook(() => useNotificationList(), { wrapper });
  await waitFor(() => expect(utils.result.current.isLoading).toBe(false));
  return utils;
}

describe('useNotificationList read toggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (notificationsService.list as jest.Mock).mockResolvedValue([
      readNotification,
    ]);
  });

  it('marks a read notification as unread', async () => {
    (notificationsService.markAsUnread as jest.Mock).mockResolvedValue(
      undefined,
    );
    const { result } = await setup();

    await act(() => result.current.handleToggleRead(readNotification));

    expect(notificationsService.markAsUnread).toHaveBeenCalledWith('n1');
    await waitFor(() => {
      expect(result.current.notifications[0].isRead).toBe(false);
      expect(result.current.hasUnread).toBe(true);
    });
  });

  it('marks an unread notification as read', async () => {
    (notificationsService.markAsRead as jest.Mock).mockResolvedValue(undefined);
    const { result } = await setup();

    await act(() =>
      result.current.handleToggleRead({ ...readNotification, isRead: false }),
    );

    expect(notificationsService.markAsRead).toHaveBeenCalledWith('n1');
  });

  it('reverts the optimistic change when the request fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    (notificationsService.markAsUnread as jest.Mock).mockRejectedValue(
      new Error('offline'),
    );
    const { result } = await setup();

    await act(() => result.current.handleToggleRead(readNotification));

    await waitFor(() =>
      expect(result.current.notifications[0].isRead).toBe(true),
    );
  });
});
