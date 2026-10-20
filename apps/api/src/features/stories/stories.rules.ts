import { Prisma } from '@prisma/client';

import type { PrismaService } from '../../core/prisma/prisma.service';
import { assertActiveCompanySubscription } from '../company-subscriptions/company-subscription.rules';
import { assertApprovedProvider } from '../identities/persona-rules';
import {
  STORY_ACTIVE_LIMIT,
  STORY_DAILY_PUBLISH_LIMIT,
  STORY_LIFETIME_MS,
} from './stories.constants';
import {
  propertyNotOwn,
  publisherOnly,
  storyLimitReached,
} from './stories.errors';
import { liveStoryWhere } from './stories.mapper';

const DAY_MS = 24 * 60 * 60 * 1000;

export type Db = Prisma.TransactionClient | PrismaService;

/**
 * Serialises one profile's slot replacement and publishing (the limit
 * counts and the change they guard happen under the same lock).
 */
export const storyLockKey = (identityId: string) => `story:${identityId}`;

/**
 * Approved companies and offices only; a company also needs a running
 * subscription (or trial), the same rule as adding services or projects.
 */
export async function assertCanPublish(
  db: PrismaService,
  identityId: string,
): Promise<void> {
  const identity = await db.identity.findUnique({
    where: { id: identityId },
    select: { type: true },
  });
  if (identity?.type !== 'COMPANY' && identity?.type !== 'OFFICE') {
    throw publisherOnly();
  }
  await assertApprovedProvider(db, identityId);
  await assertActiveCompanySubscription(db, identityId);
}

/**
 * At most 20 live stories, and 30 published in any 24 hours. Pass the
 * transaction holding the profile's lock for an authoritative answer.
 */
export async function assertWithinLimits(
  db: Db,
  identityId: string,
  now: Date,
): Promise<void> {
  const [live, publishedToday] = await Promise.all([
    db.story.count({
      where: { identityId, ...liveStoryWhere(now) },
    }),
    // Deleted stories count too: their rows are kept until publishedAt +
    // 24h, so deleting doesn't free a slot
    db.story.count({
      where: {
        identityId,
        publishedAt: { gt: new Date(now.getTime() - DAY_MS) },
      },
    }),
  ]);
  if (
    live >= STORY_ACTIVE_LIMIT ||
    publishedToday >= STORY_DAILY_PUBLISH_LIMIT
  ) {
    throw storyLimitReached();
  }
}

/** A story may link only to one of its author's own active listings. */
export async function assertOwnListing(
  db: Db,
  propertyId: string,
  identityId: string,
): Promise<void> {
  const property = await db.property.findFirst({
    where: { id: propertyId, identityId, status: 'ACTIVE' },
    select: { id: true },
  });
  if (!property) throw propertyNotOwn();
}

/**
 * How long a deleted story's row is kept: a published one until it no
 * longer counts toward the 24-hour publish limit, an unpublished one not
 * at all.
 */
export function deletedRowKeptUntil(publishedAt: Date | null, now: Date): Date {
  if (!publishedAt) return now;
  const countsUntil = publishedAt.getTime() + STORY_LIFETIME_MS;
  return new Date(Math.max(countsUntil, now.getTime()));
}
