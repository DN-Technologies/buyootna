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

    const ids = properties.map((p) => p.id);
    const [favoriteCounts, chatCounts] = ids.length
      ? await Promise.all([
          this.prisma.favorite.groupBy({
            by: ['propertyId'],
            where: { propertyId: { in: ids } },
            _count: { _all: true },
          }),
          // A chat row exists as soon as someone taps chat: only one with a
          // message counts as contact
          this.prisma.conversation.groupBy({
            by: ['propertyId'],
            where: { propertyId: { in: ids }, messages: { some: {} } },
            _count: { _all: true },
          }),
        ])
      : [[], []];
    const favoritesBy = new Map(
      favoriteCounts.map((f) => [f.propertyId, f._count._all]),
    );
    const chatsBy = new Map(
      chatCounts.map((c) => [c.propertyId, c._count._all]),
    );

    return properties.map((p) => ({
      id: p.id,
      images: p.images,
      price: p.price,
      type: p.type === 'SALE' ? 'بيع' : p.type === 'RENT' ? 'إيجار' : 'بدل',
      category: p.category,
      status: p.status,
      updatedAt: p.updatedAt,
      createdAt: p.createdAt,
      publishedAt: p.publishedAt,
      endDate: p.endDate,
      isPremium: p.isFeatured,
      isHidden: p.isHidden,
      // The office's عقارات tab groups by governorate, filters by area and
      // deal, and shows how long the featuring lasts
      governorateId: p.governorateId,
      areaId: p.areaId,
      listingType: p.type,
      featuredUntil: p.featuredUntil,
      location: p.location,
      description: p.description,
      automatedNumber: p.automatedNumber,
      beds: p.beds,
      baths: p.baths,
      areaSize: p.areaSize,
      floors: p.floors,
      views: p.views,
      favoritesCount: favoritesBy.get(p.id) ?? 0,
      chatsCount: chatsBy.get(p.id) ?? 0,
    }));
  }
}
