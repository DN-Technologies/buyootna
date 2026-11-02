import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { storiesService } from '@/shared/api/stories.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

import { useStoryViewQueue } from '../hooks/useStoryViewQueue';

jest.mock('@/shared/api/stories.service', () => ({
  storiesService: { recordViews: jest.fn().mockResolvedValue(undefined) },
}));

const asProfile = (id: string) =>
  useAuthStore.setState({ activeIdentity: { id } as never });

describe('useStoryViewQueue', () => {
  const client = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  beforeEach(() => jest.clearAllMocks());

  it('leaving the viewer as the same profile sends what is queued', async () => {
    asProfile('p1');
    const { result, unmount } = await renderHook(() => useStoryViewQueue(), {
      wrapper,
    });
    result.current.add('s1');
    await act(async () => {
      unmount();
      await Promise.resolve();
    });
    expect(storiesService.recordViews).toHaveBeenCalledWith(['s1']);
  });

  it("refreshes the lists' rings only once the views are sent", async () => {
    asProfile('p1');
    const invalidate = jest.spyOn(client, 'invalidateQueries');
    let sent: () => void = () => undefined;
    (storiesService.recordViews as jest.Mock).mockImplementationOnce(
      () => new Promise<void>((resolve) => (sent = resolve)),
    );
    const { result, unmount } = await renderHook(() => useStoryViewQueue(), {
      wrapper,
    });
    result.current.add('s1');

    await act(async () => {
      unmount();
      await Promise.resolve();
    });
    expect(invalidate).not.toHaveBeenCalled();

    await act(async () => {
      sent();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['stories', 'p1', 'rings'],
    });
  });

  it('a profile switch drops the queue instead of crediting the new profile', async () => {
    asProfile('p1');
    const { result, rerender } = await renderHook(() => useStoryViewQueue(), {
      wrapper,
    });
    const first = result.current;
    first.add('s1');

    await act(async () => {
      asProfile('p2');
      await rerender({});
    });
    // A new queue for the new profile; the old one sent nothing
    expect(result.current).not.toBe(first);
    expect(storiesService.recordViews).not.toHaveBeenCalled();
  });
});
