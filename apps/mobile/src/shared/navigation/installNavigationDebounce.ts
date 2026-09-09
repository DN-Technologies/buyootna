import { router } from 'expo-router';

// How long to ignore repeat navigation calls after one goes through --
// roughly a screen transition's length, tuned to absorb a rapid double/
// triple tap without making a deliberate second tap (e.g. tapping into a
// different chat right after the first) feel unresponsive.
const NAVIGATION_DEBOUNCE_MS = 600;

let installed = false;
let lastNavigationAt = 0;

/**
 * Patches expo-router's shared `router` singleton -- the same object both
 * `import { router } from 'expo-router'` and `useRouter()` return, so this
 * covers every call site in the app with a single change -- so a burst of
 * rapid taps on a nav button/card can only push one screen instead of
 * stacking a duplicate per tap. Only push/navigate/replace are guarded:
 * they're the calls that add a new screen; back/dismiss/setParams etc.
 * don't create duplicates and are left untouched.
 *
 * Call once, before any navigation can happen (see app/_layout.tsx).
 */
function debounced<Fn extends (...args: never[]) => void>(fn: Fn): Fn {
  return ((...args: Parameters<Fn>) => {
    const now = Date.now();
    if (now - lastNavigationAt < NAVIGATION_DEBOUNCE_MS) {
      return;
    }
    lastNavigationAt = now;
    return fn(...args);
  }) as Fn;
}

export function installNavigationDebounce(): void {
  if (installed) return;
  installed = true;

  router.push = debounced(router.push);
  router.navigate = debounced(router.navigate);
  router.replace = debounced(router.replace);
}
