import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import {
  GetSearchFilterDto,
  MainSearchCategory,
} from 'src/features/search/dto/get-search-filter.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Main Router Method ---
  async globalSearch(filters: GetSearchFilterDto) {
    const { mainCategory, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    switch (mainCategory) {
      case MainSearchCategory.COMPANIES:
        return this.searchCompanies(filters, skip, limit);
      case MainSearchCategory.PROPERTIES:
        return this.searchProperties(filters, skip, limit);
      default:
        // Handle Auctions/Deails (Return empty paginated object for now)
        return this.emptyPaginatedResponse(page, limit);
    }
  }

  // --- 1. Company Search Logic ---
  private async searchCompanies(
    filters: GetSearchFilterDto,
    skip: number,
    take: number,
  ) {
    const { query, subCategory } = filters;

    const companyProfileFilter: Prisma.CompanyProfileWhereInput = {};

    // If the user typed a text query, search both the company name AND their services
    if (query) {
      companyProfileFilter.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { services: { contains: query, mode: 'insensitive' } },
      ];
    }

    // If a sub-tab is clicked (e.g., 'finishing' / 'تشطيب'), filter by it
    if (subCategory && subCategory !== 'all') {
      const subCategoryMap: Record<string, string> = {
        finishing: 'تشطيب',
        decorations: 'ديكورات',
        interior_design: 'تصميم داخلي',
      };

      const mappedTerm = subCategoryMap[subCategory];
      if (mappedTerm) {
        companyProfileFilter.services = {
          contains: mappedTerm,
          mode: 'insensitive',
        };
      }
    }

    const whereClause: Prisma.UserWhereInput = {
      role: 'COMPANY',
      companyProfile: {
        isNot: null,
        is:
          Object.keys(companyProfileFilter).length > 0
            ? companyProfileFilter
            : undefined,
      },
    };

    const [companies, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereClause,
        skip,
        take,
        include: { companyProfile: true },
      }),
      this.prisma.user.count({ where: whereClause }),
    ]);

    // Map DB result to exactly match the frontend SuggestionCard props
    const formattedData = companies.map((user) => ({
      id: user.id, // Using user ID for routing
      name: user.companyProfile?.name,
      category: user.companyProfile?.services,
      serviceArea: user.companyProfile?.serviceAreas || 'يخدم جميع المناطق',
      projectsCount: '+85', // TODO: Make dynamic from real projects table later
      logoUrl:
        user.companyProfile?.logoUrl || 'https://via.placeholder.com/150',
      isFavorite: false, // TODO: Hook up to user favorites later
    }));

    return this.paginateResponse(formattedData, total, filters.page, take);
  }

  // --- 2. Property Search Logic ---
  private async searchProperties(
    filters: GetSearchFilterDto,
    skip: number,
    take: number,
  ) {
    const { query } = filters;

    const whereClause: Prisma.PropertyWhereInput = {};

    if (query) {
      whereClause.OR = [
        { location: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where: whereClause,
        skip,
        take,
        include: { user: { include: { companyProfile: true } } }, // Get host details for the logo
      }),
      this.prisma.property.count({ where: whereClause }),
    ]);

    // Map Property DB result to match the unified frontend format!
    const formattedData = properties.map((prop) => ({
      id: prop.id,
      name:
        prop.type === 'SALE'
          ? 'عقار للبيع'
          : prop.type === 'RENT'
            ? 'عقار للإيجار'
            : 'عقار للبدل',
      category: prop.location, // Hijacking category slot for location
      serviceArea: `${prop.area} م²`, // Hijacking serviceArea slot for property area
      projectsCount: `${prop.price} د.ك`, // Hijacking projectsCount for price
      logoUrl: prop.images[0] || 'https://via.placeholder.com/150',
      isFavorite: false,
    }));

    return this.paginateResponse(formattedData, total, filters.page, take);
  }

  // --- Helper Methods ---
  private paginateResponse(
    data: any[],
    total: number,
    page: number = 1,
    limit: number,
  ) {
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

  private emptyPaginatedResponse(page: number, limit: number) {
    return {
      data: [],
      meta: {
        total: 0,
        current: page,
        limit,
        totalPages: 0,
        hasNextPage: false,
      },
    };
  }
}
