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
import { notExpiredWhere } from '../../properties/services/property-expiry.util';
import { formatServiceList, visibleServices } from './profile-formatting.util';

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

    const [propertyStats, serviceRows, stats] = await Promise.all([
      this.prisma.property.groupBy({
        by: ['identityId'],
        where: { identityId: { in: identityIds } },
        _count: { _all: true },
        _max: { createdAt: true },
      }),
      this.prisma.companyService.groupBy({
        by: ['identityId'],
        where: { identityId: { in: identityIds }, isHidden: false },
        _count: { _all: true },
      }),
      this.identityStats.getStats(identityIds),
    ]);

    const projectsCountByIdentity = new Map(
      propertyStats.map((p) => [p.identityId, p._count._all]),
    );
    const lastActivityByIdentity = new Map(
      propertyStats.map((p) => [p.identityId, p._max.createdAt]),
    );
    const serviceRowsByIdentity = new Map(
      serviceRows.map((r) => [r.identityId, r._count._all]),
    );

    return identities
      .filter((i) => i.companyData !== null)
      .map((i) => {
        const s = stats.get(i.id);
        const category = visibleServices(i.companyData!) || '';
        return {
          id: i.id,
          userId: i.userId,
          name: i.companyData!.name,
          category,
          rating: s?.rating ?? 0,
          reviewsCount: s?.reviewsCount ?? 0,
          projectsCount: String(projectsCountByIdentity.get(i.id) ?? 0),
          // عدد الخدمات: its service rows, else the free-text list's entries
          servicesCount:
            serviceRowsByIdentity.get(i.id) ??
            formatServiceList(category, i.companyData!.name).length,
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
    const identityIds = identities.map((i) => i.id);
    const [listingStats, stats] = await Promise.all([
      // The office's live ads, per type (بيع / إيجار / بدل ... tags)
      this.prisma.property.groupBy({
        by: ['identityId', 'type'],
        where: {
          identityId: { in: identityIds },
          status: 'ACTIVE',
          isHidden: false,
          ...notExpiredWhere(),
        },
        _count: { _all: true },
      }),
      this.identityStats.getStats(identityIds),
    ]);

    return identities
      .filter((i) => i.officeData !== null)
      .map((i) => {
        const s = stats.get(i.id);
        return {
          id: i.id,
          userId: i.userId,
          name: i.officeData!.name,
          propertiesCount: listingStats
            .filter((l) => l.identityId === i.id)
            .reduce((sum, l) => sum + l._count._all, 0),
          listingTypes: listingStats
            .filter((l) => l.identityId === i.id)
            .map((l) => l.type),
          servicesCount: formatServiceList(
            i.officeData!.services,
            i.officeData!.name,
          ).length,
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
