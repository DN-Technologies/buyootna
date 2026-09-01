import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GetPropertiesFilterDto } from '../dto/get-properties-filter.dto';
import {
  formatCompanies,
  formatDateToMonthYear,
  formatProperties,
} from './property-formatting.util';

@Injectable()
export class PropertiesFeedService {
  constructor(private readonly prisma: PrismaService) {}

  // --- PUBLIC FEED ---
  async getHomeFeed() {
    const [saleProperties, rentProperties, exchangeProperties, topCompanies] =
      await Promise.all([
        this.prisma.property.findMany({
          where: { type: 'SALE', status: 'ACTIVE' },
          orderBy: [
            { isPriority: 'desc' },
            { isFeatured: 'desc' },
            { createdAt: 'desc' },
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
          where: { type: 'RENT', status: 'ACTIVE' },
          orderBy: [
            { isPriority: 'desc' },
            { isFeatured: 'desc' },
            { createdAt: 'desc' },
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
          where: { type: 'EXCHANGE', status: 'ACTIVE' },
          orderBy: [
            { isPriority: 'desc' },
            { isFeatured: 'desc' },
            { createdAt: 'desc' },
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
    const { type, page = 1, limit = 10, identityId } = filters;

    const skip = (page - 1) * limit;

    const whereClause: Prisma.PropertyWhereInput = { status: 'ACTIVE' };
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
        orderBy: [
          { isPriority: 'desc' },
          { isFeatured: 'desc' },
          { createdAt: 'desc' },
        ],
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

    if (!property) {
      throw new NotFoundException('عذراً، هذا العقار غير موجود أو تم حذفه');
    }

    const identity = property.identity;
    const hostName =
      identity?.officeData?.name ||
      identity?.companyData?.name ||
      identity?.individualData?.name ||
      'مستخدم';
    const hostAvatar =
      identity?.officeData?.logoUrl ||
      identity?.companyData?.logoUrl ||
      identity?.individualData?.avatarUrl ||
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
