import { Prisma } from '@prisma/client';

import { notBlockedUserWhere } from '../../blocks/block.rules';

/**
 * Defense-in-depth alongside PropertiesExpiryService's cron: that job is the
 * source of truth for flipping status ACTIVE -> EXPIRED once a listing's
 * endDate passes, but only runs every 10 minutes. Public-facing queries
 * (feed, map) also filter on endDate directly so a listing can never appear
 * in the gap before the next cron tick catches it. ACTIVE listings always
 * have endDate set (see PropertiesMutationsService), so `endDate: null` here
 * only guards against unexpected legacy data — it never lets a real expiry
 * slip through.
 *
 * Returns a fresh where-fragment each call (not a shared constant) so
 * `new Date()` reflects the actual request time rather than module load time.
 */
export function notExpiredWhere(): Prisma.PropertyWhereInput {
  return { OR: [{ endDate: null }, { endDate: { gt: new Date() } }] };
}

/**
 * Hides a listing whose owner suspended their account (تعطيل مؤقت) or was
 * blocked/disabled by an admin. Suspension flips only the user's flags, so
 * their ads come back by themselves when they sign in again. Given the
 * signed-in viewer, it also hides the listings of an account blocked
 * either way with them (Guideline 1.2), back as soon as it is unblocked.
 */
export function ownerActiveWhere(
  viewerUserId?: string,
): Prisma.PropertyWhereInput {
  return {
    identity: {
      user: {
        isDisabled: false,
        isBlocked: false,
        ...(viewerUserId ? notBlockedUserWhere(viewerUserId) : {}),
      },
    },
  };
}

/** Everything a listing needs to be shown to the public (and the viewer). */
export function publicListingWhere(
  viewerUserId?: string,
): Prisma.PropertyWhereInput {
  return {
    AND: [
      { status: 'ACTIVE', isHidden: false },
      notExpiredWhere(),
      ownerActiveWhere(viewerUserId),
    ],
  };
}

/**
 * Narrows a query's own filter to public listings, combined with AND so the
 * query's OR/AND clauses can't be overwritten.
 */
export function withPublicListing(
  where: Prisma.PropertyWhereInput,
  viewerUserId?: string,
): Prisma.PropertyWhereInput {
  return { AND: [where, publicListingWhere(viewerUserId)] };
}
