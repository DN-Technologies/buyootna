import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GetSearchFilterDto } from 'src/features/search/dto/get-search-filter.dto';

import {
  AdvancedSearchDto,
  FilterTab,
} from 'src/features/search/dto/advanced-search.dto';
import {
  StandardFilterDto,
  CompanyFilterDto,
  AuctionFilterDto,
} from './dto/advanced-filters.dto';
import { StandardSearchStrategy } from 'src/features/search/strategies/standard-search.strategy';
import { ExchangeSearchStrategy } from 'src/features/search/strategies/exchange-search.strategy';
import { CompanySearchStrategy } from 'src/features/search/strategies/company-search.strategy';
import { AuctionSearchStrategy } from 'src/features/search/strategies/auction-search.strategy';
import { DealSearchStrategy } from 'src/features/search/strategies/deal-search.strategy';

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly standardStrategy: StandardSearchStrategy,
    private readonly exchangeStrategy: ExchangeSearchStrategy,
    private readonly companyStrategy: CompanySearchStrategy,
    private readonly auctionStrategy: AuctionSearchStrategy,
    private readonly dealStrategy: DealSearchStrategy,
  ) {}

  async globalAdvancedSearch(payload: AdvancedSearchDto) {
    const { tab, filters, page = 1, limit = 10 } = payload;

    // Traffic Cop: Route to the correct strategy based on the 'tab'
    switch (tab) {
      case FilterTab.SELL:
      case FilterTab.RENT:
        // We pass the "tab" along with filters so the standard strategy knows if it's querying SALE or RENT
        return this.standardStrategy.execute(
          { ...(filters as StandardFilterDto), type: tab },
          page,
          limit,
        );

      case FilterTab.EXCHANGE:
        return this.exchangeStrategy.execute(filters, page, limit);

      case FilterTab.COMPANIES:
        return this.companyStrategy.execute(
          filters as CompanyFilterDto,
          page,
          limit,
        );

      case FilterTab.AUCTIONS:
        return this.auctionStrategy.execute(
          filters as AuctionFilterDto,
          page,
          limit,
        );

      case FilterTab.DEALS:
        return this.dealStrategy.execute(filters, page, limit);

      default:
        throw new BadRequestException('Invalid search tab provided.');
    }
  }

  // --- Main Search Method (Companies only, matching Figma) ---
  async globalSearch(filters: GetSearchFilterDto) {
    const { query, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const companyProfileFilter: Prisma.CompanyIdentityDataWhereInput = {};

    if (query) {
      companyProfileFilter.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { services: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [identities, total] = await Promise.all([
      this.prisma.identity.findMany({
        where: {
          type: 'COMPANY',
          companyData: { status: 'APPROVED' },
          user: { isDisabled: false, isBlocked: false },
        },
        skip,
        take: limit,
        include: {
          companyData: true,
          _count: { select: { properties: true } },
        },
      }),
      this.prisma.identity.count({
        where: {
          type: 'COMPANY',
          companyData: { status: 'APPROVED' },
          user: { isDisabled: false, isBlocked: false },
        },
      }),
    ]);

    // Map DB result to exactly match the frontend SuggestionCard props
    const formattedData = identities.map((ident) => ({
      id: ident.id,
      name: ident.companyData?.name || 'شركة غير معروفة',
      category: ident.companyData?.services || '',
      serviceArea: ident.companyData?.serviceAreas || 'يخدم جميع المناطق',
      projectsCount: String(ident._count.properties),
      logoUrl: ident.companyData?.logoUrl || 'https://via.placeholder.com/150',
      isFavorite: false,
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
