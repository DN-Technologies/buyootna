import { act, renderHook } from '@testing-library/react-native';

import { useReelPlayers } from '../hooks/useReelPlayers';
import type { ViewerReel } from '../types';

type Listener = (payload: never) => void;
const makePlayer = () => {
  const listeners: Record<string, Listener[]> = {};
  return {
    loop: false,
    muted: false,
    currentTime: 9,
    duration: 60,
    timeUpdateEventInterval: 0,
    play: jest.fn(),
    pause: jest.fn(),
    replaceAsync: jest.fn(() => Promise.resolve()),
    addListener: jest.fn((event: string, fn: Listener) => {
      (listeners[event] ??= []).push(fn);
      return { remove: jest.fn() };
    }),
    emit: (event: string, payload: unknown) =>
      (listeners[event] ?? []).forEach((fn) => fn(payload as never)),
  };
};

let mockPlayers: ReturnType<typeof makePlayer>[] = [];
let mockNext = 0;
jest.mock('expo-video', () => ({
  useVideoPlayer: jest.fn((_source: unknown, setup: (p: unknown) => void) => {
    const { useRef } = jest.requireActual<typeof import('react')>('react');
    const ref = useRef<unknown>(null);
    if (!ref.current) {
      const player = mockPlayers[mockNext % 3];
      mockNext += 1;
      setup(player);
      ref.current = player;
    }
    return ref.current;
  }),
}));

const reels = Array.from(
  { length: 6 },
  (_, i) => ({ id: `r${i}`, mediaUrl: `https://cdn.test/${i}.mp4` }) as ViewerReel,
);
const flush = () => act(async () => {});

describe('useReelPlayers', () => {
  const onTime = jest.fn();
  const base = {
    items: reels,
    activeIndex: 0,
    playing: true,
    muted: false,
    onTime,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNext = 0;
    mockPlayers = [makePlayer(), makePlayer(), makePlayer()];
  });

  it('loads the reel on screen and the next, with the cache on', async () => {
    await renderHook(() => useReelPlayers(base));
    await flush();
    expect(mockPlayers[0].replaceAsync).toHaveBeenCalledWith({
      uri: 'https://cdn.test/0.mp4',
      useCaching: true,
    });
    expect(mockPlayers[1].replaceAsync).toHaveBeenCalledWith({
      uri: 'https://cdn.test/1.mp4',
      useCaching: true,
    });
    expect(mockPlayers[2].replaceAsync).not.toHaveBeenCalled();
  });

  it('plays only the reel on screen', async () => {
    await renderHook(() => useReelPlayers(base));
    await flush();
    expect(mockPlayers[0].play).toHaveBeenCalled();
    expect(mockPlayers[1].play).not.toHaveBeenCalled();
    expect(mockPlayers[1].pause).toHaveBeenCalled();
  });

  it('a swipe reuses what is loaded, loads only the new one, and rewinds the old', async () => {
    const { rerender } = await renderHook((p: typeof base) => useReelPlayers(p), {
      initialProps: base,
    });
    await flush();
    mockPlayers.forEach((p) => p.replaceAsync.mockClear());

    await rerender({ ...base, activeIndex: 1 });
    await flush();

    expect(mockPlayers[1].replaceAsync).not.toHaveBeenCalled();
    expect(mockPlayers[0].replaceAsync).not.toHaveBeenCalled();
    expect(mockPlayers[2].replaceAsync).toHaveBeenCalledWith({
      uri: 'https://cdn.test/2.mp4',
      useCaching: true,
    });
    expect(mockPlayers[0].currentTime).toBe(0);
    expect(mockPlayers[1].play).toHaveBeenCalled();
  });

  it('pauses everything when told to stop playing', async () => {
    const { rerender } = await renderHook((p: typeof base) => useReelPlayers(p), {
      initialProps: base,
    });
    await flush();
    mockPlayers.forEach((p) => {
      p.play.mockClear();
      p.pause.mockClear();
    });
    await rerender({ ...base, playing: false });
    await flush();
    mockPlayers.forEach((p) => {
      expect(p.play).not.toHaveBeenCalled();
      expect(p.pause).toHaveBeenCalled();
    });
  });

  it('mutes every player', async () => {
    await renderHook(() => useReelPlayers({ ...base, muted: true }));
    await flush();
    mockPlayers.forEach((p) => expect(p.muted).toBe(true));
  });

  it('reports time only for the reel on screen', async () => {
    await renderHook(() => useReelPlayers(base));
    await flush();
    await act(async () => mockPlayers[1].emit('timeUpdate', { currentTime: 4 }));
    expect(onTime).not.toHaveBeenCalled();
    await act(async () => mockPlayers[0].emit('timeUpdate', { currentTime: 4 }));
    expect(onTime).toHaveBeenCalledWith(reels[0], 4, 60);
  });

  it('tracks each reel by what its player says', async () => {
    const { result } = await renderHook(() => useReelPlayers(base));
    await flush();
    await act(async () =>
      mockPlayers[0].emit('statusChange', { status: 'readyToPlay' }),
    );
    expect(result.current.statuses.r0).toBe('ready');
  });

  it('a broken cached copy quietly reloads from the network', async () => {
    const { result } = await renderHook(() => useReelPlayers(base));
    await flush();
    mockPlayers[1].replaceAsync.mockClear();

    await act(async () =>
      mockPlayers[1].emit('statusChange', { status: 'error' }),
    );
    await flush();

    expect(mockPlayers[1].replaceAsync).toHaveBeenCalledWith({
      uri: 'https://cdn.test/1.mp4',
      useCaching: false,
    });
    expect(result.current.statuses.r1).not.toBe('error');
  });

  it('a failure from the network too asks the viewer, and can be retried', async () => {
    const { result } = await renderHook(() => useReelPlayers(base));
    await flush();
    const fail = () =>
      act(async () => mockPlayers[1].emit('statusChange', { status: 'error' }));
    await fail();
    await flush();
    await fail();
    expect(result.current.statuses.r1).toBe('error');

    mockPlayers[1].replaceAsync.mockClear();
    await act(async () => result.current.retry('r1'));
    await flush();
    expect(mockPlayers[1].replaceAsync).toHaveBeenCalledTimes(1);
    expect(mockPlayers[1].replaceAsync).toHaveBeenCalledWith({
      uri: 'https://cdn.test/1.mp4',
      useCaching: false,
    });
  });

  it('a load that rejects is handled the same way', async () => {
    mockPlayers[0].replaceAsync.mockRejectedValueOnce(new Error('stopped') as never);
    await renderHook(() => useReelPlayers(base));
    await flush();
    expect(mockPlayers[0].replaceAsync).toHaveBeenLastCalledWith({
      uri: 'https://cdn.test/0.mp4',
      useCaching: false,
    });
  });

  it('gives a player only to the reels near the one on screen', async () => {
    const { result } = await renderHook(() =>
      useReelPlayers({ ...base, activeIndex: 2 }),
    );
    await flush();
    expect(result.current.playerFor(1)).toBe(mockPlayers[1]);
    expect(result.current.playerFor(2)).toBe(mockPlayers[2]);
    expect(result.current.playerFor(3)).toBe(mockPlayers[0]);
    expect(result.current.playerFor(0)).toBeNull();
    expect(result.current.playerFor(4)).toBeNull();
  });
});
