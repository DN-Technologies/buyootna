import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';

import { useAuthStore } from '@/shared/store/useAuthStore';

import type { PickedPlace } from './types';

const MAX_RECENT = 5;

// Per account, so a shared phone doesn't show someone else's places
const keyFor = (userId?: string) =>
  `map_picker_recent_${userId ?? 'guest'}`.replace(/[^\w.-]/g, '_');

const samePlace = (a: PickedPlace, b: PickedPlace) =>
  Math.abs(a.lat - b.lat) < 0.0002 && Math.abs(a.lng - b.lng) < 0.0002;

/**
 * The last few confirmed locations, kept on the device (SecureStore, which
 * the app already ships -- no new native module, so this works over OTA).
 */
export function useRecentPlaces() {
  const userId = useAuthStore((state) => state.user?.id);
  const [recent, setRecent] = useState<PickedPlace[]>([]);

  useEffect(() => {
    let cancelled = false;
    SecureStore.getItemAsync(keyFor(userId))
      .then((raw) => {
        if (!cancelled) setRecent(raw ? (JSON.parse(raw) as PickedPlace[]) : []);
      })
      .catch(() => {
        if (!cancelled) setRecent([]);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const remember = useCallback(
    (place: PickedPlace) => {
      setRecent((list) => {
        const next = [
          { ...place, address: place.address.slice(0, 120) },
          ...list.filter((p) => !samePlace(p, place)),
        ].slice(0, MAX_RECENT);
        void SecureStore.setItemAsync(keyFor(userId), JSON.stringify(next)).catch(
          () => {},
        );
        return next;
      });
    },
    [userId],
  );

  return { recent, remember };
}
