import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { blocksService } from '@/shared/api/blocks.service';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useChatStore } from '@/shared/store/useChatStore';
import { showAlert } from '@/shared/utils/alert';

import { useBlockFlow, useBlockStatus } from '../useBlocks';

jest.mock('@/shared/api/blocks.service', () => ({
  blocksService: {
    block: jest.fn(),
    unblock: jest.fn(),
    list: jest.fn(),
    status: jest.fn(),
  },
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

type AlertButton = { text: string; onPress?: () => void };
const pressButton = (text: string) => {
  const calls = (showAlert as jest.Mock).mock.calls;
  const buttons = calls[calls.length - 1][2] as AlertButton[];
  buttons.find((b) => b.text === text)?.onPress?.();
};

describe('useBlocks', () => {
  let queryClient: QueryClient;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const loadConversations = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    useAuthStore.setState({ user: { id: 'me' } as never });
    useChatStore.setState({ loadConversations } as never);
    (blocksService.block as jest.Mock).mockResolvedValue({ blocked: true });
    (blocksService.unblock as jest.Mock).mockResolvedValue({ blocked: false });
  });

  it('blocking asks first, then blocks and refreshes the chats, stories and blocks', async () => {
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    const onBlocked = jest.fn();
    const { result } = await renderHook(() => useBlockFlow(), { wrapper });
    await act(async () => result.current.askToBlock({ identityId: 'co-1' }, 'شركة البنيان', onBlocked));

    expect(showAlert).toHaveBeenCalledWith(
      'حظر شركة البنيان؟',
      expect.stringContaining('لن يتمكن من مراسلتك'),
      expect.any(Array),
    );
    expect(blocksService.block).not.toHaveBeenCalled();

    await act(async () => pressButton('حظر'));
    await waitFor(() => expect(onBlocked).toHaveBeenCalled());
    expect(blocksService.block).toHaveBeenCalledWith({ identityId: 'co-1' });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['blocks', 'me'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['stories'] });
    expect(loadConversations).toHaveBeenCalledWith(1);
  });

  it('cancelling blocks nothing and says so to the caller', async () => {
    const onCancel = jest.fn();
    const { result } = await renderHook(() => useBlockFlow(), { wrapper });
    await act(async () => result.current.askToBlock({ userId: 'u2' }, 'أحمد', undefined, onCancel));
    await act(async () => pressButton('إلغاء'));
    expect(onCancel).toHaveBeenCalled();
    expect(blocksService.block).not.toHaveBeenCalled();
  });

  it('a refused block is explained', async () => {
    (blocksService.block as jest.Mock).mockRejectedValue({
      response: { data: { message: 'لا يمكنك حظر حسابك' } },
    });
    const { result } = await renderHook(() => useBlockFlow(), { wrapper });
    await act(async () => result.current.askToBlock({ userId: 'me' }, 'أنا'));
    await act(async () => pressButton('حظر'));
    await waitFor(() =>
      expect(showAlert).toHaveBeenLastCalledWith('خطأ', 'لا يمكنك حظر حسابك'),
    );
  });

  it('unblocking asks first, then unblocks', async () => {
    const onUnblocked = jest.fn();
    const { result } = await renderHook(() => useBlockFlow(), { wrapper });
    await act(async () => result.current.askToUnblock('u2', 'أحمد', onUnblocked));
    expect(showAlert).toHaveBeenCalledWith('إلغاء حظر أحمد؟', expect.any(String), expect.any(Array));
    await act(async () => pressButton('إلغاء الحظر'));
    await waitFor(() => expect(onUnblocked).toHaveBeenCalled());
    expect(blocksService.unblock).toHaveBeenCalledWith('u2');
  });

  it('status: asked only for someone else, null until known', async () => {
    (blocksService.status as jest.Mock).mockResolvedValue({ blocked: true });
    const { result } = await renderHook(() => useBlockStatus('u2'), { wrapper });
    expect(result.current).toBeNull();
    await waitFor(() => expect(result.current).toBe(true));
    (blocksService.status as jest.Mock).mockClear();
    await renderHook(() => useBlockStatus('me'), { wrapper });
    expect(blocksService.status).not.toHaveBeenCalled();
  });
});
