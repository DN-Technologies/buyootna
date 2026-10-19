import { act, renderHook } from '@testing-library/react-native';

import { storiesService } from '@/shared/api/stories.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

import { useStoryViewQueue } from '../hooks/useStoryViewQueue';

jest.mock('@/shared/api/stories.service', () => ({
  storiesService: { recordViews: jest.fn().mockResolvedValue(undefined) },
}));

const asProfile = (id: string) =>
  useAuthStore.setState({ activeIdentity: { id } as never });

describe('useStoryViewQueue', () => {
  beforeEach(() => jest.clearAllMocks());

  it('leaving the viewer as the same profile sends what is queued', async () => {
    asProfile('p1');
    const { result, unmount } = await renderHook(() => useStoryViewQueue());
    result.current.add('s1');
    await act(async () => {
      unmount();
      await Promise.resolve();
    });
    expect(storiesService.recordViews).toHaveBeenCalledWith(['s1']);
  });

  it('a profile switch drops the queue instead of crediting the new profile', async () => {
    asProfile('p1');
    const { result, rerender } = await renderHook(() => useStoryViewQueue());
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
