import { Prisma } from '@prisma/client';

import type {
  AuthorReelDto,
  ReelPropertyLinkDto,
} from './dto/reel-response.dto';
import type { ReelLinks } from './reels-media.service';

/** What a reel response needs from the row. */
export const REEL_SELECT = {
  id: true,
  identityId: true,
  mediaKey: true,
  posterKey: true,
  width: true,
  height: true,
  durationMs: true,
  caption: true,
  publishedAt: true,
  createdAt: true,
  viewCount: true,
  likeCount: true,
  property: {
    select: {
      id: true,
      type: true,
      category: true,
      location: true,
      images: true,
      status: true,
      isHidden: true,
      endDate: true,
      identityId: true,
    },
  },
} satisfies Prisma.ReelSelect;

export type ReelRow = Prisma.ReelGetPayload<{ select: typeof REEL_SELECT }>;

/** The linked listing, only while it's the author's and shown to the public. */
export function toPropertyLink(
  reel: ReelRow,
  now: Date,
): ReelPropertyLinkDto | null {
  const p = reel.property;
  if (
    !p ||
    p.status !== 'ACTIVE' ||
    p.isHidden ||
    (p.endDate && p.endDate <= now) ||
    p.identityId !== reel.identityId
  ) {
    return null;
  }
  return {
    id: p.id,
    type: p.type,
    category: p.category,
    location: p.location,
    coverUrl: p.images[0] ?? null,
  };
}

export function toAuthorReelDto(
  reel: ReelRow,
  links: ReelLinks,
  now: Date,
): AuthorReelDto {
  return {
    id: reel.id,
    mediaUrl: links.mediaUrl,
    posterUrl: links.posterUrl,
    width: reel.width,
    height: reel.height,
    durationMs: reel.durationMs,
    caption: reel.caption,
    property: toPropertyLink(reel, now),
    // Only published reels are mapped
    publishedAt: (reel.publishedAt ?? reel.createdAt).toISOString(),
    viewCount: reel.viewCount,
    likeCount: reel.likeCount,
  };
}
