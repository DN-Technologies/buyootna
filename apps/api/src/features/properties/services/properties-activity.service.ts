import { Injectable } from '@nestjs/common';
import { ListingStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class PropertiesActivityService {
  constructor(private readonly prisma: PrismaService) {}

  // --- MY ACTIVITY FETCHER ---
  async getMyActivity(identityId: string, statusFilter?: ListingStatus) {
    // 1. Auto-expire any active property whose endDate is in the past
    await this.prisma.property.updateMany({
      where: {
        identityId,
        status: ListingStatus.ACTIVE,
        endDate: { lte: new Date() },
      },
      data: {
        status: ListingStatus.EXPIRED,
      },
    });

    const whereClause: Prisma.PropertyWhereInput = { identityId };

    if (statusFilter) {
      whereClause.status = statusFilter;
    }

    const properties = await this.prisma.property.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
    });

    return properties.map((p) => ({
      id: p.id,
      images: p.images,
      price: p.price,
      type: p.type === 'SALE' ? 'بيع' : p.type === 'RENT' ? 'إيجار' : 'بدل',
      category: p.category,
      status: p.status,
      updatedAt: p.updatedAt,
      createdAt: p.createdAt,
      endDate: p.endDate,
      isPremium: p.isFeatured,
      isHidden: p.isHidden,
      location: p.location,
      description: p.description,
      automatedNumber: p.automatedNumber,
      beds: p.beds,
      baths: p.baths,
      areaSize: p.areaSize,
      floors: p.floors,
      views: p.views,
    }));
  }
}
