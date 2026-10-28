import { router } from 'expo-router';

// How long to ignore repeat navigation calls after one goes through --
// roughly a screen transition's length, tuned to absorb a rapid double/
// triple tap without making a deliberate second tap (e.g. tapping into a
// different chat right after the first) feel unresponsive.
const NAVIGATION_DEBOUNCE_MS = 600;

let installed = false;
let lastNavigationAt = 0;
// The last navigation target, so the SAME screen can never be pushed twice
// in a row no matter how far apart the taps are (the 600ms window alone
// still stacked one duplicate per tap beyond it). Cleared once the user is
// no longer on that screen (back, dismiss, replace, a swipe back -- see
// onNavigationStateChange) so "leave, then reopen it" keeps working.
let lastTargetKey: string | null = null;
// The screen that target opened (its route key), learnt from the first
// navigation state after it; while it's focused the target stays refused
let targetRouteKey: string | undefined;
let awaitingTargetRoute = false;

// Stable identity for a navigation target, covering both string hrefs
// ('/chat/1') and object hrefs ({ pathname: '/chat/1', params: {...} }).
// Returns null for targets we can't key (never deduped).
function targetKey(href: unknown): string | null {
  if (typeof href === 'string') return href;
  if (href && typeof href === 'object' && 'pathname' in href) {
    const { pathname, params } = href as {
      pathname: string;
      params?: Record<string, unknown>;
    };
    const entries = Object.entries(params ?? {})
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${String(value)}`);
    return entries.length > 0 ? `${pathname}?${entries.join('&')}` : pathname;
  }
  return null;
}

function debounced<Fn extends (...args: never[]) => void>(
  fn: Fn,
  dedupeTarget: boolean,
): Fn {
  return ((...args: Parameters<Fn>) => {
    const now = Date.now();
    if (now - lastNavigationAt < NAVIGATION_DEBOUNCE_MS) {
      return;
    }
    const key = dedupeTarget ? targetKey(args[0]) : null;
    if (key !== null && key === lastTargetKey) {
      return;
    }
    lastNavigationAt = now;
    if (key !== null) {
      lastTargetKey = key;
      targetRouteKey = undefined;
      awaitingTargetRoute = true;
    }
    return fn(...args);
  }) as Fn;
}

function forgetTarget() {
  lastTargetKey = null;
  targetRouteKey = undefined;
  awaitingTargetRoute = false;
}

function leavingScreen<Fn extends (...args: never[]) => unknown>(fn: Fn): Fn {
  return ((...args: Parameters<Fn>) => {
    forgetTarget();
    return fn(...args);
  }) as Fn;
}

/**
 * Call on every navigation state change with the focused route's key (see
 * app/_layout.tsx). The first one after a push is the screen it opened;
 * once another screen is focused, however the user got there -- a swipe
 * back, «تخطي والمتابعة كزائر» replacing it with home, the Android back
 * button -- that target may be opened again. Before, only router.back /
 * dismiss cleared it, so after those «إنشاء حساب» never opened again (QA).
 */
export function onNavigationStateChange(focusedRouteKey: string | undefined) {
  if (lastTargetKey === null) return;
  if (awaitingTargetRoute) {
    awaitingTargetRoute = false;
    targetRouteKey = focusedRouteKey;
    return;
  }
  if (focusedRouteKey !== targetRouteKey) forgetTarget();
}

/**
 * Patches expo-router's shared `router` singleton -- the same object both
 * `import { router } from 'expo-router'` and `useRouter()` return, so this
 * covers every call site in the app with a single change -- so a burst of
 * rapid taps on a nav button/card can only push one screen instead of
 * stacking a duplicate per tap:
 *
 * - a 600ms global lock across push/navigate/replace absorbs fast bursts;
 * - push/navigate additionally refuse a consecutive identical target (same
 *   pathname + params), however far apart the taps are;
 * - back/dismiss/dismissAll clear that memory, so leaving a screen makes
 *   it navigable again.
 *
 * Call once, before any navigation can happen (see app/_layout.tsx).
 */
export function installNavigationDebounce(): void {
  if (installed) return;
  installed = true;

  router.push = debounced(router.push, true);
  router.navigate = debounced(router.navigate, true);
  // replace never stacks screens, so it needs no target dedup -- and
  // swallowing a deliberate same-route replace would break refresh flows.
  // It also leaves the current screen, so the last pushed one is gone
  router.replace = leavingScreen(debounced(router.replace, false));

  router.back = leavingScreen(router.back);
  router.dismiss = leavingScreen(router.dismiss);
  router.dismissAll = leavingScreen(router.dismissAll);
}
