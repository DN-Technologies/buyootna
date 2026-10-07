import { PrismaService } from '../prisma/prisma.service';
import {
  IdentityStatsService,
  RESPONSE_TIME_MIN_SAMPLE,
} from './identity-stats.service';
import { PresenceService } from './presence.service';

describe('IdentityStatsService', () => {
  const lastSeen = new Date('2026-10-07T09:00:00Z');
  let prisma: {
    identity: { findMany: jest.Mock };
    review: { findMany: jest.Mock };
    propertyDeletionLog: { groupBy: jest.Mock };
    $queryRaw: jest.Mock;
  };
  let presence: { presenceOf: jest.Mock };
  let service: IdentityStatsService;

  beforeEach(() => {
    prisma = {
      identity: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'i1', lastSeenAt: lastSeen },
          { id: 'i2', lastSeenAt: null },
        ]),
      },
      review: {
        findMany: jest.fn().mockResolvedValue([
          { rating: 5, targetIdentityId: 'i1', targetUserId: 'i1' },
          { rating: 4, targetIdentityId: 'i1', targetUserId: 'i1' },
          // A review stored before identities only knows the route id
          { rating: 4, targetIdentityId: null, targetUserId: 'i1' },
        ]),
      },
      propertyDeletionLog: {
        groupBy: jest
          .fn()
          .mockResolvedValue([{ identityId: 'i1', _count: { _all: 3 } }]),
      },
      $queryRaw: jest.fn(),
    };
    presence = {
      presenceOf: jest.fn((id: string, seen: Date | null) => ({
        isOnline: id === 'i1',
        lastSeenAt: seen?.toISOString() ?? null,
      })),
    };
    service = new IdentityStatsService(
      prisma as unknown as PrismaService,
      presence as unknown as PresenceService,
    );
  });

  it('averages the same reviews the summary tab counts, per identity', async () => {
    const stats = await service.getStats(['i1', 'i2']);

    expect(prisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { targetIdentityId: { in: ['i1', 'i2'] } },
            { targetUserId: { in: ['i1', 'i2'] } },
          ],
        },
      }),
    );
    expect(stats.get('i1')).toMatchObject({ rating: 4.3, reviewsCount: 3 });
    expect(stats.get('i2')).toMatchObject({ rating: 0, reviewsCount: 0 });
  });

  it('counts ads deleted as sold (تم البيع)', async () => {
    const stats = await service.getStats(['i1', 'i2']);

    expect(prisma.propertyDeletionLog.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { identityId: { in: ['i1', 'i2'] }, reason: 'SOLD' },
      }),
    );
    expect(stats.get('i1')?.soldCount).toBe(3);
    expect(stats.get('i2')?.soldCount).toBe(0);
  });

  it('reports presence from the presence service', async () => {
    const stats = await service.getStats(['i1', 'i2']);

    expect(stats.get('i1')?.presence).toEqual({
      isOnline: true,
      lastSeenAt: lastSeen.toISOString(),
    });
    expect(stats.get('i2')?.presence.isOnline).toBe(false);
  });

  it('skips the queries for an empty list', async () => {
    expect((await service.getStats([])).size).toBe(0);
    expect(prisma.identity.findMany).not.toHaveBeenCalled();
  });

  describe('getResponseTime', () => {
    it('returns the median once there are enough answered chats', async () => {
      prisma.$queryRaw.mockResolvedValue([
        { median: 754.6, n: RESPONSE_TIME_MIN_SAMPLE },
      ]);

      expect(await service.getResponseTime('i1')).toEqual({
        medianSeconds: 755,
        sampleSize: RESPONSE_TIME_MIN_SAMPLE,
      });
    });

    it('returns null below the minimum sample', async () => {
      prisma.$queryRaw.mockResolvedValue([
        { median: 60, n: RESPONSE_TIME_MIN_SAMPLE - 1 },
      ]);

      expect(await service.getResponseTime('i1')).toBeNull();
    });

    it('returns null with no answered chats', async () => {
      prisma.$queryRaw.mockResolvedValue([{ median: null, n: 0 }]);

      expect(await service.getResponseTime('i1')).toBeNull();
    });

    it('caches the result per identity', async () => {
      prisma.$queryRaw.mockResolvedValue([{ median: 120, n: 5 }]);

      await service.getResponseTime('i1');
      await service.getResponseTime('i1');

      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    });
  });
});
