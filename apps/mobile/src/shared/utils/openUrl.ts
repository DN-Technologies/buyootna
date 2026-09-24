import { Linking } from 'react-native';

// Contact buttons (call / WhatsApp / maps) leave the app entirely, so the
// router-level navigation debounce never sees them. Without a guard of
// their own, a rapid double-tap fires openURL once per tap -- spawning the
// dialer or WhatsApp repeatedly. Mirrors installNavigationDebounce's two
// rules, sized for link opens:
//
// - a short global lock absorbs fast bursts on any link;
// - a consecutive identical-URL dedupe (same button tapped again a moment
//   later) survives a bit longer, since there is no "back" that clears the
//   memory the way the router patch has.
//
// Rejected opens (scheme unavailable, no WhatsApp installed) resolve
// swallowed on purpose: a throttled tap must not cascade into the call
// site's .catch fallback (e.g. re-opening via wa.me) per tap. Only the
// first, real attempt can trigger a fallback, by rejecting.
const GLOBAL_LOCK_MS = 800;
const SAME_URL_DEDUPE_MS = 2000;

let lastOpenAt = 0;
let lastUrl: string | null = null;

/**
 * Opens a URL at most once per burst. Resolves `true` when the open was
 * handed to the OS, `false` when the call was swallowed as a duplicate --
 * either way it never rejects for a swallowed call, and rejects exactly
 * like Linking.openURL for a real, failed open.
 */
export function openUrlThrottled(url: string): Promise<boolean> {
  const now = Date.now();
  const sinceLast = now - lastOpenAt;
  if (sinceLast < GLOBAL_LOCK_MS) {
    return Promise.resolve(false);
  }
  if (url === lastUrl && sinceLast < SAME_URL_DEDUPE_MS) {
    return Promise.resolve(false);
  }
  lastOpenAt = now;
  lastUrl = url;
  return Linking.openURL(url);
}

/** Fresh throttle state -- test isolation only. */
export function resetLinkThrottle(): void {
  lastOpenAt = 0;
  lastUrl = null;
}
