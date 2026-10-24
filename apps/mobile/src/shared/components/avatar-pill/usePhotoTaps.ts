import { useEffect, useRef } from 'react';

import { DOUBLE_TAP_MS } from './constants';

/**
 * The photo's taps: one calls onSingle, two (within DOUBLE_TAP_MS) call
 * onDouble instead. The single tap waits out the double-tap window first.
 */
export function usePhotoTaps(onSingle: () => void, onDouble: () => void) {
  const pendingTap = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (pendingTap.current) clearTimeout(pendingTap.current);
    },
    [],
  );

  return () => {
    if (pendingTap.current) {
      clearTimeout(pendingTap.current);
      pendingTap.current = null;
      onDouble();
      return;
    }
    pendingTap.current = setTimeout(() => {
      pendingTap.current = null;
      onSingle();
    }, DOUBLE_TAP_MS);
  };
}
