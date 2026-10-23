import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ApprovalStatus,
  ListingStatus,
  ListingType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import {
  notExpiredWhere,
  ownerActiveWhere,
} from '../properties/services/property-expiry.util';
import { GetMapBoundsDto, MapPinType } from './dto/get-map-bounds.dto';
import {
  companiesToFeatureCollection,
  propertiesToFeatureCollection,
} from './utils/map-geojson.mapper';
import { notBlockedUserWhere } from '../blocks/block.rules';

const MAP_LIMIT = 500;

const PIN_TO_LISTING: Record<Exclude<MapPinType, 'company'>, ListingType> = {
  sell: ListingType.SALE,
  rent: ListingType.RENT,
  exchange: ListingType.EXCHANGE,
};

@Injectable()
export class MapService {
  constructor(private readonly prisma: PrismaService) {}

  // viewerUserId: the signed-in caller, whose blocked accounts' pins are
  // left out (Guideline 1.2)
  async discover(dto: GetMapBoundsDto, viewerUserId?: string) {
    this.assertValidBounds(dto);

    const type = dto.type ?? 'sell';

    if (type === 'company') {
      return this.discoverCompanies(dto, viewerUserId);
    }

    return this.discoverProperties(dto, type, viewerUserId);
  }

  private assertValidBounds(dto: GetMapBoundsDto) {
    if (dto.ne_lat < dto.sw_lat || dto.ne_lng < dto.sw_lng) {
      throw new BadRequestException('Invalid bounding box');
    }
  }

  private async discoverProperties(
    dto: GetMapBoundsDto,
    type: Exclude<MapPinType, 'company'>,
    viewerUserId?: string,
  ) {
    const where: Prisma.PropertyWhereInput = {
      status: ListingStatus.ACTIVE,
      isHidden: false,
      type: PIN_TO_LISTING[type],
      latitude: { gte: dto.sw_lat, lte: dto.ne_lat, not: null },
      longitude: { gte: dto.sw_lng, lte: dto.ne_lng, not: null },
      // A separate top-level key (not spread into `where`) because
      // `where.OR` below is used for the free-text search match — Prisma
      // ANDs every top-level key together, so this still combines correctly
      // without the two OR-clauses stomping on each other.
      AND: [notExpiredWhere(), ownerActiveWhere(viewerUserId)],
    };

    // Chosen areas narrow further than their governorates, so they win
    const { governorateIds, areaIds } = locationFilter(dto);
    if (areaIds.length) where.areaId = { in: areaIds };
    else if (governorateIds.length)
      where.governorateId = { in: governorateIds };

    if (dto.searchQuery?.trim()) {
      const q = dto.searchQuery.trim();
      where.OR = [
        { location: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (dto.category?.length) where.category = { in: dto.category };
    if (dto.minPrice !== undefined || dto.maxPrice !== undefined) {
      where.price = {
        ...(dto.minPrice !== undefined ? { gte: dto.minPrice } : {}),
        ...(dto.maxPrice !== undefined ? { lte: dto.maxPrice } : {}),
      };
    }
    if (dto.requestYear !== undefined) where.requestYear = dto.requestYear;
    if (dto.requiredYear !== undefined) where.requiredYear = dto.requiredYear;

    const rows = await this.prisma.property.findMany({
      where,
      select: {
        id: true,
        type: true,
        price: true,
        latitude: true,
        longitude: true,
      },
      orderBy: { publishedAt: { sort: 'desc', nulls: 'last' } },
      take: MAP_LIMIT,
    });

    return propertiesToFeatureCollection(rows);
  }

  private async discoverCompanies(dto: GetMapBoundsDto, viewerUserId?: string) {
    const profileWhere: Prisma.CompanyIdentityDataWhereInput = {
      status: ApprovalStatus.APPROVED,
      latitude: { gte: dto.sw_lat, lte: dto.ne_lat, not: null },
      longitude: { gte: dto.sw_lng, lte: dto.ne_lng, not: null },
      // Hidden while the owner's account is suspended or blocked
      identity: {
        user: {
          isDisabled: false,
          isBlocked: false,
          ...(viewerUserId ? notBlockedUserWhere(viewerUserId) : {}),
        },
      },
    };

    if (dto.searchQuery?.trim()) {
      const q = dto.searchQuery.trim();
      profileWhere.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        // A hidden service («اخفاء الخدمة») matches nothing
        {
          servicesHidden: false,
          services: { contains: q, mode: 'insensitive' },
        },
        { specialty: { contains: q, mode: 'insensitive' } },
      ];
    }

    const { governorateIds, areaIds } = locationFilter(dto);
    if (governorateIds.length || areaIds.length) {
      const locationOr: Prisma.CompanyIdentityDataWhereInput[] = [];

      // A company matches if it's based in, or serves, any chosen place
      if (areaIds.length) {
        const areas = await this.prisma.area.findMany({
          where: { id: { in: areaIds } },
          select: { name: true },
        });
        for (const area of areas) {
          locationOr.push(
            { hqLocation: { contains: area.name, mode: 'insensitive' } },
            { serviceAreas: { contains: area.name, mode: 'insensitive' } },
          );
        }
      } else {
        const govs = await this.prisma.governorate.findMany({
          where: { id: { in: governorateIds } },
          select: { name: true },
        });
        for (const gov of govs) {
          locationOr.push(
            { hqLocation: { contains: gov.name, mode: 'insensitive' } },
            { serviceAreas: { contains: gov.name, mode: 'insensitive' } },
          );
        }
        if (govs.length) {
          locationOr.push({
            serviceAreas: { contains: 'جميع', mode: 'insensitive' },
          });
        }
      }

      if (locationOr.length) {
        profileWhere.AND = [{ OR: locationOr }];
      }
    }

    // Companies live on their persona (both signup paths); the pin id is the
    // company's identity id, the id its public profile is opened by
    const companies = await this.prisma.companyIdentityData.findMany({
      where: profileWhere,
      select: {
        identityId: true,
        latitude: true,
        longitude: true,
        logoUrl: true,
      },
      orderBy: { createdAt: 'desc' },
      take: MAP_LIMIT,
    });

    return companiesToFeatureCollection(
      companies.map(({ identityId, ...pin }) => ({ id: identityId, ...pin })),
    );
  }
}

/** The chosen governorates/areas, from the list params or the older single ones. */
function locationFilter(dto: GetMapBoundsDto) {
  const merge = (list?: string[], single?: string) => [
    ...new Set([...(list ?? []), ...(single ? [single] : [])]),
  ];
  return {
    governorateIds: merge(dto.governorateIds, dto.governorateId),
    areaIds: merge(dto.areaIds, dto.areaId),
  };
}
