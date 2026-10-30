import { act, renderHook, waitFor } from '@testing-library/react-native';

import { reelsService } from '@/shared/api/reels.service';

import { useReelsSession } from '../hooks/useReelsSession';
import type { ReelPage, ViewerReel } from '../types';

jest.mock('@/shared/api/reels.service', () => ({
  reelsService: {
    getFeed: jest.fn(),
    getByAuthor: jest.fn(),
    getOne: jest.fn(),
  },
}));

const service = reelsService as jest.Mocked<typeof reelsService>;
const reel = (id: string) =>
  ({ id, author: { identityId: `author-${id}` } }) as ViewerReel;
const page = (ids: string[], nextCursor: string | null = null): ReelPage => ({
  snapshotAt: '2026-10-30T12:00:00.000Z',
  reels: ids.map(reel),
  nextCursor,
});
const ids = (items: ViewerReel[]) => items.map((r) => r.id);

describe('useReelsSession', () => {
  beforeEach(() => jest.resetAllMocks());

  it('loads the first page, then more at the end', async () => {
    service.getFeed
      .mockResolvedValueOnce(page(['a', 'b'], 'next'))
      .mockResolvedValueOnce(page(['c']));
    const { result } = await renderHook(() => useReelsSession({}));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(ids(result.current.items)).toEqual(['a', 'b']);

    await act(() => result.current.loadMore());
    expect(ids(result.current.items)).toEqual(['a', 'b', 'c']);
    expect(service.getFeed).toHaveBeenLastCalledWith(
      'next',
      undefined,
      undefined,
    );

    // That was the last page
    await act(() => result.current.loadMore());
    expect(service.getFeed).toHaveBeenCalledTimes(2);
  });

  it("uses the author's list when given one", async () => {
    service.getByAuthor.mockResolvedValue(page(['a']));
    const { result } = await renderHook(() => useReelsSession({ authorId: 'x' }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(service.getByAuthor).toHaveBeenCalledWith('x', undefined);
    expect(service.getFeed).not.toHaveBeenCalled();
  });

  it('asks for the filters, and starts again when they change', async () => {
    service.getFeed.mockResolvedValue(page(['a']));
    const filters = { listingType: 'SALE' as const };
    const { result, rerender } = await renderHook(
      (props: { filters?: { listingType: 'SALE' } }) => useReelsSession(props),
      { initialProps: {} },
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    await rerender({ filters });
    await waitFor(() =>
      expect(service.getFeed).toHaveBeenLastCalledWith(
        undefined,
        undefined,
        filters,
      ),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(ids(result.current.items)).toEqual(['a']);
  });

  it('an answer to the old filters, arriving late, is dropped', async () => {
    let answerOld: (page: ReelPage) => void = () => undefined;
    service.getFeed
      .mockReturnValueOnce(
        new Promise<ReelPage>((resolve) => {
          answerOld = resolve;
        }),
      )
      .mockResolvedValueOnce(page(['new']));
    const { result, rerender } = await renderHook(
      (props: { filters?: { listingType: 'SALE' } }) => useReelsSession(props),
      { initialProps: {} },
    );
    await rerender({ filters: { listingType: 'SALE' } });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => answerOld(page(['old'])));
    expect(ids(result.current.items)).toEqual(['new']);
  });

  it('opens at a reel in the first page', async () => {
    service.getFeed.mockResolvedValue(page(['a', 'b', 'c']));
    const { result } = await renderHook(() => useReelsSession({ startId: 'c' }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.startIndex).toBe(2);
    expect(service.getOne).not.toHaveBeenCalled();
  });

  it('puts a reel from a link first when the page lacks it', async () => {
    service.getFeed.mockResolvedValue(page(['a', 'b']));
    service.getOne.mockResolvedValue(reel('linked'));
    const { result } = await renderHook(() => useReelsSession({ startId: 'linked' }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(ids(result.current.items)).toEqual(['linked', 'a', 'b']);
    expect(result.current.startIndex).toBe(0);
  });

  it('a link to a reel that is gone just opens the feed', async () => {
    service.getFeed.mockResolvedValue(page(['a']));
    service.getOne.mockRejectedValue(new Error('404'));
    const { result } = await renderHook(() => useReelsSession({ startId: 'gone' }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(ids(result.current.items)).toEqual(['a']);
    expect(result.current.failed).toBe(false);
  });

  it('an expired cursor starts again quietly, without moving what is shown', async () => {
    service.getFeed
      .mockResolvedValueOnce(page(['a', 'b'], 'old'))
      .mockRejectedValueOnce({
        response: { data: { code: 'REEL_CURSOR_EXPIRED' } },
      })
      .mockResolvedValueOnce(page(['new', 'a'], null));
    const { result } = await renderHook(() => useReelsSession({}));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.loadMore());
    expect(ids(result.current.items)).toEqual(['a', 'b', 'new']);
  });

  it('keeps going past a page that adds nothing', async () => {
    service.getFeed
      .mockResolvedValueOnce(page(['a'], 'p2'))
      .mockResolvedValueOnce(page(['a'], 'p3'))
      .mockResolvedValueOnce(page(['b']));
    const { result } = await renderHook(() => useReelsSession({}));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(() => result.current.loadMore());
    expect(ids(result.current.items)).toEqual(['a', 'b']);
  });

  it('says when the first page fails, and can try again', async () => {
    service.getFeed
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(page(['a']));
    const { result } = await renderHook(() => useReelsSession({}));
    await waitFor(() => expect(result.current.failed).toBe(true));
    await act(() => result.current.retry());
    expect(result.current.failed).toBe(false);
    expect(ids(result.current.items)).toEqual(['a']);
  });

  it('updates and removes reels in place', async () => {
    service.getFeed.mockResolvedValue(page(['a', 'b']));
    const { result } = await renderHook(() => useReelsSession({}));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => result.current.update('a', { liked: true }));
    expect(result.current.items[0].liked).toBe(true);

    await act(async () => {
      result.current.removeWhere((r) => r.author.identityId === 'author-b');
    });
    expect(ids(result.current.items)).toEqual(['a']);
  });
});
