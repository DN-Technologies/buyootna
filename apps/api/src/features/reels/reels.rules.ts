import { Prisma } from '@prisma/client';

import type { PrismaService } from '../../core/prisma/prisma.service';
import { assertActiveCompanySubscription } from '../company-subscriptions/company-subscription.rules';
import { assertApprovedProvider } from '../identities/persona-rules';
import {
  REEL_DAILY_PUBLISH_LIMIT,
  REEL_LIMIT_WINDOW_MS,
} from './reels.constants';
import {
  propertyNotOwn,
  publisherOnly,
  reelLimitReached,
} from './reels.errors';

export type Db = Prisma.TransactionClient | PrismaService;

/**
 * Serialises one profile's slot replacement and publishing (the limit count
 * and the change it guards happen under the same lock).
 */
export const reelLockKey = (identityId: string) => `reel:${identityId}`;

/**
 * Approved companies and offices only; a company also needs a running
 * subscription (or trial), the same rule as posting a story.
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
 * At most 10 published in any 24 hours; deleting one doesn't free a place.
 * Pass the transaction holding the profile's lock for an authoritative
 * answer.
 */
export async function assertWithinLimit(
  db: Db,
  identityId: string,
  now: Date,
): Promise<void> {
  const publishedToday = await db.reel.count({
    where: {
      identityId,
      publishedAt: { gt: new Date(now.getTime() - REEL_LIMIT_WINDOW_MS) },
    },
  });
  if (publishedToday >= REEL_DAILY_PUBLISH_LIMIT) throw reelLimitReached();
}

/** A reel may link only to one of its author's own active listings. */
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
