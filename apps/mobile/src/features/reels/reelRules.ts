import type { ViewerReel } from './types';

// Current, previous and next: everything else shows its poster
export const REEL_PLAYERS = 3;

// Matches the API: up to 60 s and 50 MB once exported by the trimmer
export const REEL_VIDEO_MAX_MS = 60_000;
export const REEL_VIDEO_MAX_BYTES = 50 * 1024 * 1024;
// The server allows 60.5 s for the encoder's rounding
const REEL_VIDEO_TOLERANCE_MS = 500;

/** What stops a video exported by the trimmer from being posted, if anything. */
export function reelVideoProblem(
  sizeBytes: number,
  durationMs: number,
): 'size' | 'length' | null {
  if (sizeBytes < 1 || sizeBytes > REEL_VIDEO_MAX_BYTES) return 'size';
  if (durationMs > REEL_VIDEO_MAX_MS + REEL_VIDEO_TOLERANCE_MS) return 'length';
  return null;
}

// A view counts after this long, or at the end of a shorter reel
export const REEL_VIEW_AFTER_SECONDS = 3;

/** Which player plays this place in the list: a place keeps it while near. */
export const reelSlot = (index: number) => index % REEL_PLAYERS;

/** The places that have a player while `active` is on screen. */
export const reelWindow = (active: number, count: number): number[] =>
  [active, active + 1, active - 1].filter((i) => i >= 0 && i < count);

/** Adds a page, dropping what's already shown (a scroll that started again). */
export function mergeReels(
  current: ViewerReel[],
  page: ViewerReel[],
): ViewerReel[] {
  const known = new Set(current.map((r) => r.id));
  return [...current, ...page.filter((r) => !known.has(r.id))];
}

/** Whether this much of a reel has played to count as a view. */
export function reachedView(
  currentTime: number,
  durationSeconds: number | null | undefined,
): boolean {
  const needed = durationSeconds
    ? Math.min(REEL_VIEW_AFTER_SECONDS, durationSeconds * 0.9)
    : REEL_VIEW_AFTER_SECONDS;
  return currentTime >= needed;
}

/** Played to (nearly) the end: it loops, so it may never quite reach it. */
export const reachedEnd = (currentTime: number, duration: number) =>
  duration > 0 && currentTime >= duration * 0.9;

/** «1.2 ألف» past a thousand, so the counts stay short beside the video. */
export function formatReelCount(count: number): string {
  if (count < 1000) return String(count);
  if (count < 1_000_000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')} ألف`;
  }
  return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')} مليون`;
}
