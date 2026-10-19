import type { StoryPhotoType } from './types';

// Matches the API: photos up to 10 MB, as JPEG, PNG or WebP
export const STORY_PHOTO_MAX_BYTES = 10 * 1024 * 1024;
export const STORY_CAPTION_MAX = 200;

const BY_EXTENSION: Record<string, StoryPhotoType> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

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
  const ext = /\.([a-z0-9]+)(?:\?.*)?$/i.exec(uri)?.[1]?.toLowerCase();
  return ext ? (BY_EXTENSION[ext] ?? null) : null;
}

export type StoryPhotoProblem = 'type' | 'size' | null;

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
