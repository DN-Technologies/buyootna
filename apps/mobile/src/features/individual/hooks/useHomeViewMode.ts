import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export type HomeViewMode = 'card' | 'list';

const STORAGE_KEY = 'home:viewMode';
// The design opens on the quick list (عرض سريع)
const DEFAULT_MODE: HomeViewMode = 'list';

const isViewMode = (value: unknown): value is HomeViewMode =>
  value === 'card' || value === 'list';

// The choice once read or made this session, so home shows it at once
let remembered: HomeViewMode | null = null;

/**
 * The home list's «عرض سريع» / photos switch, remembered on this device
 * (guest or signed in) across launches. It reset to the list each time the
 * app opened (QA).
 */
export function useHomeViewMode(): [HomeViewMode, (mode: HomeViewMode) => void] {
  const [viewMode, setViewModeState] = useState<HomeViewMode>(
    remembered ?? DEFAULT_MODE,
  );

  useEffect(() => {
    if (remembered) return;
    let cancelled = false;
    // Promise.resolve().then: a storage error, thrown or rejected, only
    // leaves the default
    Promise.resolve()
      .then(() => AsyncStorage.getItem(STORAGE_KEY))
      .then((saved) => {
        // A tap before the read finished wins
        if (cancelled || remembered || !isViewMode(saved)) return;
        remembered = saved;
        setViewModeState(saved);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const setViewMode = useCallback((mode: HomeViewMode) => {
    remembered = mode;
    setViewModeState(mode);
    Promise.resolve()
      .then(() => AsyncStorage.setItem(STORAGE_KEY, mode))
      .catch(() => {});
  }, []);

  return [viewMode, setViewMode];
}

/** Tests only: forget this session's choice. */
export function resetHomeViewModeForTests() {
  remembered = null;
}
