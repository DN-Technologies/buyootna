import type { ViewerStory } from '../types';

export const GOLD = '#C5A36D';
export const NAVY = '#15304D';

/** A story's still: a photo itself, a video's poster. */
export function stillOf(story: ViewerStory): string | null {
  return story.posterUrl ?? (story.mediaType === 'IMAGE' ? story.mediaUrl : null);
}

const HOUR_MS = 60 * 60 * 1000;

/** Whole hours left before a live story ends (0 in its last hour). */
export function hoursLeft(story: ViewerStory, now = Date.now()): number {
  return Math.max(0, Math.floor((Date.parse(story.expiresAt) - now) / HOUR_MS));
}

export function isLive(story: ViewerStory, now = Date.now()): boolean {
  return Date.parse(story.expiresAt) > now;
}

/** «23 أكتوبر»: the day a story was posted. */
export function postedDay(story: ViewerStory): string {
  return new Date(story.publishedAt).toLocaleDateString('ar-KW-u-nu-latn', {
    day: 'numeric',
    month: 'long',
  });
}
