import type { VideoRules } from '../stories/utils/video-probe';

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const MB = 1024 * 1024;

/**
 * Where reel files go unless REELS_S3_PREFIX says otherwise. Public on
 * purpose (it isn't in the bucket policy's private list).
 */
export const REEL_DEFAULT_PREFIX = 'reels/';

// Every reel goes through the phone's trimmer, which makes an H.264 MP4
export const REEL_VIDEO_TYPE = 'video/mp4';
export const REEL_POSTER_TYPE = 'image/jpeg';
export const REEL_VIDEO_MAX_BYTES = 50 * MB;
// 60 s, with room for the encoder's rounding
export const REEL_VIDEO_MAX_MS = 60_500;
// Keeps the feed playable on mobile data if a client skips the trimmer
export const REEL_VIDEO_MAX_BITS_PER_SECOND = 12_000_000;

export const REEL_VIDEO_RULES: VideoRules = {
  maxMs: REEL_VIDEO_MAX_MS,
  maxSide: 1920,
  videoCodecs: ['h264'],
};

export const REEL_CAPTION_MAX = 200;
// From the slot to publish; after it the slot is abandoned
export const REEL_UPLOAD_WINDOW_MS = 30 * MINUTE_MS;
// How long the presigned PUT works (StoriesMediaService signs it)
export const REEL_PUT_TTL_SECONDS = 10 * 60;
// Per author, deleted reels included
export const REEL_DAILY_PUBLISH_LIMIT = 10;
export const REEL_LIMIT_WINDOW_MS = 24 * HOUR_MS;

// The deals the feed can be narrowed to
export const REEL_FILTER_LISTING_TYPES = ['SALE', 'RENT', 'EXCHANGE'] as const;
export type ReelListingType = (typeof REEL_FILTER_LISTING_TYPES)[number];

// Ranking: reels older than this score 0, and aren't scored any more
export const REEL_RANK_WINDOW_MS = 90 * 24 * HOUR_MS;
export const REEL_RANK_BATCH = 500;

export const REEL_COMMENT_MAX = 500;
export const REEL_COMMENT_HOURLY_LIMIT = 20;
export const REEL_COMMENTS_PAGE = 20;

export const REEL_PAGE_DEFAULT = 10;
export const REEL_PAGE_MAX = 20;
// A scroll keeps its snapshot this long; past it the app starts again quietly
export const REEL_CURSOR_MAX_AGE_MS = 6 * HOUR_MS;
// Views the app sends in one request
export const REEL_VIEWS_BATCH_MAX = 50;
// Per-viewer rows are dropped after this; the reel's viewCount stays
export const REEL_VIEW_RETENTION_MS = 180 * 24 * HOUR_MS;

// Cleanup: leaves a publish that started just before the deadline alone
export const REEL_PENDING_GRACE_MS = 5 * MINUTE_MS;
// Reconciliation: files younger than this are never treated as orphans
export const REEL_ORPHAN_MIN_AGE_MS = HOUR_MS;
export const REEL_CLEANUP_BATCH = 200;
