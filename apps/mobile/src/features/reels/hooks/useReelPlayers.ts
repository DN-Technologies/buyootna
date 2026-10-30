import { useVideoPlayer, type VideoPlayer } from 'expo-video';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { reelSlot, reelWindow } from '../reelRules';
import type { ViewerReel } from '../types';

export type ReelStatus = 'loading' | 'ready' | 'error';

const setup = (player: VideoPlayer) => {
  player.loop = true;
  player.timeUpdateEventInterval = 0.25;
};

/** Released while the viewer closes: nothing left to tell it. */
const safely = (run: () => void) => {
  try {
    run();
  } catch {
    // Released
  }
};

/**
 * Three players shared by the whole list, not one per reel: phones run out of
 * video decoders fast, and creating a player is what makes a swipe stutter. A
 * place in the list keeps its player (place % 3) while it's near, so the next
 * reel is already loading before the swipe and the one just left is still
 * there on the way back. Reels are streamed from stable public links with
 * the player's disk cache on, so a replay costs no data.
 */
export function useReelPlayers({
  items,
  activeIndex,
  playing,
  muted,
  onTime,
}: {
  items: ViewerReel[];
  activeIndex: number;
  playing: boolean;
  muted: boolean;
  // The reel on screen played this far
  onTime: (reel: ViewerReel, seconds: number, duration: number) => void;
}) {
  const first = useVideoPlayer(null, setup);
  const second = useVideoPlayer(null, setup);
  const third = useVideoPlayer(null, setup);
  const players = useMemo(
    () => [first, second, third],
    [first, second, third],
  );

  // Which reel each player holds
  const held = useRef<(string | null)[]>([null, null, null]);
  const [statuses, setStatuses] = useState<Record<string, ReelStatus>>({});
  const [retries, setRetries] = useState(0);
  // Reels whose cached copy wouldn't play: streamed directly from then on
  const uncached = useRef(new Set<string>());

  // Leaving the viewer stops the sound now. Releasing a player only drops this
  // side's reference, and the native one plays on until nothing else holds it.
  // A layout effect, because its cleanup runs before useVideoPlayer's release
  const leaving = useRef(false);
  useLayoutEffect(() => {
    leaving.current = false;
    return () => {
      leaving.current = true;
      players.forEach((player) => {
        safely(() => {
          player.muted = true;
          player.pause();
        });
      });
    };
  }, [players]);

  const latest = useRef({ items, activeIndex, playing, onTime });
  latest.current = { items, activeIndex, playing, onTime };

  const activeSlot = reelSlot(activeIndex);

  /**
   * A load failed. A download cut short (the app killed mid-reel) leaves a
   * cached file the player refuses every time, so the first failure quietly
   * tries again from the network; only a second one shows «إعادة المحاولة».
   */
  const onFailed = useCallback((id: string, slot: number) => {
    if (uncached.current.has(id)) {
      setStatuses((all) => ({ ...all, [id]: 'error' }));
      return;
    }
    uncached.current.add(id);
    if (held.current[slot] === id) held.current[slot] = null;
    setRetries((n) => n + 1);
  }, []);

  useEffect(() => {
    const subscriptions = players.flatMap((player, slot) => [
      player.addListener('statusChange', ({ status }) => {
        const id = held.current[slot];
        if (!id) return;
        if (status === 'error') {
          onFailed(id, slot);
          return;
        }
        const next: ReelStatus = status === 'readyToPlay' ? 'ready' : 'loading';
        setStatuses((all) => (all[id] === next ? all : { ...all, [id]: next }));
      }),
      player.addListener('timeUpdate', ({ currentTime }) => {
        const now = latest.current;
        const reel = now.items[now.activeIndex];
        if (
          reel &&
          slot === reelSlot(now.activeIndex) &&
          held.current[slot] === reel.id
        ) {
          now.onTime(reel, currentTime, player.duration);
        }
      }),
    ]);
    return () => subscriptions.forEach((s) => s.remove());
  }, [onFailed, players]);

  // Load the window: the reel on screen first, then the next, then the last
  const windowIds = reelWindow(activeIndex, items.length)
    .map((i) => items[i].id)
    .join();
  useEffect(() => {
    const now = latest.current;
    for (const index of reelWindow(activeIndex, now.items.length)) {
      const reel = now.items[index];
      const slot = reelSlot(index);
      if (held.current[slot] === reel.id) continue;
      held.current[slot] = reel.id;
      setStatuses((all) => ({ ...all, [reel.id]: 'loading' }));
      void players[slot]
        .replaceAsync({
          uri: reel.mediaUrl,
          useCaching: !uncached.current.has(reel.id),
        })
        .then(() => {
          // It may have become the one on screen while loading
          const after = latest.current;
          if (
            !leaving.current &&
            after.playing &&
            reelSlot(after.activeIndex) === slot
          ) {
            safely(() => players[slot].play());
          }
        })
        .catch(() => onFailed(reel.id, slot));
    }
  }, [activeIndex, windowIds, onFailed, players, retries]);

  // Only the reel on screen plays; one you come back to starts over
  const previousSlot = useRef(activeSlot);
  useEffect(() => {
    if (previousSlot.current !== activeSlot) {
      const left = players[previousSlot.current];
      safely(() => {
        left.pause();
        left.currentTime = 0;
      });
      previousSlot.current = activeSlot;
    }
    players.forEach((player, slot) => {
      safely(() => {
        if (slot === activeSlot && playing) player.play();
        else player.pause();
      });
    });
  }, [activeSlot, playing, players]);

  useEffect(() => {
    players.forEach((player) => {
      safely(() => {
        player.muted = muted;
      });
    });
  }, [muted, players]);

  /** The player for this place, if it's in the window. */
  const playerFor = useCallback(
    (index: number): VideoPlayer | null =>
      Math.abs(index - activeIndex) <= 1 ? players[reelSlot(index)] : null,
    [activeIndex, players],
  );

  /** Tries a reel that failed again. */
  const retry = useCallback((id: string) => {
    const slot = held.current.indexOf(id);
    if (slot !== -1) held.current[slot] = null;
    setRetries((n) => n + 1);
  }, []);

  return { playerFor, statuses, retry };
}
