import { Injectable } from '@nestjs/common';
import { ListingType, Prisma, PropertyStatus } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { ExchangeFilterDto } from 'src/features/search/dto/advanced-filters.dto';
import {
  PaginatedResult,
  SearchStrategy,
} from 'src/features/search/interfaces/search-strategy.interface';

@Injectable()
export class ExchangeSearchStrategy implements SearchStrategy {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    filters: ExchangeFilterDto,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<any>> {
    const skip = (page - 1) * limit;

    const where: Prisma.PropertyWhereInput = {
      type: ListingType.EXCHANGE,
    };

    if (filters.govs && filters.govs.length > 0) {
      where.governorateId = { in: filters.govs.map((g) => g.id) };
    }
    if (filters.areas && filters.areas.length > 0) {
      where.areaId = { in: filters.areas.map((a) => a.id) };
    }

    // Exact Match Filters for Exchange
    if (filters.requestYear) where.requestYear = filters.requestYear;
    if (filters.requiredYear) where.requiredYear = filters.requiredYear;
    if (filters.status)
      where.exchangeStatus = filters.status.toUpperCase() as PropertyStatus;

    // Instead of a range, the Exchange tab uses a direct Area Size match (or gte)
    if (filters.areaSize) {
      where.areaSize = { gte: filters.areaSize };
    }

    if (filters.features && filters.features.length > 0) {
      where.AND = filters.features.map((feature) => ({
        features: { array_contains: feature },
      }));
    }

    const [data, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: { sort: 'desc', nulls: 'last' } },
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
