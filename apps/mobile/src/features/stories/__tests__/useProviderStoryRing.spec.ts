import { renderHook } from '@testing-library/react-native';

import { useProviderStoryRing } from '../hooks/useProviderStoryRing';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
// Runs the focus callback at once, as on first focus
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => void) => {
    const mockReact = jest.requireActual<typeof import('react')>('react');
    mockReact.useEffect(cb, [cb]);
  },
}));

const mockRefetch = jest.fn();
const mockAuthorStories = jest.fn();
let mockData: { hasUnseen: boolean; stories: { id: string }[] } | undefined;
jest.mock('../hooks/useStoriesQueries', () => ({
  useAuthorStories: (id: string, enabled: boolean) => {
    mockAuthorStories(id, enabled);
    return { data: mockData, refetch: mockRefetch };
  },
}));

describe('useProviderStoryRing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockData = undefined;
  });

  it('nothing until the profile is known, and no request for it', async () => {
    const { result } = await renderHook(() => useProviderStoryRing(undefined));
    expect(result.current).toBeNull();
    expect(mockAuthorStories).toHaveBeenCalledWith('', false);
    expect(mockRefetch).not.toHaveBeenCalled();
  });

  it('no ring while loading or with no live stories', async () => {
    const { result, rerender } = await renderHook(() => useProviderStoryRing('co-1'));
    expect(result.current).toBeNull();
    mockData = { hasUnseen: false, stories: [] };
    await rerender({});
    expect(result.current).toBeNull();
  });

  it('a ring that says whether any is unseen, and opens them from this author', async () => {
    mockData = { hasUnseen: true, stories: [{ id: 's1' }] };
    const { result } = await renderHook(() => useProviderStoryRing('co-1'));
    expect(result.current?.hasUnseen).toBe(true);
    result.current?.onPress();
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/stories/[authorId]',
      params: { authorId: 'co-1', source: 'author' },
    });
  });

  it('refreshes when the profile comes into focus', async () => {
    await renderHook(() => useProviderStoryRing('co-1'));
    expect(mockAuthorStories).toHaveBeenCalledWith('co-1', true);
    expect(mockRefetch).toHaveBeenCalled();
  });
});
