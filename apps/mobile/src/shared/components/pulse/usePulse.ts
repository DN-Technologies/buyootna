import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { type PulseItem, pulseService } from '@/shared/api/pulse.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

/**
 * The active profile's pulse (what's going on, most pressing first) for the
 * home pill's notch. Reloaded on focus; an API without it leaves it empty.
 */
export function usePulse(): PulseItem[] {
  const token = useAuthStore((s) => s.token);
  const identityId = useAuthStore((s) => s.activeIdentity?.id);
  const [items, setItems] = useState<PulseItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!token || !identityId) {
        setItems([]);
        return;
      }
      let live = true;
      pulseService
        .getMine()
        .then((next) => {
          if (live) setItems(next);
        })
        .catch((e) => console.warn('Failed to load the pulse:', e));
      return () => {
        live = false;
      };
    }, [token, identityId]),
  );

  return items;
}
