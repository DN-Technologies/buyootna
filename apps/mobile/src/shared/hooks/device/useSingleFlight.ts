import { useCallback, useRef } from 'react';

/**
 * Single-flight guard for tappable actions that kick off async work before
 * navigating (e.g. "start chat" has to create the conversation first).
 * While one task is in flight every other call is ignored, so a rapid
 * double/triple tap fires the task exactly once instead of once per tap.
 *
 * The guard is per-hook-instance (per mounted screen), which matches how
 * the duplicate-tap harm happens: N taps on the same button in the same
 * screen. The task must return its own promise (await the async work
 * inside it) for the guard to span the whole operation.
 */
export function useSingleFlight() {
  const inFlightRef = useRef(false);

  return useCallback(
    async <T,>(task: () => Promise<T>): Promise<T | undefined> => {
      if (inFlightRef.current) {
        return undefined;
      }
      inFlightRef.current = true;
      try {
        return await task();
      } finally {
        inFlightRef.current = false;
      }
    },
    [],
  );
}
