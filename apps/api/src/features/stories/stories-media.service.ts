import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

import {
  type PresignedPut,
  StorageService,
} from '../../core/storage/storage.service';
import {
  STORY_IMAGE_TYPES,
  STORY_MEDIA_URL_MAX_SECONDS,
  STORY_POSTER_TYPE,
  STORY_PREFIX,
  STORY_PROBE_BYTES,
  STORY_PUT_TTL_SECONDS,
  STORY_VIDEO_TYPES,
  type StoryImageType,
  type StoryMediaContentType,
} from './stories.constants';
import { dimensionProblem, probeImage } from './utils/image-probe';
import {
  probeVideoFile,
  VideoProbeUnavailableError,
  type VideoRules,
  type VideoVerdict,
} from './utils/video-probe';

// The upload's metadata key that ties the file to its story
const STORY_ID_META = 'story-id';

/** What the stored file turned out to be. */
export type MediaCheck =
  | { ok: true; width: number; height: number; durationMs?: number }
  // Not uploaded (yet): the story stays pending so the app can retry
  | { ok: false; missing: true }
  // Uploaded but not acceptable: the story fails
  | { ok: false; missing: false; reason: string };

export interface StoryMediaRef {
  id: string;
  mediaKey: string;
  posterKey: string | null;
  expiresAt: Date;
}

export interface StoryLinks {
  mediaUrl: string;
  posterUrl: string | null;
  urlExpiresAt: Date;
}

/** Story files in S3: where they go, how they're uploaded, checked and served. */
@Injectable()
export class StoriesMediaService {
  // ffprobe on a local file; replaced in tests
  probeVideo: (path: string, rules?: VideoRules) => Promise<VideoVerdict> =
    probeVideoFile;

  constructor(private readonly storage: StorageService) {}

  /** stories/{identityId}/{storyId}/media.{ext}: chosen by the server only. */
  mediaKeyFor(
    identityId: string,
    storyId: string,
    contentType: StoryMediaContentType,
  ): string {
    const ext =
      contentType in STORY_IMAGE_TYPES
        ? STORY_IMAGE_TYPES[contentType as StoryImageType]
        : STORY_VIDEO_TYPES[contentType as keyof typeof STORY_VIDEO_TYPES];
    return `${STORY_PREFIX}${identityId}/${storyId}/media.${ext}`;
  }

  /** stories/{identityId}/{storyId}/poster.jpg: a video story's still. */
  posterKeyFor(identityId: string, storyId: string): string {
    return `${STORY_PREFIX}${identityId}/${storyId}/poster.jpg`;
  }

  /** The story id a key belongs to, or null for anything not ours. */
  storyIdFromKey(key: string): string | null {
    const match =
      /^stories\/[0-9a-f-]{36}\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/[a-z]+\.[a-z0-9]+$/i.exec(
        key,
      );
    return match ? match[1] : null;
  }

  presignUpload(
    storyId: string,
    key: string,
    contentType: string,
    sizeBytes: number,
  ): Promise<PresignedPut> {
    return this.storage.presignPut(
      key,
      {
        contentType,
        contentLength: sizeBytes,
        metadata: { [STORY_ID_META]: storyId },
      },
      STORY_PUT_TTL_SECONDS,
    );
  }

  /**
   * Checks the uploaded photo against what was recorded for its slot: it
   * exists, has the exact size and type, carries this story's id, and its
   * own bytes say it is that kind of image, within the size limits.
   */
  async checkImage(story: {
    id: string;
    mediaKey: string;
    mediaContentType: string;
    mediaSizeBytes: number;
  }): Promise<MediaCheck> {
    const head = await this.storage.headObject(story.mediaKey);
    if (!head) return { ok: false, missing: true };
    if (head.contentLength !== story.mediaSizeBytes) {
      return { ok: false, missing: false, reason: 'size_mismatch' };
    }
    if (head.contentType !== story.mediaContentType) {
      return { ok: false, missing: false, reason: 'type_mismatch' };
    }
    if (head.metadata[STORY_ID_META] !== story.id) {
      return { ok: false, missing: false, reason: 'metadata_mismatch' };
    }

    const start = await this.storage.getRange(
      story.mediaKey,
      0,
      Math.min(STORY_PROBE_BYTES, head.contentLength) - 1,
    );
    const image = probeImage(start);
    if (!image) return { ok: false, missing: false, reason: 'not_an_image' };
    if (image.type !== story.mediaContentType) {
      return { ok: false, missing: false, reason: 'content_mismatch' };
    }
    const sizeProblem = dimensionProblem(image.width, image.height);
    if (sizeProblem) return { ok: false, missing: false, reason: sizeProblem };
    return { ok: true, width: image.width, height: image.height };
  }

