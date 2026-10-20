import type { StoryPhotoType, StoryVideoType } from './types';

// Matches the API: photos up to 10 MB, as JPEG, PNG or WebP; videos up to
// 50 MB and 30 s, as MP4 or MOV, with a JPEG poster up to 1 MB
export const STORY_PHOTO_MAX_BYTES = 10 * 1024 * 1024;
export const STORY_VIDEO_MAX_BYTES = 50 * 1024 * 1024;
export const STORY_VIDEO_MAX_MS = 30_000;
// The server allows 30.5 s for the encoder's rounding
const STORY_VIDEO_TOLERANCE_MS = 500;
export const STORY_POSTER_MAX_BYTES = 1024 * 1024;
export const STORY_CAPTION_MAX = 200;

const BY_EXTENSION: Record<string, StoryPhotoType> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};
const VIDEO_BY_EXTENSION: Record<string, StoryVideoType> = {
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  mov: 'video/quicktime',
};

const extensionOf = (uri: string) =>
  /\.([a-z0-9]+)(?:\?.*)?$/i.exec(uri)?.[1]?.toLowerCase();

/**
 * The photo's type as the API accepts it, from the picker's mime type or
 * the file name; null for anything else (HEIC included: the picker is
 * asked for a compatible JPEG).
 */
export function storyPhotoType(
  mimeType: string | null | undefined,
  uri: string,
): StoryPhotoType | null {
  const mime = mimeType?.toLowerCase();
  if (mime === 'image/jpeg' || mime === 'image/jpg') return 'image/jpeg';
  if (mime === 'image/png' || mime === 'image/webp') return mime;
  if (mime) return null;
  const ext = extensionOf(uri);
  return ext ? (BY_EXTENSION[ext] ?? null) : null;
}

/** The video's type as the API accepts it (MP4 or MOV), or null. */
export function storyVideoType(
  mimeType: string | null | undefined,
  uri: string,
): StoryVideoType | null {
  const mime = mimeType?.toLowerCase();
  if (mime === 'video/mp4' || mime === 'video/quicktime') return mime;
  if (mime && mime !== 'video/*') return null;
  const ext = extensionOf(uri);
  return ext ? (VIDEO_BY_EXTENSION[ext] ?? null) : null;
}

export type StoryPhotoProblem = 'type' | 'size' | null;
export type StoryVideoProblem = 'type' | 'size' | 'length' | null;

/** What stops this photo from being posted, if anything. */
export function storyPhotoProblem(
  type: StoryPhotoType | null,
  sizeBytes: number | undefined,
): StoryPhotoProblem {
  if (!type) return 'type';
  if (!sizeBytes || sizeBytes < 1 || sizeBytes > STORY_PHOTO_MAX_BYTES) {
    return 'size';
  }
  return null;
}

/**
 * What stops this video from being posted, if anything. An unknown length
 * passes here: the server measures it anyway.
 */
export function storyVideoProblem(
  type: StoryVideoType | null,
  sizeBytes: number | undefined,
  durationMs: number | null | undefined,
): StoryVideoProblem {
  if (!type) return 'type';
  if (!sizeBytes || sizeBytes < 1 || sizeBytes > STORY_VIDEO_MAX_BYTES) {
    return 'size';
  }
  if (durationMs && durationMs > STORY_VIDEO_MAX_MS + STORY_VIDEO_TOLERANCE_MS) {
    return 'length';
  }
  return null;
}
