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

    const companyProfileFilter: Prisma.CompanyProfileWhereInput = {
      status: 'APPROVED',
    };

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

    if (
      (filters.govs && filters.govs.length > 0) ||
      (filters.areas && filters.areas.length > 0)
    ) {
      const locationConditions: Prisma.CompanyProfileWhereInput[] = [];

      if (filters.govs && filters.govs.length > 0) {
        locationConditions.push({
          OR: [
            ...filters.govs.map((gov) => ({
              serviceAreas: {
                contains: gov.label,
                mode: 'insensitive' as const,
              },
            })),
            {
              serviceAreas: { contains: 'جميع', mode: 'insensitive' as const },
            },
            ...filters.govs.map((gov) => ({
              hqLocation: { contains: gov.label, mode: 'insensitive' as const },
            })),
          ],
        });
      }

      if (filters.areas && filters.areas.length > 0) {
        locationConditions.push({
          OR: [
            ...filters.areas.map((area) => ({
              serviceAreas: {
                contains: area.label,
                mode: 'insensitive' as const,
              },
            })),
            {
              serviceAreas: { contains: 'جميع', mode: 'insensitive' as const },
            },
            ...filters.areas.map((area) => ({
              hqLocation: {
                contains: area.label,
                mode: 'insensitive' as const,
              },
            })),
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
        is: companyProfileFilter,
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

    return {
      data: companies,
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
