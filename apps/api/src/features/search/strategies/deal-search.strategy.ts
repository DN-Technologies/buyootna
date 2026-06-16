import { Injectable } from '@nestjs/common';
import { ListingType, Prisma, PropertyCategory } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { DealFilterDto } from 'src/features/search/dto/advanced-filters.dto';
import {
  PaginatedResult,
  SearchStrategy,
} from 'src/features/search/interfaces/search-strategy.interface';

@Injectable()
export class DealSearchStrategy implements SearchStrategy {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    filters: DealFilterDto,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<any>> {
    const skip = (page - 1) * limit;

    const where: Prisma.PropertyWhereInput = {
      type: ListingType.DEAL,
    };

    if (filters.govs && filters.govs.length > 0) {
      where.governorateId = { in: filters.govs.map((g) => g.id) };
    }
    if (filters.areas && filters.areas.length > 0) {
      where.areaId = { in: filters.areas.map((a) => a.id) };
    }

    if (filters.salePercentage) {
      where.salePercentage = { gte: filters.salePercentage };
    }

    if (filters.startDate) {
      where.startDate = { gte: new Date(filters.startDate) };
    }

    if (filters.endDate) {
      where.endDate = { lte: new Date(filters.endDate) };
    }

    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }

    if (filters.minArea || filters.maxArea) {
      where.areaSize = {};
      if (filters.minArea) where.areaSize.gte = filters.minArea;
      if (filters.maxArea) where.areaSize.lte = filters.maxArea;
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
        include: { user: true, governorate: true, area: true },
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
