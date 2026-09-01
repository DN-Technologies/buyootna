import { Prisma } from '@prisma/client';

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
