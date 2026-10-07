import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import {
  GetPropertiesFilterDto,
  type PropertySort,
} from '../dto/get-properties-filter.dto';
import {
  formatCompanies,
  formatDateToMonthYear,
  formatProperties,
} from './property-formatting.util';
import { notExpiredWhere, ownerActiveWhere } from './property-expiry.util';

// Stable orders for paginated lists: the id tiebreaker keeps ads with the
// same publish time from shifting between pages
function listOrder(
  sort: PropertySort,
): Prisma.PropertyOrderByWithRelationInput[] {
  if (sort === 'PRICE_DESC' || sort === 'PRICE_ASC') {
    return [
      {
        price: {
          sort: sort === 'PRICE_DESC' ? 'desc' : 'asc',
          nulls: 'last',
        },
      },
      { publishedAt: { sort: 'desc', nulls: 'last' } },
      { id: 'asc' },
    ];
  }
  if (sort === 'NEWEST' || sort === 'OLDEST') {
    return [
      {
        publishedAt: {
          sort: sort === 'NEWEST' ? 'desc' : 'asc',
          nulls: 'last',
        },
      },
      { id: 'asc' },
    ];
  }
  return [
    { isPriority: 'desc' },
    { isFeatured: 'desc' },
    { publishedAt: { sort: 'desc', nulls: 'last' } },
    { id: 'asc' },
  ];
}

@Injectable()
export class PropertiesFeedService {
  constructor(private readonly prisma: PrismaService) {}

  // --- PUBLIC FEED ---
  async getHomeFeed() {
    const [saleProperties, rentProperties, exchangeProperties, topCompanies] =
      await Promise.all([
        this.prisma.property.findMany({
          where: {
            type: 'SALE',
            status: 'ACTIVE',
            isHidden: false,
            ...notExpiredWhere(),
            ...ownerActiveWhere(),
          },
          orderBy: [
            { isPriority: 'desc' },
            { isFeatured: 'desc' },
            { publishedAt: { sort: 'desc', nulls: 'last' } },
          ],
          take: 5,
          include: {
            identity: {
              select: {
                id: true,
                type: true,
                individualData: { select: { name: true } },
                companyData: { select: { name: true } },
                officeData: { select: { name: true } },
              },
            },
          },
        }),

        this.prisma.property.findMany({
          where: {
            type: 'RENT',
            status: 'ACTIVE',
            isHidden: false,
            ...notExpiredWhere(),
            ...ownerActiveWhere(),
          },
          orderBy: [
            { isPriority: 'desc' },
            { isFeatured: 'desc' },
            { publishedAt: { sort: 'desc', nulls: 'last' } },
          ],
          take: 5,
          include: {
            identity: {
              select: {
                id: true,
                type: true,
                individualData: { select: { name: true } },
                companyData: { select: { name: true } },
                officeData: { select: { name: true } },
              },
            },
          },
        }),

        this.prisma.property.findMany({
          where: {
            type: 'EXCHANGE',
            status: 'ACTIVE',
            isHidden: false,
            ...notExpiredWhere(),
            ...ownerActiveWhere(),
          },
          orderBy: [
            { isPriority: 'desc' },
            { isFeatured: 'desc' },
            { publishedAt: { sort: 'desc', nulls: 'last' } },
          ],
          take: 5,
          include: {
            identity: {
              select: {
                id: true,
                type: true,
                individualData: { select: { name: true } },
                companyData: { select: { name: true } },
                officeData: { select: { name: true } },
              },
            },
          },
        }),

        // Top companies - using identity-based query
        this.prisma.identity.findMany({
          where: {
            type: 'COMPANY',
            companyData: {
              isNot: null,
              is: { status: 'APPROVED' },
            },
            user: { isDisabled: false, isBlocked: false },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            companyData: true,
          },
        }),
      ]);

    return {
      sale: formatProperties(saleProperties),
      rent: formatProperties(rentProperties),
      exchange: formatProperties(exchangeProperties),
      companies: formatCompanies(topCompanies),
    };
  }

  // --- PAGINATED FEED (For Infinite Scroll) ---
  async findAll(filters: GetPropertiesFilterDto) {
    const {
      type,
      page = 1,
      limit = 10,
      identityId,
      sort = 'DEFAULT',
    } = filters;

    const skip = (page - 1) * limit;

    const whereClause: Prisma.PropertyWhereInput = {
      status: 'ACTIVE',
      isHidden: false,
      ...notExpiredWhere(),
      ...ownerActiveWhere(),
    };
    if (type) {
      whereClause.type = type;
    }
    if (identityId) {
      whereClause.identityId = identityId;
    }

    const [properties, totalCount] = await Promise.all([
      this.prisma.property.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: listOrder(sort),
        include: {
          identity: {
            select: {
              id: true,
              type: true,
              individualData: { select: { name: true } },
              companyData: { select: { name: true } },
              officeData: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.property.count({ where: whereClause }),
    ]);

    return {
      data: formatProperties(properties),
      meta: {
        total: totalCount,
        current: page,
        limit: limit,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
      },
    };
  }

  // --- GET SINGLE PROPERTY BY ID ---
  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        identity: {
          select: {
            id: true,
            type: true,
            createdAt: true,
            user: {
              select: {
                isDisabled: true,
                isBlocked: true,
                name: true,
                avatarUrl: true,
              },
            },
            individualData: {
              select: { name: true, avatarUrl: true },
            },
            companyData: {
              select: { name: true, logoUrl: true, isVerified: true },
            },
            officeData: {
              select: {
                name: true,
                logoUrl: true,
                isVerified: true,
                licenseNumber: true,
              },
            },
          },
        },
      },
    });

    // An owner who suspended their account (or was blocked) has their ads
    // hidden -- the owner themselves is signed out while suspended
    const ownerUser = property?.identity?.user;
    if (!property || ownerUser?.isDisabled || ownerUser?.isBlocked) {
      throw new NotFoundException('عذراً، هذا العقار غير موجود أو تم حذفه');
    }

    const identity = property.identity;
    const hostName =
      identity?.officeData?.name ||
      identity?.companyData?.name ||
      identity?.individualData?.name ||
      identity?.user?.name ||
      'مستخدم';
    // Individual identities often have no avatar of their own -- the photo
    // lives on the User row (same fallback as chat and admin reports)
    const hostAvatar =
      identity?.officeData?.logoUrl ||
      identity?.companyData?.logoUrl ||
      identity?.individualData?.avatarUrl ||
      identity?.user?.avatarUrl ||
      'https://via.placeholder.com/150';
    const isVerified =
      identity?.officeData?.isVerified ||
      identity?.companyData?.isVerified ||
      false;

    return {
      ...property,
      host: {
        id: identity?.id,
        name: hostName,
        avatarUrl: hostAvatar,
        joinedDate: identity ? formatDateToMonthYear(identity.createdAt) : '',
        isVerified,
        rating: 4.5,
        role: identity?.type || 'INDIVIDUAL',
      },
      licenseNumber: identity?.officeData?.licenseNumber || undefined,
    };
  }

  // --- INCREMENT VIEW COUNT ---
  async incrementViews(id: string) {
    try {
      await this.prisma.property.update({
        where: { id },
        data: {
          views: {
            increment: 1,
          },
        },
      });
      return { success: true };
    } catch {
      return { success: false };
    }
  }
}
