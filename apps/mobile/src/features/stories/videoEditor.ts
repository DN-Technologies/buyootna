import { requireOptionalNativeModule } from 'expo';

import type {
  StoryVideoEditorNative,
  TrimmedVideo,
  TrimVideoOptions,
} from '../../../modules/story-video-editor';
import { STORY_VIDEO_MAX_BYTES, STORY_VIDEO_MAX_MS } from './storyPhoto';

export type { TrimmedVideo, TrimVideoOptions };

// A longer source can be picked when it's cut down here; past this, it's
// likely a mistake (and slow to export)
export const STORY_SOURCE_VIDEO_MAX_MS = 10 * 60_000;
// The shortest part that can be kept
export const STORY_TRIM_MIN_MS = 1_000;

/**
 * The native trimmer (modules/story-video-editor), or null on app builds
 * made before it existed: an over-the-air update on those keeps the old
 * rule (videos of 30 s at most, posted as they are).
 */
export function getVideoEditor(): StoryVideoEditorNative | null {
  return requireOptionalNativeModule<StoryVideoEditorNative>('StoryVideoEditor');
}

export interface TrimRange {
  startMs: number;
  endMs: number;
}

/** A video's first part that a story (or, with `maxMs`, a reel) can hold. */
export function initialTrim(
  durationMs: number | null,
  maxMs: number = STORY_VIDEO_MAX_MS,
): TrimRange {
  return {
    startMs: 0,
    endMs: Math.min(durationMs ?? maxMs, maxMs),
  };
}

/**
 * Whether the video has to go through the trimmer before upload: a part of
 * it, without sound, or too big to upload as it is.
 */
export function needsTrim(
  video: { durationMs: number | null; sizeBytes: number },
  range: TrimRange,
  muted: boolean,
): boolean {
  if (muted || range.startMs > 0) return true;
  if (video.sizeBytes > STORY_VIDEO_MAX_BYTES) return true;
  // The encoder's rounding: a few ms short of the end is the whole video
  return video.durationMs !== null && range.endMs < video.durationMs - 100;
}

/** «0:20» */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}
