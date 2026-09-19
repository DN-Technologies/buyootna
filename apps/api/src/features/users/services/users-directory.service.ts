import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { GetCompaniesFilterDto } from '../../company/dto/get-companies-filter.dto';
import { GetOfficesFilterDto } from '../../office/dto/get-offices-filter.dto';
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
      const categories = category
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      if (categories.length === 1) {
        companyDataWhere.services = {
          contains: categories[0],
          mode: 'insensitive',
        };
      } else if (categories.length > 1) {
        companyDataWhere.OR = categories.map((c) => ({
          services: { contains: c, mode: 'insensitive' as const },
        }));
      }
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

  // --- Find Offices ---
  async findOffices(filters: GetOfficesFilterDto) {
    const { search, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const officeDataWhere: Prisma.OfficeIdentityDataWhereInput = {
      status: 'APPROVED',
    };

    if (search) {
      officeDataWhere.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const whereClause: Prisma.IdentityWhereInput = {
      type: 'OFFICE',
      officeData: officeDataWhere,
    };

    const [identities, totalCount] = await Promise.all([
      this.prisma.identity.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { officeData: true, user: true },
      }),
      this.prisma.identity.count({ where: whereClause }),
    ]);

    const userIds = identities.map((i) => i.userId);

    const reviewStats = await this.prisma.review.groupBy({
      by: ['targetUserId'],
      where: { targetUserId: { in: userIds } },
      _avg: { rating: true },
      _count: { _all: true },
    });

    const avgRatingByUser = new Map(
      reviewStats.map((r) => [r.targetUserId, r._avg.rating]),
    );
    const reviewsCountByUser = new Map(
      reviewStats.map((r) => [r.targetUserId, r._count._all]),
    );

    const formattedOffices = identities
      .filter((i) => i.officeData !== null)
      .map((i) => {
        const avgRating = avgRatingByUser.get(i.userId);
        return {
          id: i.id,
          userId: i.userId,
          name: i.officeData!.name,
          rating: avgRating ? Number(avgRating.toFixed(1)) : 0,
          reviewsCount: reviewsCountByUser.get(i.userId) ?? 0,
          location: i.officeData!.hqLocation || '',
          logoUrl: i.officeData!.logoUrl,
          isVerified: i.officeData!.isVerified,
          phone: i.user?.phone,
          whatsapp: i.user?.whatsapp || i.user?.phone,
          isFavorite: false,
        };
      });

    return {
      data: formattedOffices,
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
        projects: {
          orderBy: { createdAt: 'desc' as const },
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

    // Real portfolio projects created via "اضافة مشروع لمعرض الأعمال" come
    // first; property-derived items (the legacy gallery source) follow.
    const formattedProjects = [
      ...(identity.projects || []).map((project) => ({
        id: project.id,
        title: project.title,
        description: project.description,
        category: '',
        imageUrl: project.images.length > 0 ? project.images[0] : undefined,
        completedDate: project.createdAt
          ? project.createdAt.toISOString().slice(0, 7)
          : '',
      })),
      ...(identity.properties || []).map((p) => ({
        id: p.id,
        title: `${p.category || 'مشروع'} - ${p.location || 'الكويت'}`,
        category: String(p.category || ''),
        imageUrl: p.images && p.images.length > 0 ? p.images[0] : undefined,
        completedDate: p.createdAt ? p.createdAt.toISOString().slice(0, 7) : '',
      })),
    ];

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
