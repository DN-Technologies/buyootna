const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const MB = 1024 * 1024;

/** Every story file lives under this prefix, which must stay private. */
export const STORY_PREFIX = 'stories/';

/** Photo types a story accepts, with the file extension each is stored as. */
export const STORY_IMAGE_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const;
export type StoryImageType = keyof typeof STORY_IMAGE_TYPES;
export const STORY_IMAGE_TYPE_LIST = Object.keys(
  STORY_IMAGE_TYPES,
) as StoryImageType[];

export const STORY_IMAGE_MAX_BYTES = 10 * MB;
// Large enough for 48 MP phone photos (8064 × 6048)
export const STORY_IMAGE_MAX_SIDE = 8192;
// Bounds the decoded size on phones (about 200 MB of RGBA at most): a
// flat-colour PNG/WebP can be tiny on disk yet huge once decoded. Still
// allows 48.8 MP photos. Lower to 4096 per side once the app resizes
// before upload.
export const STORY_IMAGE_MAX_PIXELS = 50_000_000;
// How much of the file is read to find the photo's type and size: JPEG
// metadata (EXIF, XMP, ICC) can put the frame header past 256 KB. The
// parser is bounds-checked, so a larger read is only a bigger buffer.
export const STORY_PROBE_BYTES = MB;

export const STORY_CAPTION_MAX = 200;
export const STORY_LIFETIME_MS = 24 * HOUR_MS;
// From the slot to publish; after it the slot is abandoned
export const STORY_UPLOAD_WINDOW_MS = 30 * MINUTE_MS;
// How long the presigned PUT works
export const STORY_PUT_TTL_SECONDS = 10 * 60;
// Media links never outlive this, nor the story. Responses also say
// Cache-Control: private, no-store. The app (phase 3) must show story media
// with expo-image's memory-only (or no) cache and without video caching:
// those caches ignore HTTP headers and would keep files on disk.
export const STORY_MEDIA_URL_MAX_SECONDS = 15 * 60;

// Per author
export const STORY_ACTIVE_LIMIT = 20;
export const STORY_DAILY_PUBLISH_LIMIT = 30;

// Views the app sends in one request
export const STORY_VIEWS_BATCH_MAX = 50;
// The author's viewer list
export const STORY_VIEWERS_DEFAULT_LIMIT = 30;
export const STORY_VIEWERS_MAX_LIMIT = 50;

export const STORY_FEED_DEFAULT_LIMIT = 20;
export const STORY_FEED_MAX_LIMIT = 30;
// A feed cursor older than this is refused (the app starts again)
export const STORY_CURSOR_MAX_AGE_MS = 30 * MINUTE_MS;

// Cleanup: viewers who opened a story just before it expired can finish
export const STORY_EXPIRED_GRACE_MS = HOUR_MS;
// Cleanup: leaves a publish that started just before the deadline alone
export const STORY_PENDING_GRACE_MS = 5 * MINUTE_MS;
// Reconciliation: files younger than this are never treated as orphans
export const STORY_ORPHAN_MIN_AGE_MS = HOUR_MS;
export const STORY_CLEANUP_BATCH = 200;
