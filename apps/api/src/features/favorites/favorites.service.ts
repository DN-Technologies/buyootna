import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  // Toggle favorite: if exists, delete it. If not, create it.
  async toggleFavorite(userId: string, propertyId: string) {
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
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    if (existing) {
      await this.prisma.favorite.delete({
        where: {
          userId_propertyId: {
            userId,
            propertyId,
          },
        },
      });
      return { favorited: false, message: 'تم إزالة العقار من المفضلة' };
    } else {
      await this.prisma.favorite.create({
        data: {
          userId,
          propertyId,
        },
      });
      return { favorited: true, message: 'تم إضافة العقار إلى المفضلة' };
    }
  }

  // Get user's favorited properties
  async getFavorites(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        include: {
          property: {
            include: {
              user: {
                select: {
                  id: true,
                  companyProfile: {
                    select: {
                      name: true,
                      logoUrl: true,
                    },
                  },
                  officeProfile: {
                    select: {
                      name: true,
                      logoUrl: true,
                    },
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
        where: { userId },
      }),
    ]);

    // Format properties similar to search results or feed
    const formattedProperties = favorites.map((fav) => {
      const prop = fav.property;
      const hostName = prop.user.officeProfile
        ? prop.user.officeProfile.name
        : prop.user.companyProfile
          ? prop.user.companyProfile.name
          : 'مستخدم';
      const hostAvatar =
        prop.user.officeProfile?.logoUrl ||
        prop.user.companyProfile?.logoUrl ||
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
        views: prop.views,
        area: prop.areaSize || 0,
        beds: prop.beds || 0,
        baths: prop.baths || 0,
        floors: prop.floors,
        host: {
          id: prop.user.id,
          name: hostName,
          avatarUrl: hostAvatar,
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

  // Check if a single property is favorited by user
  async checkFavorite(userId: string, propertyId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });
    return { isFavorited: !!favorite };
  }

  // Get all favorited property IDs of the user
  async getFavoriteIds(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      select: { propertyId: true },
    });
    return { ids: favorites.map((fav) => fav.propertyId) };
  }
}
