import { Injectable } from '@nestjs/common';
import {
  CompanyIdentityData,
  Identity,
  OfficeIdentityData,
  User,
} from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';

type CompanyIdentity = Identity & {
  companyData: CompanyIdentityData | null;
  user?: User | null;
};
type OfficeIdentity = Identity & {
  officeData: OfficeIdentityData | null;
  user?: User | null;
};

/**
 * The company/office card data the app lists (directory, search, favorites):
 * one place, so every list shows the same rating, counts and activity.
 */
@Injectable()
export class ProviderCardsService {
  constructor(private readonly prisma: PrismaService) {}

  private async reviewStats(userIds: string[]) {
    const stats = await this.prisma.review.groupBy({
      by: ['targetUserId'],
      where: { targetUserId: { in: userIds } },
      _avg: { rating: true },
      _count: { _all: true },
    });
    return {
      avgRating: new Map(stats.map((r) => [r.targetUserId, r._avg.rating])),
      reviewsCount: new Map(stats.map((r) => [r.targetUserId, r._count._all])),
    };
  }

  async formatCompanyCards(identities: CompanyIdentity[]) {
    const identityIds = identities.map((i) => i.id);
    const userIds = identities.map((i) => i.userId);

    const [propertyStats, reviews] = await Promise.all([
      this.prisma.property.groupBy({
        by: ['identityId'],
        where: { identityId: { in: identityIds } },
        _count: { _all: true },
        _max: { createdAt: true },
      }),
      this.reviewStats(userIds),
    ]);

    const projectsCountByIdentity = new Map(
      propertyStats.map((p) => [p.identityId, p._count._all]),
    );
    const lastActivityByIdentity = new Map(
      propertyStats.map((p) => [p.identityId, p._max.createdAt]),
    );

    return identities
      .filter((i) => i.companyData !== null)
      .map((i) => {
        const avgRating = reviews.avgRating.get(i.userId);
        return {
          id: i.id,
          userId: i.userId,
          name: i.companyData!.name,
          category: i.companyData!.services || '',
          rating: avgRating ? Number(avgRating.toFixed(1)) : 0,
          reviewsCount: reviews.reviewsCount.get(i.userId) ?? 0,
          projectsCount: String(projectsCountByIdentity.get(i.id) ?? 0),
          serviceArea: i.companyData!.serviceAreas,
          logoUrl: i.companyData!.logoUrl,
          isVerified: i.companyData!.isVerified,
          lastActivityAt: (
            lastActivityByIdentity.get(i.id) ?? i.companyData!.updatedAt
          ).toISOString(),
        };
      });
  }

  async formatOfficeCards(identities: OfficeIdentity[]) {
    const reviews = await this.reviewStats(identities.map((i) => i.userId));

    return identities
      .filter((i) => i.officeData !== null)
      .map((i) => {
        const avgRating = reviews.avgRating.get(i.userId);
        return {
          id: i.id,
          userId: i.userId,
          name: i.officeData!.name,
          rating: avgRating ? Number(avgRating.toFixed(1)) : 0,
          reviewsCount: reviews.reviewsCount.get(i.userId) ?? 0,
          location: i.officeData!.hqLocation || '',
          logoUrl: i.officeData!.logoUrl,
          isVerified: i.officeData!.isVerified,
          phone: i.user?.phone,
          whatsapp: i.user?.whatsapp || i.user?.phone,
          isFavorite: false,
        };
      });
  }
}
