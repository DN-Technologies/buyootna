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

    if (filters.gov?.id) where.governorateId = filters.gov.id;
    if (filters.area?.id) where.areaId = filters.area.id;

    // Exact Match Filters for Exchange
    if (filters.requestYear) where.requestYear = filters.requestYear;
    if (filters.requiredYear) where.requiredYear = filters.requiredYear;
    if (filters.status)
      where.status = filters.status.toUpperCase() as PropertyStatus;

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
        orderBy: { createdAt: 'desc' },
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
