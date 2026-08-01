import { Injectable } from '@nestjs/common';
import {
  ListingType,
  AuctionStatus,
  Prisma,
  PropertyCategory,
} from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { AuctionFilterDto } from 'src/features/search/dto/advanced-filters.dto';
import {
  PaginatedResult,
  SearchStrategy,
} from 'src/features/search/interfaces/search-strategy.interface';

@Injectable()
export class AuctionSearchStrategy implements SearchStrategy {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    filters: AuctionFilterDto,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<any>> {
    const skip = (page - 1) * limit;

    const where: Prisma.PropertyWhereInput = {
      type: ListingType.AUCTION,
    };

    if (filters.status) {
      where.auctionStatus = filters.status.toUpperCase() as AuctionStatus;
    }

    if (filters.startDate) {
      where.startDate = { gte: new Date(filters.startDate) };
    }

    if (filters.endDate) {
      where.endDate = { lte: new Date(filters.endDate) };
    }

    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      where.category = {
        in: filters.propertyTypes.map(
          (type) => type.toUpperCase() as PropertyCategory,
        ),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          identity: {
            include: {
              individualData: true,
              companyData: true,
              officeData: true,
            },
          },
          governorate: true,
          area: true,
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        current: page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
      },
    };
  }
}
