import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { GetCompaniesFilterDto } from '../dto/get-companies-filter.dto';
import {
  OFFICE_LISTING_PROPERTY_SELECT,
  formatOfficeListings,
  formatServiceList,
} from './profile-formatting.util';

@Injectable()
export class UsersDirectoryService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Find Companies ---
  async findCompanies(filters: GetCompaniesFilterDto) {
    const { category, search, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const companyDataWhere: Prisma.CompanyIdentityDataWhereInput = {
      status: 'APPROVED',
    };

    if (category && category !== 'all') {
      companyDataWhere.services = {
        contains: category,
        mode: 'insensitive',
      };
    }

    if (search) {
      companyDataWhere.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const whereClause: Prisma.IdentityWhereInput = {
      type: 'COMPANY',
      companyData: companyDataWhere,
    };

    const [identities, totalCount] = await Promise.all([
      this.prisma.identity.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { companyData: true, user: true },
      }),
      this.prisma.identity.count({ where: whereClause }),
    ]);

    const identityIds = identities.map((i) => i.id);
    const userIds = identities.map((i) => i.userId);

    const [propertyStats, reviewStats] = await Promise.all([
      this.prisma.property.groupBy({
        by: ['identityId'],
        where: { identityId: { in: identityIds } },
        _count: { _all: true },
        _max: { createdAt: true },
      }),
      this.prisma.review.groupBy({
        by: ['targetUserId'],
        where: { targetUserId: { in: userIds } },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ]);

    const projectsCountByIdentity = new Map(
      propertyStats.map((p) => [p.identityId, p._count._all]),
    );
    const lastActivityByIdentity = new Map(
      propertyStats.map((p) => [p.identityId, p._max.createdAt]),
    );
    const avgRatingByUser = new Map(
      reviewStats.map((r) => [r.targetUserId, r._avg.rating]),
    );
    const reviewsCountByUser = new Map(
      reviewStats.map((r) => [r.targetUserId, r._count._all]),
    );

    const formattedCompanies = identities
      .filter((i) => i.companyData !== null)
      .map((i) => {
        const avgRating = avgRatingByUser.get(i.userId);
        return {
          id: i.id,
          userId: i.userId,
          name: i.companyData!.name,
          category: i.companyData!.services || '',
          rating: avgRating ? Number(avgRating.toFixed(1)) : 0,
          reviewsCount: reviewsCountByUser.get(i.userId) ?? 0,
          projectsCount: String(projectsCountByIdentity.get(i.id) ?? 0),
          serviceArea: i.companyData!.serviceAreas,
          logoUrl: i.companyData!.logoUrl,
          isVerified: i.companyData!.isVerified,
          lastActivityAt: (
            lastActivityByIdentity.get(i.id) ?? i.companyData!.updatedAt
          ).toISOString(),
        };
      });

    return {
      data: formattedCompanies,
      meta: {
        total: totalCount,
        current: page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
      },
    };
  }

  // --- Find Company Details ---
  async findCompanyDetails(id: string) {
    const identity = await this.prisma.identity.findFirst({
      where: {
        OR: [{ id }, { userId: id, type: 'COMPANY' }],
        type: 'COMPANY',
      },
      include: {
        companyData: true,
        user: true,
        properties: {
          take: 10,
          select: {
            id: true,
            category: true,
            location: true,
            description: true,
            images: true,
            createdAt: true,
          },
        },
      },
    });

    if (!identity || !identity.companyData) {
      throw new NotFoundException('الشركة غير موجودة');
    }

    const companyData = identity.companyData;

    const reviews = await this.prisma.review.findMany({
      where: { targetUserId: identity.userId },
      select: { rating: true },
    });

    const reviewsCount = reviews.length;
    const rating =
      reviewsCount > 0
        ? Number(
            (
              reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
            ).toFixed(1),
          )
        : 0;

    const formattedServices = formatServiceList(
      companyData.services,
      companyData.name,
    );

    const formattedProjects = (identity.properties || []).map((p) => ({
      id: p.id,
      title: `${p.category || 'مشروع'} - ${p.location || 'الكويت'}`,
      category: String(p.category || ''),
      imageUrl: p.images && p.images.length > 0 ? p.images[0] : undefined,
      completedDate: p.createdAt ? p.createdAt.toISOString().slice(0, 7) : '',
    }));

    return {
      id: identity.id,
      userId: identity.userId,
      name: companyData.name,
      logoUrl: companyData.logoUrl,
      isVerified: companyData.isVerified,
      isActiveNow: true,
      rating,
      reviewsCount,
      bio: companyData.about,
      location: companyData.hqLocation || companyData.serviceAreas,
      servicesCount: formattedServices.length,
      projectsCount: formattedProjects.length,
      instagramUrl: null,
      twitterUrl: null,
      phone: identity.user?.phone,
      whatsapp: identity.user?.whatsapp || identity.user?.phone,
      services: formattedServices,
      projects: formattedProjects,
    };
  }

  // --- Find Office Details ---
  async findOfficeDetails(id: string) {
    const identity = await this.prisma.identity.findFirst({
      where: {
        OR: [{ id }, { userId: id, type: 'OFFICE' }],
        type: 'OFFICE',
      },
      include: {
        officeData: true,
        user: true,
        properties: {
          take: 20,
          select: OFFICE_LISTING_PROPERTY_SELECT,
        },
      },
    });

    if (!identity || !identity.officeData) {
      throw new NotFoundException('المكتب غير موجود');
    }

    const officeData = identity.officeData;

    const reviews = await this.prisma.review.findMany({
      where: { targetUserId: identity.userId },
      select: { rating: true },
    });

    const reviewsCount = reviews.length;
    const rating =
      reviewsCount > 0
        ? Number(
            (
              reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
            ).toFixed(1),
          )
        : 0;

    const formattedServices = formatServiceList(
      officeData.services,
      officeData.name,
    );

    return {
      id: identity.id,
      userId: identity.userId,
      name: officeData.name,
      logoUrl: officeData.logoUrl,
      isVerified: officeData.isVerified,
      isActiveNow: true,
      rating,
      reviewsCount,
      bio: officeData.about,
      location: officeData.hqLocation,
      licenseNumber: officeData.licenseNumber,
      listingsCount: identity.properties.length,
      servicesCount: formattedServices.length,
      instagramUrl: null,
      twitterUrl: null,
      phone: identity.user?.phone,
      whatsapp: identity.user?.whatsapp || identity.user?.phone,
      workingHours: [],
      services: formattedServices,
      properties: formatOfficeListings(identity.properties, officeData.name),
    };
  }
}
