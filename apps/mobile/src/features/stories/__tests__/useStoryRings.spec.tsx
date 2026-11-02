import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { storiesService } from '@/shared/api/stories.service';

import { useStoryRings } from '../hooks/useStoryRings';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: () => undefined,
}));
jest.mock('@/shared/api/stories.service', () => ({
  storiesService: { getRings: jest.fn() },
}));

let mockToken: string | null = 'token';
jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: (selector: (s: unknown) => unknown) =>
    selector({
      token: mockToken,
      activeIdentity: mockToken ? { id: 'viewer' } : null,
    }),
}));

const getRings = storiesService.getRings as jest.Mock;

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useStoryRings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToken = 'token';
    getRings.mockResolvedValue([]);
  });

  it('a ring for a profile with stories, none for the others', async () => {
    getRings.mockResolvedValue([
      { identityId: 'a', hasUnseen: true, partial: true },
    ]);
    const ids = ['a', 'b'];
    const { result } = await renderHook(() => useStoryRings(ids), { wrapper });

    await waitFor(() => expect(result.current('a')).not.toBeNull());
    expect(result.current('a')).toMatchObject({
      hasUnseen: true,
      partial: true,
    });
    expect(result.current('b')).toBeNull();
  });

  it('its ring opens that profile in the viewer', async () => {
    getRings.mockResolvedValue([
      { identityId: 'a', hasUnseen: true, partial: false },
    ]);
    const ids = ['a'];
    const { result } = await renderHook(() => useStoryRings(ids), { wrapper });

    await waitFor(() => expect(result.current('a')).not.toBeNull());
    result.current('a')?.onPress();
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/stories/[authorId]',
      params: { authorId: 'a', source: 'author' },
    });
  });

  it('asks 50 at a time, and each id once', async () => {
    const ids = Array.from({ length: 120 }, (_, i) => `id-${i}`);
    await renderHook(() => useStoryRings([...ids, 'id-0']), { wrapper });

    await waitFor(() => expect(getRings).toHaveBeenCalledTimes(3));
    const asked = getRings.mock.calls.map(([chunk]) => chunk as string[]);
    expect(asked.map((c) => c.length)).toEqual([50, 50, 20]);
    expect(new Set(asked.flat()).size).toBe(120);
  });

  it('guests: no request and no rings', async () => {
    mockToken = null;
    const ids = ['a'];
    const { result } = await renderHook(() => useStoryRings(ids), { wrapper });

    expect(result.current('a')).toBeNull();
    expect(getRings).not.toHaveBeenCalled();
  });

  it('no request for an empty list', async () => {
    const ids: string[] = [];
    await renderHook(() => useStoryRings(ids), { wrapper });
    expect(getRings).not.toHaveBeenCalled();
  });

  it('a failed lookup just means no rings', async () => {
    getRings.mockRejectedValue(new Error('offline'));
    const ids = ['a'];
    const { result } = await renderHook(() => useStoryRings(ids), { wrapper });

    await waitFor(() => expect(getRings).toHaveBeenCalled());
    expect(result.current('a')).toBeNull();
  });
});
