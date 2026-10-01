import { useCallback, useRef, useState } from 'react';

import type { AddressDetails } from './types';

type DetailKey = keyof AddressDetails;

/**
 * The address parts in the picker card. The map's guess fills the parts
 * the user hasn't typed; once they type in a field, the map never
 * overwrites it again. The address line works the same way.
 */
export function useAddressDraft() {
  const [details, setDetails] = useState<AddressDetails>({});
  const [customAddress, setCustomAddress] = useState<string | null>(null);
  const touched = useRef(new Set<DetailKey>());

  const setField = useCallback((key: DetailKey, value: string) => {
    touched.current.add(key);
    setDetails((d) => ({ ...d, [key]: value }));
  }, []);

  const applyGuess = useCallback((guess: AddressDetails) => {
    setDetails((d) => {
      const next = { ...d };
      for (const key of Object.keys(guess) as DetailKey[]) {
        if (!touched.current.has(key)) next[key] = guess[key];
      }
      return next;
    });
  }, []);

  /** A place picked as a whole (saved, recent, initial) sets everything. */
  const load = useCallback((initial?: AddressDetails) => {
    touched.current = new Set(
      Object.keys(initial ?? {}) as DetailKey[],
    );
    setDetails(initial ?? {});
    setCustomAddress(null);
  }, []);

  /** Moving the pin elsewhere drops what was specific to the old spot. */
  const clearForNewSpot = useCallback(() => {
    touched.current = new Set();
    setDetails({});
    setCustomAddress(null);
  }, []);

  return {
    details,
    setField,
    applyGuess,
    load,
    clearForNewSpot,
    customAddress,
    setCustomAddress,
  };
}