  /**
   * Checks an uploaded video and its poster. Both must match their slot
   * (size, type, this story's id); the poster must really be a JPEG within
   * the photo limits; the video is downloaded to a private temp folder and
   * judged by ffprobe (container, codecs, streams, ≤ 30.5 s, ≤ 1920 px),
   * then the copy is removed. Reels reuse this with their own `rules`.
   */
  async checkVideo(
    story: {
      id: string;
      mediaKey: string;
      mediaContentType: string;
      mediaSizeBytes: number;
      posterKey: string | null;
      posterSizeBytes: number | null;
    },
    rules?: VideoRules,
  ): Promise<MediaCheck> {
    if (!story.posterKey || !story.posterSizeBytes) {
      return { ok: false, missing: false, reason: 'poster_missing' };
    }
    const [head, posterHead] = await Promise.all([
      this.storage.headObject(story.mediaKey),
      this.storage.headObject(story.posterKey),
    ]);
    if (!head || !posterHead) return { ok: false, missing: true };
    const mismatch =
      this.headMismatch(
        head,
        story.id,
        story.mediaSizeBytes,
        story.mediaContentType,
      ) ??
      this.headMismatch(
        posterHead,
        story.id,
        story.posterSizeBytes,
        STORY_POSTER_TYPE,
        'poster_',
      );
    if (mismatch) return { ok: false, missing: false, reason: mismatch };

    const posterStart = await this.storage.getRange(
      story.posterKey,
      0,
      Math.min(STORY_PROBE_BYTES, posterHead.contentLength) - 1,
    );
    const poster = probeImage(posterStart);
    if (!poster || poster.type !== STORY_POSTER_TYPE) {
      return { ok: false, missing: false, reason: 'poster_not_jpeg' };
    }
    if (dimensionProblem(poster.width, poster.height)) {
      return { ok: false, missing: false, reason: 'poster_too_large' };
    }

    const dir = await mkdtemp(join(tmpdir(), 'story-'));
    try {
      const file = join(dir, 'media');
      await this.storage.downloadToFile(
        story.mediaKey,
        file,
        story.mediaSizeBytes,
      );
      const verdict = await (rules
        ? this.probeVideo(file, rules)
        : this.probeVideo(file));
      if (!verdict.ok)
        return { ok: false, missing: false, reason: verdict.reason };
      return {
        ok: true,
        width: verdict.width,
        height: verdict.height,
        durationMs: verdict.durationMs,
      };
    } catch (error) {
      if (error instanceof VideoProbeUnavailableError) {
        // A server problem, not the file's: the story stays pending
        throw new ServiceUnavailableException({
          statusCode: 503,
          message: 'تعذر فحص الفيديو حالياً، حاول مرة أخرى',
          code: 'STORY_PROBE_UNAVAILABLE',
        });
      }
      throw error;
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }

  private headMismatch(
    head: {
      contentLength: number;
      contentType: string | null;
      metadata: Record<string, string>;
    },
    storyId: string,
    sizeBytes: number,
    contentType: string,
    prefix = '',
  ): string | null {
    if (head.contentLength !== sizeBytes) return `${prefix}size_mismatch`;
    if (head.contentType !== contentType) return `${prefix}type_mismatch`;
    if (head.metadata[STORY_ID_META] !== storyId)
      return `${prefix}metadata_mismatch`;
    return null;
  }

  /**
   * Signed links that stop working at the earlier of 15 minutes and the
   * story's expiry, and tell caches to keep the file no longer. A story
   * shown after its 24 hours (its author's archive, a highlight) gets the
   * full 15 minutes.
   */
  async linksFor(
    story: StoryMediaRef,
    now = new Date(),
    { afterExpiry = false }: { afterExpiry?: boolean } = {},
  ): Promise<StoryLinks> {
    const untilExpiry = Math.floor(
      (story.expiresAt.getTime() - now.getTime()) / 1000,
    );
    const ttl = afterExpiry
      ? STORY_MEDIA_URL_MAX_SECONDS
      : Math.max(1, Math.min(STORY_MEDIA_URL_MAX_SECONDS, untilExpiry));
    const [mediaUrl, posterUrl] = await Promise.all([
      this.storage.signedMediaUrl(story.mediaKey, ttl),
      story.posterKey
        ? this.storage.signedMediaUrl(story.posterKey, ttl)
        : Promise.resolve(null),
    ]);
    return {
      mediaUrl,
      posterUrl,
      urlExpiresAt: new Date(now.getTime() + ttl * 1000),
    };
  }

  /** Every file a story has. */
  keysOf(story: { mediaKey: string; posterKey: string | null }): string[] {
    return story.posterKey
      ? [story.mediaKey, story.posterKey]
      : [story.mediaKey];
  }
}
