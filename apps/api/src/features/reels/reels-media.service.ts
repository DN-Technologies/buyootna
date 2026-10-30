import { Injectable } from '@nestjs/common';

import {
  type PresignedPut,
  StorageService,
} from '../../core/storage/storage.service';
import {
  type MediaCheck,
  StoriesMediaService,
} from '../stories/stories-media.service';
import {
  REEL_DEFAULT_PREFIX,
  REEL_VIDEO_MAX_BITS_PER_SECOND,
  REEL_VIDEO_RULES,
} from './reels.constants';

export interface ReelLinks {
  mediaUrl: string;
  posterUrl: string;
}

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const KEY_TAIL = new RegExp(
  `^${UUID}/(${UUID})/(?:media\\.mp4|poster\\.jpg)$`,
  'i',
);

/**
 * Reel files in S3. The upload slot and the file checks are Stories', with
 * the reels' own limits; what differs is where the files live and that their
 * links are public and stable, so phones can cache them.
 */
@Injectable()
export class ReelsMediaService {
  constructor(
    private readonly storage: StorageService,
    private readonly storiesMedia: StoriesMediaService,
  ) {}

  /**
   * REELS_S3_PREFIX lets a development API keep its files apart from
   * production's when both use the same bucket.
   */
  prefix(): string {
    const prefix = process.env.REELS_S3_PREFIX?.trim() || REEL_DEFAULT_PREFIX;
    return prefix.endsWith('/') ? prefix : `${prefix}/`;
  }

  /** {prefix}{identityId}/{reelId}/media.mp4: chosen by the server only. */
  mediaKeyFor(identityId: string, reelId: string): string {
    return `${this.prefix()}${identityId}/${reelId}/media.mp4`;
  }

  /** {prefix}{identityId}/{reelId}/poster.jpg */
  posterKeyFor(identityId: string, reelId: string): string {
    return `${this.prefix()}${identityId}/${reelId}/poster.jpg`;
  }

  /** The reel id a key belongs to, or null for anything not ours. */
  reelIdFromKey(key: string): string | null {
    const prefix = this.prefix();
    if (!key.startsWith(prefix)) return null;
    return KEY_TAIL.exec(key.slice(prefix.length))?.[1] ?? null;
  }

  presignUpload(
    reelId: string,
    key: string,
    contentType: string,
    sizeBytes: number,
  ): Promise<PresignedPut> {
    return this.storiesMedia.presignUpload(reelId, key, contentType, sizeBytes);
  }

  /**
   * Stories' video check with the reels' rules (H.264, ≤ 60.5 s), then the
   * average bitrate, which only the server's own measurement can tell.
   */
  async checkVideo(reel: {
    id: string;
    mediaKey: string;
    mediaContentType: string;
    mediaSizeBytes: number;
    posterKey: string;
    posterSizeBytes: number;
  }): Promise<MediaCheck> {
    const check = await this.storiesMedia.checkVideo(reel, REEL_VIDEO_RULES);
    if (!check.ok || !check.durationMs) return check;
    const bitsPerSecond = (reel.mediaSizeBytes * 8) / (check.durationMs / 1000);
    if (bitsPerSecond > REEL_VIDEO_MAX_BITS_PER_SECOND) {
      return { ok: false, missing: false, reason: 'bitrate_too_high' };
    }
    return check;
  }

  /** The stable public links; REELS_MEDIA_BASE_URL puts a CDN in front. */
  linksFor(reel: { mediaKey: string; posterKey: string }): ReelLinks {
    const base = process.env.REELS_MEDIA_BASE_URL;
    return {
      mediaUrl: this.storage.publicUrl(reel.mediaKey, base),
      posterUrl: this.storage.publicUrl(reel.posterKey, base),
    };
  }

  /** Every file a reel has. */
  keysOf(reel: { mediaKey: string; posterKey: string }): string[] {
    return [reel.mediaKey, reel.posterKey];
  }
}
