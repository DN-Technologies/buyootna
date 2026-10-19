import { Injectable } from '@nestjs/common';

import {
  type PresignedPut,
  StorageService,
} from '../../core/storage/storage.service';
import {
  STORY_IMAGE_TYPES,
  STORY_MEDIA_URL_MAX_SECONDS,
  STORY_PREFIX,
  STORY_PROBE_BYTES,
  STORY_PUT_TTL_SECONDS,
  type StoryImageType,
} from './stories.constants';
import { dimensionProblem, probeImage } from './utils/image-probe';

// The upload's metadata key that ties the file to its story
const STORY_ID_META = 'story-id';

/** What the stored file turned out to be. */
export type MediaCheck =
  | { ok: true; width: number; height: number }
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
  constructor(private readonly storage: StorageService) {}

  /** stories/{identityId}/{storyId}/media.{ext}: chosen by the server only. */
  mediaKeyFor(
    identityId: string,
    storyId: string,
    contentType: StoryImageType,
  ): string {
    return `${STORY_PREFIX}${identityId}/${storyId}/media.${STORY_IMAGE_TYPES[contentType]}`;
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
   * Signed links that stop working at the earlier of one hour and the
   * story's expiry, and tell caches to keep the file no longer.
   */
  async linksFor(story: StoryMediaRef, now = new Date()): Promise<StoryLinks> {
    const untilExpiry = Math.floor(
      (story.expiresAt.getTime() - now.getTime()) / 1000,
    );
    const ttl = Math.max(1, Math.min(STORY_MEDIA_URL_MAX_SECONDS, untilExpiry));
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
