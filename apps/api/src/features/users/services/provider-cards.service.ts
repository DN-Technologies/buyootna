import { Injectable } from '@nestjs/common';
import {
  CompanyIdentityData,
  Identity,
  OfficeIdentityData,
  User,
} from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { IdentityStatsService } from '../../../core/trust-signals/identity-stats.service';
import { contactPhoneOf } from '../../identities/utils/contact-phone.util';
import { readableLocation } from '../../../common/utils/location.util';

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly identityStats: IdentityStatsService,
  ) {}

  async formatCompanyCards(identities: CompanyIdentity[]) {
    const identityIds = identities.map((i) => i.id);

    const [propertyStats, stats] = await Promise.all([
      this.prisma.property.groupBy({
        by: ['identityId'],
        where: { identityId: { in: identityIds } },
        _count: { _all: true },
        _max: { createdAt: true },
      }),
      this.identityStats.getStats(identityIds),
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
        const s = stats.get(i.id);
        return {
          id: i.id,
          userId: i.userId,
          name: i.companyData!.name,
          category: i.companyData!.services || '',
          rating: s?.rating ?? 0,
          reviewsCount: s?.reviewsCount ?? 0,
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
    const stats = await this.identityStats.getStats(
      identities.map((i) => i.id),
    );

    return identities
      .filter((i) => i.officeData !== null)
      .map((i) => {
        const s = stats.get(i.id);
        return {
          id: i.id,
          userId: i.userId,
          name: i.officeData!.name,
          rating: s?.rating ?? 0,
          reviewsCount: s?.reviewsCount ?? 0,
          location: readableLocation(i.officeData!.hqLocation) || '',
          logoUrl: i.officeData!.logoUrl,
          isVerified: i.officeData!.isVerified,
          phone: contactPhoneOf(i, i.user),
          // Offices are reached by phone or in-app chat only
          whatsapp: null,
          isFavorite: false,
        };
      });
  }
}
