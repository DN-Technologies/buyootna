import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Runs one story's clock: calls onDone after `durationMs` of running time,
 * pausing and resuming where it left off. A JS timeout decides when to move
 * on; the returned value (0 → 1) only drives the progress bar.
 */
export function useStoryTimer({
  durationMs,
  running,
  resetKey,
  onDone,
}: {
  durationMs: number;
  running: boolean;
  resetKey: string;
  onDone: () => void;
}): Animated.Value {
  const progress = useRef(new Animated.Value(0)).current;
  const elapsed = useRef(0);
  const startedAt = useRef<number | null>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // A new story starts from zero
  useEffect(() => {
    elapsed.current = 0;
    startedAt.current = null;
    progress.stopAnimation();
    progress.setValue(0);
  }, [resetKey, progress]);

  useEffect(() => {
    if (!running) return undefined;
    const remaining = Math.max(0, durationMs - elapsed.current);
    startedAt.current = Date.now();
    Animated.timing(progress, {
      toValue: 1,
      duration: remaining,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
    const timer = setTimeout(() => onDoneRef.current(), remaining);
    return () => {
      clearTimeout(timer);
      progress.stopAnimation();
      if (startedAt.current !== null) {
        elapsed.current += Date.now() - startedAt.current;
        startedAt.current = null;
      }
    };
  }, [running, durationMs, resetKey, progress]);

  return progress;
}
