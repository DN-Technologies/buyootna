import { act, renderHook, waitFor } from '@testing-library/react-native';

import { reelsService } from '@/shared/api/reels.service';

import { useReelComments } from '../hooks/useReelComments';
import type { ReelComment, ReelCommentsPage } from '../types';

jest.mock('@/shared/api/reels.service', () => ({
  reelsService: {
    getComments: jest.fn(),
    addComment: jest.fn(),
    removeComment: jest.fn(),
  },
}));

const service = reelsService as jest.Mocked<typeof reelsService>;
const comment = (id: string, author = 'a') =>
  ({ id, body: id, author: { identityId: author } }) as ReelComment;
const page = (ids: string[], nextCursor: string | null = null): ReelCommentsPage => ({
  comments: ids.map((id) => comment(id)),
  nextCursor,
});
const ids = (list: ReelComment[]) => list.map((c) => c.id);

describe('useReelComments', () => {
  beforeEach(() => jest.resetAllMocks());

  it('asks for nothing until a reel is chosen', async () => {
    await renderHook(() => useReelComments(null));
    expect(service.getComments).not.toHaveBeenCalled();
  });

  it('loads a page, then more, without repeats', async () => {
    service.getComments
      .mockResolvedValueOnce(page(['a', 'b'], 'next'))
      .mockResolvedValueOnce(page(['b', 'c']));
    const { result } = await renderHook(() => useReelComments('r1'));
    await waitFor(() => expect(ids(result.current.comments)).toEqual(['a', 'b']));

    await act(() => result.current.loadMore());
    expect(service.getComments).toHaveBeenLastCalledWith('r1', 'next');
    expect(ids(result.current.comments)).toEqual(['a', 'b', 'c']);

    await act(() => result.current.loadMore());
    expect(service.getComments).toHaveBeenCalledTimes(2);
  });

  it('puts a new comment on top', async () => {
    service.getComments.mockResolvedValue(page(['a']));
    service.addComment.mockResolvedValue(comment('new'));
    const { result } = await renderHook(() => useReelComments('r1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.add('نص');
    });
    expect(service.addComment).toHaveBeenCalledWith('r1', 'نص');
    expect(ids(result.current.comments)).toEqual(['new', 'a']);
  });

  it('a refused comment stays with the caller to report', async () => {
    service.getComments.mockResolvedValue(page(['a']));
    service.addComment.mockRejectedValue(new Error('limit'));
    const { result } = await renderHook(() => useReelComments('r1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await expect(result.current.add('نص')).rejects.toThrow('limit');
    expect(ids(result.current.comments)).toEqual(['a']);
  });

  it('removes one, and everything by a blocked author', async () => {
    service.getComments.mockResolvedValue({
      comments: [comment('a', 'x'), comment('b', 'y'), comment('c', 'x')],
      nextCursor: null,
    });
    service.removeComment.mockResolvedValue(undefined);
    const { result } = await renderHook(() => useReelComments('r1'));
    await waitFor(() => expect(result.current.comments).toHaveLength(3));
    await act(() => result.current.remove('b'));
    expect(ids(result.current.comments)).toEqual(['a', 'c']);
    await act(async () => result.current.dropAuthor('x'));
    expect(result.current.comments).toEqual([]);
  });

  it('starts again for another reel, dropping a late answer', async () => {
    let late: (p: ReelCommentsPage) => void = () => undefined;
    service.getComments
      .mockReturnValueOnce(
        new Promise<ReelCommentsPage>((resolve) => {
          late = resolve;
        }),
      )
      .mockResolvedValueOnce(page(['second']));
    const { result, rerender } = await renderHook(
      (id: string) => useReelComments(id),
      { initialProps: 'r1' },
    );
    await rerender('r2');
    await waitFor(() => expect(ids(result.current.comments)).toEqual(['second']));
    await act(async () => late(page(['first'])));
    expect(ids(result.current.comments)).toEqual(['second']);
  });

  it('says when it failed, and can try again', async () => {
    service.getComments
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(page(['a']));
    const { result } = await renderHook(() => useReelComments('r1'));
    await waitFor(() => expect(result.current.failed).toBe(true));
    await act(() => result.current.retry());
    expect(result.current.failed).toBe(false);
    expect(ids(result.current.comments)).toEqual(['a']);
  });
});
