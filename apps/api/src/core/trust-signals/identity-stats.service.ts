import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IdentityPresence, PresenceService } from './presence.service';

// Fewer real replies than this says nothing about response speed
export const RESPONSE_TIME_MIN_SAMPLE = 3;
const RESPONSE_TIME_WINDOW_DAYS = 90;
const RESPONSE_TIME_CACHE_MS = 15 * 60_000;
// The "تم البيع" option when deleting an ad
const SOLD_REASON = 'SOLD';

export interface ResponseTime {
  medianSeconds: number;
  sampleSize: number;
}

export interface IdentityStats {
  rating: number;
  reviewsCount: number;
  soldCount: number;
  presence: IdentityPresence;
}

const EMPTY_PRESENCE: IdentityPresence = { isOnline: false, lastSeenAt: null };

/**
 * Real trust signals shown about an advertiser/provider persona: rating and
 * review count, ads sold, activity and response speed. Replaces the
 * hardcoded 4.5 stars / "نشط الآن" / "30 دقيقة" the screens used to show.
 */
@Injectable()
export class IdentityStatsService {
  private readonly responseTimeCache = new Map<
    string,
    { value: ResponseTime | null; expiresAt: number }
  >();

  constructor(
    private readonly prisma: PrismaService,
    private readonly presence: PresenceService,
  ) {}

  async getStats(identityIds: string[]): Promise<Map<string, IdentityStats>> {
    const ids = [...new Set(identityIds.filter(Boolean))];
    const result = new Map<string, IdentityStats>();
    if (ids.length === 0) return result;

    const [identities, reviews, sold] = await Promise.all([
      this.prisma.identity.findMany({
        where: { id: { in: ids } },
        select: { id: true, lastSeenAt: true },
      }),
      // Same matching as the reviews summary tab (ReviewsService.getSummary),
      // so the header and the summary always agree
      this.prisma.review.findMany({
        where: {
          OR: [
            { targetIdentityId: { in: ids } },
            { targetUserId: { in: ids } },
          ],
        },
        select: { rating: true, targetIdentityId: true, targetUserId: true },
      }),
      this.prisma.propertyDeletionLog.groupBy({
        by: ['identityId'],
        where: { identityId: { in: ids }, reason: SOLD_REASON },
        _count: { _all: true },
      }),
    ]);

    const ratings = new Map<string, number[]>();
    for (const r of reviews) {
      const target = ids.includes(r.targetIdentityId ?? '')
        ? r.targetIdentityId!
        : r.targetUserId!;
      ratings.set(target, [...(ratings.get(target) ?? []), r.rating]);
    }
    const soldCount = new Map(
      sold.map((s) => [s.identityId ?? '', s._count._all]),
    );
    const lastSeen = new Map(identities.map((i) => [i.id, i.lastSeenAt]));

    for (const id of ids) {
      const list = ratings.get(id) ?? [];
      result.set(id, {
        rating: list.length
          ? Number((list.reduce((a, b) => a + b, 0) / list.length).toFixed(1))
          : 0,
        reviewsCount: list.length,
        soldCount: soldCount.get(id) ?? 0,
        presence: lastSeen.has(id)
          ? this.presence.presenceOf(id, lastSeen.get(id) ?? null)
          : EMPTY_PRESENCE,
      });
    }
    return result;
  }

  async getOne(identityId: string): Promise<IdentityStats> {
    return (
      (await this.getStats([identityId])).get(identityId) ?? {
        rating: 0,
        reviewsCount: 0,
        soldCount: 0,
        presence: EMPTY_PRESENCE,
      }
    );
  }

  /**
   * Median time this persona takes to answer a chat, over the last 90 days.
   * A "question" is a message from someone else that follows one of this
   * persona's messages (or opens the conversation); its answer is this
   * persona's next message there. Null until there are enough answers.
   */
  async getResponseTime(identityId: string): Promise<ResponseTime | null> {
    const cached = this.responseTimeCache.get(identityId);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    const rows = await this.prisma.$queryRaw<
      { median: number | null; n: number }[]
    >`
      WITH m AS (
        SELECT msg."conversationId", msg."createdAt",
               msg."senderIdentityId" = ${identityId} AS mine,
               LAG(msg."senderIdentityId" = ${identityId}) OVER (
                 PARTITION BY msg."conversationId" ORDER BY msg."createdAt"
               ) AS prev_mine
        FROM "Message" msg
        JOIN "ConversationParticipant" cp
          ON cp."conversationId" = msg."conversationId"
         AND cp."identityId" = ${identityId}
        WHERE msg."senderIdentityId" IS NOT NULL
          AND msg."createdAt" > NOW() - make_interval(days => ${RESPONSE_TIME_WINDOW_DAYS})
      ),
      questions AS (
        SELECT "conversationId", "createdAt" FROM m
        WHERE NOT mine AND (prev_mine IS NULL OR prev_mine)
      ),
      answers AS (
        SELECT EXTRACT(EPOCH FROM (
          SELECT MIN(a."createdAt") FROM m a
          WHERE a."conversationId" = q."conversationId"
            AND a.mine AND a."createdAt" > q."createdAt"
        ) - q."createdAt") AS seconds
        FROM questions q
      )
      SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY seconds) AS median,
             COUNT(seconds)::int AS n
      FROM answers WHERE seconds IS NOT NULL
    `;

    const { median, n } = rows[0] ?? { median: null, n: 0 };
    const value =
      median !== null && n >= RESPONSE_TIME_MIN_SAMPLE
        ? { medianSeconds: Math.round(Number(median)), sampleSize: n }
        : null;
    this.responseTimeCache.set(identityId, {
      value,
      expiresAt: Date.now() + RESPONSE_TIME_CACHE_MS,
    });
    return value;
  }
}
