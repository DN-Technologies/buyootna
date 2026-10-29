import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  IdentityType,
  ListingStatus,
  RequestStatus,
  SlotStatus,
} from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { formatServiceList } from '../users/services/profile-formatting.util';
import {
  OfficeDashboardResponseDto,
  OfficeDashboardServiceDto,
} from './dto/office-dashboard-response.dto';

const DAY_MS = 24 * 60 * 60 * 1000;
// Kuwait has no DST, so "today" starts at a fixed UTC+3 midnight
const KUWAIT_OFFSET_MS = 3 * 60 * 60 * 1000;
// The home shows a short horizontal row of the office's own ads
const HOME_LISTINGS_LIMIT = 10;

export function startOfKuwaitDay(now: Date): Date {
  const local = now.getTime() + KUWAIT_OFFSET_MS;
  return new Date(local - (local % DAY_MS) - KUWAIT_OFFSET_MS);
}

// A request is about a service when its category or title mentions it
// (requests aren't linked to a service row; services are free text)
function mentions(text: string | null, service: string) {
  if (!text) return false;
  const a = text.trim();
  const b = service.trim();
  return a.length > 0 && (a.includes(b) || b.includes(a));
}

@Injectable()
export class OfficesService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(
    identityId: string,
    identityType: IdentityType | string,
    now: Date = new Date(),
  ): Promise<OfficeDashboardResponseDto> {
    if (identityType !== IdentityType.OFFICE) {
      throw new ForbiddenException('هذه الصفحة متاحة لحسابات المكاتب فقط');
    }

    const [
      identity,
      activeListings,
      activeListingsThisWeek,
      viewsAgg,
      newMessagesToday,
      activeSlots,
      listings,
      openRequests,
    ] = await Promise.all([
      this.prisma.identity.findUnique({
        where: { id: identityId },
        select: {
          freeAdsRemaining: true,
          officeData: { select: { name: true, services: true } },
        },
      }),
      this.prisma.property.count({
        where: { identityId, status: ListingStatus.ACTIVE },
      }),
      this.prisma.property.count({
        where: {
          identityId,
          status: ListingStatus.ACTIVE,
          publishedAt: { gte: new Date(now.getTime() - 7 * DAY_MS) },
        },
      }),
      // Lifetime sum across all statuses, like the company dashboard
      this.prisma.property.aggregate({
        where: { identityId },
        _sum: { views: true },
      }),
      this.prisma.message.count({
        where: {
          createdAt: { gte: startOfKuwaitDay(now) },
          senderIdentityId: { not: identityId },
          conversation: { participants: { some: { identityId } } },
        },
      }),
      this.prisma.userPlanSlot.findMany({
        where: {
          identityId,
          status: SlotStatus.ACTIVE,
          adsRemaining: { gt: 0 },
        },
        select: { adsRemaining: true },
      }),
      this.prisma.property.findMany({
        where: { identityId, status: ListingStatus.ACTIVE, isHidden: false },
        orderBy: [
          { isFeatured: 'desc' },
          { publishedAt: { sort: 'desc', nulls: 'last' } },
        ],
        take: HOME_LISTINGS_LIMIT,
        select: {
          id: true,
          type: true,
          category: true,
          price: true,
          images: true,
          isFeatured: true,
          featuredUntil: true,
          views: true,
        },
      }),
      this.prisma.companyRequest.findMany({
        where: {
          targetIdentityId: identityId,
          status: { in: [RequestStatus.PENDING, RequestStatus.RESPONDED] },
        },
        select: { category: true, title: true },
      }),
    ]);

    const ids = listings.map((l) => l.id);
    const [favoriteCounts, chatCounts] = ids.length
      ? await Promise.all([
          this.prisma.favorite.groupBy({
            by: ['propertyId'],
            where: { propertyId: { in: ids } },
            _count: { _all: true },
          }),
          this.prisma.conversation.groupBy({
            by: ['propertyId'],
            where: { propertyId: { in: ids } },
            _count: { _all: true },
          }),
        ])
      : [[], []];
    const favoritesBy = new Map(
      favoriteCounts.map((f) => [f.propertyId, f._count._all]),
    );
    const chatsBy = new Map(
      chatCounts.map((c) => [c.propertyId, c._count._all]),
    );

    const office = identity?.officeData;
    const services: OfficeDashboardServiceDto[] = formatServiceList(
      office?.services ?? null,
      office?.name ?? '',
    ).map(({ title }) => ({
      title,
      openRequests: openRequests.filter(
        (r) => mentions(r.category, title) || mentions(r.title, title),
      ).length,
    }));

    const adsRemaining = activeSlots.reduce(
      (sum, slot) => sum + slot.adsRemaining,
      0,
    );

    return {
      stats: {
        activeListings,
        activeListingsThisWeek,
        activeServices: services.length,
        newMessagesToday,
        totalViews: viewsAgg._sum.views ?? 0,
      },
      billing: {
        hasActivePackage: activeSlots.length > 0,
        adsRemaining,
        freeAdsRemaining: identity?.freeAdsRemaining ?? 0,
      },
      listings: listings.map((l) => ({
        ...l,
        // A lapsed feature keeps isFeatured until the expiry job runs
        isFeatured: l.isFeatured && (!l.featuredUntil || l.featuredUntil > now),
        favoritesCount: favoritesBy.get(l.id) ?? 0,
        chatsCount: chatsBy.get(l.id) ?? 0,
      })),
      services,
    };
  }
}
