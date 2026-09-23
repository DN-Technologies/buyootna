import * as Updates from 'expo-updates';
import { I18nManager } from 'react-native';

let attempted = false;

/**
 * The app is unconditionally RTL (every screen is authored right-to-left),
 * but on a fresh install RN's I18nManager flags aren't persisted yet, so
 * the very first launch lays out LTR and looks mirrored. Persist the flags
 * immediately and reload the JS context once: the reloaded context boots
 * with I18nManager.isRTL = true, so this can never loop, and the LTR frames
 * stay hidden behind the splash screen.
 *
 * Must be called at module scope (app/_layout.tsx), before first paint.
 */
export function ensureRtlDirection(): void {
  if (attempted || I18nManager.isRTL) {
    return;
  }
  attempted = true;
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
  Updates.reloadAsync().catch(() => {
    // Best-effort: worst case the flags still apply on the next manual
    // restart (the pre-fix behavior).
  });
}
