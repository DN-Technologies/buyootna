import { Injectable, NotFoundException } from '@nestjs/common';
import { ListingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { IdentityStatsService } from '../../../core/trust-signals/identity-stats.service';
import {
  CompanySort,
  GetCompaniesFilterDto,
} from '../../company/dto/get-companies-filter.dto';
import { GetOfficesFilterDto } from '../../office/dto/get-offices-filter.dto';
import {
  OFFICE_LISTING_PROPERTY_SELECT,
  formatOfficeListings,
  formatServiceList,
  visibleServices,
} from './profile-formatting.util';
import { ProviderCardsService } from './provider-cards.service';
import { contactPhoneOf } from '../../identities/utils/contact-phone.util';
import { hasActiveCompanySubscription } from '../../company-subscriptions/company-subscription.rules';
import { splitList } from '../../properties/dto/get-properties-filter.dto';
import { readableLocation } from '../../../common/utils/location.util';

@Injectable()
export class UsersDirectoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly providerCards: ProviderCardsService,
    private readonly identityStats: IdentityStatsService,
  ) {}

  // --- Find Companies ---
  async findCompanies(filters: GetCompaniesFilterDto) {
    const {
      category,
      search,
      specialty,
      location,
      sort = 'NEWEST',
      page = 1,
      limit = 10,
    } = filters;
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
        // A hidden service («اخفاء الخدمة») matches nothing
        companyDataWhere.servicesHidden = false;
        companyDataWhere.services = {
          contains: categories[0],
          mode: 'insensitive',
        };
      } else if (categories.length > 1) {
        companyDataWhere.servicesHidden = false;
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

    // Each of these narrows further (AND); inside one, any value matches
    const narrowing: Prisma.CompanyIdentityDataWhereInput[] = [];
    const specialties = splitList(specialty);
    if (specialties) narrowing.push({ specialty: { in: specialties } });
    const places = splitList(location);
    if (places) {
      narrowing.push({
        OR: places.flatMap((place) => [
          { hqLocation: { contains: place, mode: 'insensitive' as const } },
          { serviceAreas: { contains: place, mode: 'insensitive' as const } },
        ]),
      });
    }
    if (narrowing.length > 0) companyDataWhere.AND = narrowing;

    const whereClause: Prisma.IdentityWhereInput = {
      type: 'COMPANY',
      companyData: companyDataWhere,
      // Suspended (تعطيل مؤقت) or blocked accounts aren't listed
      user: { isDisabled: false, isBlocked: false },
    };

    let formattedCompanies: Awaited<
      ReturnType<ProviderCardsService['formatCompanyCards']>
    >;
    let totalCount: number;

    if (sort === 'NEWEST') {
      const [identities, count] = await Promise.all([
        this.prisma.identity.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: { companyData: true, user: true },
        }),
        this.prisma.identity.count({ where: whereClause }),
      ]);
      formattedCompanies =
        await this.providerCards.formatCompanyCards(identities);
      totalCount = count;
    } else {
      // Rating and projects are aggregates computed per card (reviews,
      // properties), not columns, so the DB can't order by them: score
      // every matching approved company, sort, then page in memory.
      const identities = await this.prisma.identity.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: { companyData: true, user: true },
      });
      const all = await this.providerCards.formatCompanyCards(identities);
      formattedCompanies = sortCompanyCards(all, sort).slice(
        skip,
        skip + limit,
      );
      totalCount = all.length;
    }

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
    const { search, location, page = 1, limit = 10 } = filters;
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
    const places = splitList(location);
    if (places) {
      officeDataWhere.OR = places.map((place) => ({
        hqLocation: { contains: place, mode: 'insensitive' as const },
      }));
    }

    const whereClause: Prisma.IdentityWhereInput = {
      type: 'OFFICE',
      officeData: officeDataWhere,
      // Suspended (تعطيل مؤقت) or blocked accounts aren't listed
      user: { isDisabled: false, isBlocked: false },
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

    const formattedOffices =
      await this.providerCards.formatOfficeCards(identities);

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
        // A hidden project (حالة ظهور المشروع) stays off the public profile
        projects: {
          where: { isHidden: false },
          orderBy: { createdAt: 'desc' as const },
        },
      },
    });

    if (!identity || !identity.companyData) {
      throw new NotFoundException('الشركة غير موجودة');
    }

    const companyData = identity.companyData;

    const [stats, responseTime, acceptsRequests] = await Promise.all([
      this.identityStats.getOne(identity.id),
      this.identityStats.getResponseTime(identity.id),
      // Private requests reach a company only while it is subscribed
      hasActiveCompanySubscription(this.prisma, identity.id),
    ]);

    const formattedServices = formatServiceList(
      visibleServices(companyData),
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
        // Every photo, for the full-screen viewer (imageUrl stays for older apps)
        images: project.images,
        completedDate: project.createdAt
          ? project.createdAt.toISOString().slice(0, 7)
          : '',
      })),
      ...(identity.properties || []).map((p) => ({
        id: p.id,
        title: `${p.category || 'مشروع'} - ${p.location || 'الكويت'}`,
        category: String(p.category || ''),
        imageUrl: p.images && p.images.length > 0 ? p.images[0] : undefined,
        images: p.images ?? [],
        completedDate: p.createdAt ? p.createdAt.toISOString().slice(0, 7) : '',
      })),
    ];

    return {
      id: identity.id,
      userId: identity.userId,
      name: companyData.name,
      logoUrl: companyData.logoUrl,
      isVerified: companyData.isVerified,
      acceptsRequests,
      isActiveNow: stats.presence.isOnline,
      lastSeenAt: stats.presence.lastSeenAt,
      rating: stats.rating,
      reviewsCount: stats.reviewsCount,
      responseTime,
      bio: companyData.about,
      // A pin saved as raw coordinates isn't shown
      location:
        readableLocation(companyData.hqLocation) || companyData.serviceAreas,
      servicesCount: formattedServices.length,
      projectsCount: formattedProjects.length,
      instagramUrl: null,
      twitterUrl: null,
      // The persona's contact number (its own, or the account's)
      phone: contactPhoneOf(identity, identity.user),
      // Companies and offices are reached by phone or in-app chat only
      whatsapp: null,
      // مواعيد العمل as the company set them (null: not set yet)
      workingHours: companyData.workingHours ?? null,
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
        // Only the office's live ads (it was every status, drafts too),
        // newest first, enough for the tab's per-governorate cards
        properties: {
          where: { status: ListingStatus.ACTIVE, isHidden: false },
          orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
          take: 200,
          select: OFFICE_LISTING_PROPERTY_SELECT,
        },
      },
    });

    if (!identity || !identity.officeData) {
      throw new NotFoundException('المكتب غير موجود');
    }

    const officeData = identity.officeData;

    const [stats, responseTime] = await Promise.all([
      this.identityStats.getOne(identity.id),
      this.identityStats.getResponseTime(identity.id),
    ]);

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
      isActiveNow: stats.presence.isOnline,
      lastSeenAt: stats.presence.lastSeenAt,
      rating: stats.rating,
      reviewsCount: stats.reviewsCount,
      responseTime,
      bio: officeData.about,
      location: readableLocation(officeData.hqLocation),
      licenseNumber: officeData.licenseNumber,
      listingsCount: identity.properties.length,
      servicesCount: formattedServices.length,
      instagramUrl: null,
      twitterUrl: null,
      // The persona's contact number (its own, or the account's)
      phone: contactPhoneOf(identity, identity.user),
      // Companies and offices are reached by phone or in-app chat only
      whatsapp: null,
      // مواعيد العمل as the office set them (null: not set yet)
      workingHours: officeData.workingHours ?? null,
      services: formattedServices,
      properties: formatOfficeListings(identity.properties, officeData.name),
    };
  }
}

type CompanyCard = Awaited<
  ReturnType<ProviderCardsService['formatCompanyCards']>
>[number];

// Stable sort, so ties keep the newest-first order they arrive in
export function sortCompanyCards(
  cards: CompanyCard[],
  sort: CompanySort,
): CompanyCard[] {
  const byRating = (a: CompanyCard, b: CompanyCard) =>
    a.rating - b.rating || a.reviewsCount - b.reviewsCount;
  const compare: Record<
    CompanySort,
    ((a: CompanyCard, b: CompanyCard) => number) | null
  > = {
    NEWEST: null,
    RATING_DESC: (a, b) => byRating(b, a),
    RATING_ASC: byRating,
    PROJECTS_DESC: (a, b) => Number(b.projectsCount) - Number(a.projectsCount),
  };
  const fn = compare[sort];
  return fn ? [...cards].sort(fn) : cards;
}
