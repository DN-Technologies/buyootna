import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ownerActiveWhere } from '../properties/services/property-expiry.util';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  // Toggle favorite: if exists, delete it. If not, create it.
  async toggleFavorite(identityId: string, propertyId: string) {
    // Verify property exists
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!property) {
      throw new NotFoundException('العقار غير موجود أو تم حذفه');
    }

    // Check if already favorited
    const existing = await this.prisma.favorite.findUnique({
      where: {
        identityId_propertyId: {
          identityId,
          propertyId,
        },
      },
    });

    if (existing) {
      await this.prisma.favorite.delete({
        where: {
          identityId_propertyId: {
            identityId,
            propertyId,
          },
        },
      });
      return { favorited: false, message: 'تم إزالة العقار من المفضلة' };
    } else {
      await this.prisma.favorite.create({
        data: {
          identityId,
          propertyId,
        },
      });
      return { favorited: true, message: 'تم إضافة العقار إلى المفضلة' };
    }
  }

  // Get user's favorited properties
  async getFavorites(identityId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { identityId, property: ownerActiveWhere() },
        include: {
          property: {
            include: {
              identity: {
                select: {
                  id: true,
                  type: true,
                  individualData: {
                    select: { name: true, avatarUrl: true },
                  },
                  companyData: {
                    select: { name: true, logoUrl: true },
                  },
                  officeData: {
                    select: { name: true, logoUrl: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.favorite.count({
        where: { identityId, property: ownerActiveWhere() },
      }),
    ]);

    // Format properties similar to search results or feed
    const formattedProperties = favorites.map((fav) => {
      const prop = fav.property;
      const identity = prop.identity;
      const hostName =
        identity?.officeData?.name ||
        identity?.companyData?.name ||
        identity?.individualData?.name ||
        'مستخدم';
      const hostAvatar =
        identity?.officeData?.logoUrl ||
        identity?.companyData?.logoUrl ||
        identity?.individualData?.avatarUrl ||
        'https://via.placeholder.com/150';

      return {
        id: prop.id,
        type: prop.type,
        category: prop.category,
        isFeatured: prop.isFeatured,
        price: prop.price,
        location: prop.location,
        description: prop.description,
        images: prop.images,
        createdAt: prop.createdAt,
        publishedAt: prop.publishedAt,
        views: prop.views,
        area: prop.areaSize || 0,
        beds: prop.beds || 0,
        baths: prop.baths || 0,
        floors: prop.floors,
        host: {
          id: identity?.id,
          name: hostName,
          avatarUrl: hostAvatar,
          role: identity?.type || 'INDIVIDUAL',
        },
      };
    });

    return {
      data: formattedProperties,
      meta: {
        total,
        page,
        limit,
        hasNextPage: skip + limit < total,
      },
    };
  }

  // Check if a single property is favorited by identity
  async checkFavorite(identityId: string, propertyId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        identityId_propertyId: {
          identityId,
          propertyId,
        },
      },
    });
    return { isFavorited: !!favorite };
  }

  // Get all favorited property IDs of the identity
  async getFavoriteIds(identityId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { identityId },
      select: { propertyId: true },
    });
    return { ids: favorites.map((fav) => fav.propertyId) };
  }

  /** Removes every saved ad; returns their ids for undo. */
  async clearProperties(identityId: string) {
    const rows = await this.prisma.favorite.findMany({
      where: { identityId },
      select: { propertyId: true },
    });
    const ids = rows.map((r) => r.propertyId);
    await this.prisma.favorite.deleteMany({
      where: { identityId, propertyId: { in: ids } },
    });
    return { ids };
  }

  /** Puts back what clearProperties() removed (skips deleted ads). */
  async restoreProperties(identityId: string, ids: string[]) {
    const valid = await this.prisma.property.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    await this.prisma.favorite.createMany({
      data: valid.map((p) => ({ identityId, propertyId: p.id })),
      skipDuplicates: true,
    });
    return { ids: valid.map((p) => p.id) };
  }
}
