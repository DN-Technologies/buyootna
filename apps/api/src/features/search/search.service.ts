import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GetSearchFilterDto } from 'src/features/search/dto/get-search-filter.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Main Search Method (Companies only, matching Figma) ---
  async globalSearch(filters: GetSearchFilterDto) {
    const { query, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const companyProfileFilter: Prisma.CompanyProfileWhereInput = {};

    // If the user typed a text query, search both the company name AND their services
    if (query) {
      companyProfileFilter.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { services: { contains: query, mode: 'insensitive' } },
      ];
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
        take: limit,
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

    return this.paginateResponse(formattedData, total, page, limit);
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
}
