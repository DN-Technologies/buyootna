import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CompanyFilterDto } from 'src/features/search/dto/advanced-filters.dto';
import {
  PaginatedResult,
  SearchStrategy,
} from 'src/features/search/interfaces/search-strategy.interface';

@Injectable()
export class CompanySearchStrategy implements SearchStrategy {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    filters: CompanyFilterDto,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<any>> {
    const skip = (page - 1) * limit;

    const companyProfileFilter: Prisma.CompanyProfileWhereInput = {};

    if (filters.specialty) {
      companyProfileFilter.OR = [
        { specialty: { contains: filters.specialty, mode: 'insensitive' } },
        {
          licenseActivity: { contains: filters.specialty, mode: 'insensitive' },
        },
      ];
    }

    if (filters.requestType) {
      companyProfileFilter.services = {
        contains: filters.requestType,
        mode: 'insensitive',
      };
    }

    if (filters.gov?.label || filters.area?.label) {
      const locationConditions: Prisma.CompanyProfileWhereInput[] = [];

      if (filters.gov?.label) {
        locationConditions.push({
          OR: [
            {
              serviceAreas: {
                contains: filters.gov.label,
                mode: 'insensitive',
              },
            },
            { serviceAreas: { contains: 'جميع', mode: 'insensitive' } },
            {
              hqLocation: { contains: filters.gov.label, mode: 'insensitive' },
            },
          ],
        });
      }

      if (filters.area?.label) {
        locationConditions.push({
          OR: [
            {
              serviceAreas: {
                contains: filters.area.label,
                mode: 'insensitive',
              },
            },
            { serviceAreas: { contains: 'جميع', mode: 'insensitive' } },
            {
              hqLocation: { contains: filters.area.label, mode: 'insensitive' },
            },
          ],
        });
      }

      if (locationConditions.length > 0) {
        companyProfileFilter.AND = locationConditions;
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
        take: limit,
        include: { companyProfile: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: whereClause }),
    ]);

    const formattedData = companies.map((user) => ({
      id: user.id,
      name: user.companyProfile?.name,
      category: user.companyProfile?.services,
      serviceArea: user.companyProfile?.serviceAreas || 'يخدم جميع المناطق',
      projectsCount: '+85',
      logoUrl:
        user.companyProfile?.logoUrl || 'https://via.placeholder.com/150',
      isFavorite: false,
    }));

    return {
      data: formattedData,
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
