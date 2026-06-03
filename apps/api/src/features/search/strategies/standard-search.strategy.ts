import { Injectable } from '@nestjs/common';
import { ListingType, Prisma, PropertyCategory } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { StandardFilterDto } from 'src/features/search/dto/advanced-filters.dto';
import {
  PaginatedResult,
  SearchStrategy,
} from 'src/features/search/interfaces/search-strategy.interface';

@Injectable()
export class StandardSearchStrategy implements SearchStrategy {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    filters: StandardFilterDto & { type: string },
    page: number,
    limit: number,
  ): Promise<PaginatedResult<any>> {
    const skip = (page - 1) * limit;

    // 1. Initialize the Base Where Clause
    // We dynamically map the 'tab' string to the Prisma Listing Type Enum (SALE or RENT)
    const where: Prisma.PropertyWhereInput = {
      type: filters.type === 'sell' ? ListingType.SALE : ListingType.RENT,
    };

    // 2. Build Location Filters
    if (filters.gov?.id) where.governorateId = filters.gov.id;
    if (filters.area?.id) where.areaId = filters.area.id;

    // 3. Build Category & Steppers
    if (filters.category)
      where.category = filters.category.toUpperCase() as PropertyCategory;
    if (filters.rooms) where.beds = { gte: filters.rooms }; // Greater than or equal to requested rooms
    if (filters.baths) where.baths = { gte: filters.baths };

    // 4. Build Range Filters (Price & Area)
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

    // 5. Build JSON Array Overlap (Features)
    if (filters.features && filters.features.length > 0) {
      // In PostgreSQL, to check if a JSONB array contains multiple string elements,
      // we use Prisma's array_contains feature.
      // For multiple features, we ensure ALL requested features exist in the property.
      where.AND = filters.features.map((feature) => ({
        features: {
          array_contains: feature,
        },
      }));
    }

    // 6. Execute Query & Count concurrently
    const [data, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: true, governorate: true, area: true }, // Include relations
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
