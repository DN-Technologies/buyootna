import { Injectable } from '@nestjs/common';
import { IdentityType } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { PresenceService } from '../../core/trust-signals/presence.service';
import { requestMetrics } from '../../core/observability/request-metrics';

const DAY_MS = 24 * 60 * 60 * 1000;
// A session that made a request this recently counts as active now
const ACTIVE_WINDOW_MS = 15 * 60 * 1000;

function startOfToday(now: Date): Date {
  const day = new Date(now);
  day.setHours(0, 0, 0, 0);
  return day;
}

/** المقاييس: API traffic (requests, errors, latency) and platform activity. */
@Injectable()
export class TestingMetricsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly presence: PresenceService,
  ) {}

  async snapshot(minutes = 60) {
    return {
      traffic: requestMetrics.snapshot(minutes),
      platform: await this.platform(),
    };
  }

  private async platform(now = new Date()) {
    const today = startOfToday(now);
    const weekAgo = new Date(now.getTime() - 7 * DAY_MS);
    const [
      usersTotal,
      usersToday,
      usersWeek,
      newIdentities,
      activeSessions,
      activeAds,
      liveStories,
      pendingReports,
      paidToday,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: today } } }),
      this.prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      this.prisma.identity.groupBy({
        by: ['type'],
        where: { createdAt: { gte: weekAgo } },
        _count: { _all: true },
      }),
      this.prisma.session.count({
        where: {
          isActive: true,
          lastActive: { gte: new Date(now.getTime() - ACTIVE_WINDOW_MS) },
        },
      }),
      this.prisma.property.count({ where: { status: 'ACTIVE' } }),
      this.prisma.story.count({
        where: { status: 'ACTIVE', expiresAt: { gt: now } },
      }),
      this.prisma.report.count({ where: { status: 'PENDING' } }),
      this.prisma.invoice.aggregate({
        where: { status: 'PAID', paidAt: { gte: today } },
        _count: { _all: true },
        _sum: { amount: true },
      }),
    ]);
    const identities = (type: IdentityType) =>
      newIdentities.find((g) => g.type === type)?._count._all ?? 0;

    return {
      users: { total: usersTotal, today: usersToday, last7Days: usersWeek },
      newIdentities7Days: {
        individual: identities(IdentityType.INDIVIDUAL),
        company: identities(IdentityType.COMPANY),
        office: identities(IdentityType.OFFICE),
      },
      activeSessions,
      appsOpenNow: this.presence.connectedCount(),
      activeAds,
      liveStories,
      pendingReports,
      paidToday: {
        invoices: paidToday._count._all,
        amount: paidToday._sum.amount ?? 0,
      },
    };
  }
}
