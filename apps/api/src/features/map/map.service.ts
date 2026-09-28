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

const MAP_LIMIT = 500;

const PIN_TO_LISTING: Record<Exclude<MapPinType, 'company'>, ListingType> = {
  sell: ListingType.SALE,
  rent: ListingType.RENT,
  exchange: ListingType.EXCHANGE,
};

@Injectable()
export class MapService {
  constructor(private readonly prisma: PrismaService) {}

  async discover(dto: GetMapBoundsDto) {
    this.assertValidBounds(dto);

    const type = dto.type ?? 'sell';

    if (type === 'company') {
      return this.discoverCompanies(dto);
    }

    return this.discoverProperties(dto, type);
  }

  private assertValidBounds(dto: GetMapBoundsDto) {
    if (dto.ne_lat < dto.sw_lat || dto.ne_lng < dto.sw_lng) {
      throw new BadRequestException('Invalid bounding box');
    }
  }

  private async discoverProperties(
    dto: GetMapBoundsDto,
    type: Exclude<MapPinType, 'company'>,
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
      AND: [notExpiredWhere(), ownerActiveWhere()],
    };

    if (dto.governorateId) where.governorateId = dto.governorateId;
    if (dto.areaId) where.areaId = dto.areaId;

    if (dto.searchQuery?.trim()) {
      const q = dto.searchQuery.trim();
      where.OR = [
        { location: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

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

  private async discoverCompanies(dto: GetMapBoundsDto) {
    const profileWhere: Prisma.CompanyProfileWhereInput = {
      status: ApprovalStatus.APPROVED,
      latitude: { gte: dto.sw_lat, lte: dto.ne_lat, not: null },
      longitude: { gte: dto.sw_lng, lte: dto.ne_lng, not: null },
    };

    if (dto.searchQuery?.trim()) {
      const q = dto.searchQuery.trim();
      profileWhere.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { services: { contains: q, mode: 'insensitive' } },
        { specialty: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (dto.governorateId || dto.areaId) {
      const locationOr: Prisma.CompanyProfileWhereInput[] = [];

      if (dto.governorateId) {
        const gov = await this.prisma.governorate.findUnique({
          where: { id: dto.governorateId },
          select: { name: true },
        });
        if (gov) {
          locationOr.push(
            { hqLocation: { contains: gov.name, mode: 'insensitive' } },
            { serviceAreas: { contains: gov.name, mode: 'insensitive' } },
            { serviceAreas: { contains: 'جميع', mode: 'insensitive' } },
          );
        }
      }

      if (dto.areaId) {
        const area = await this.prisma.area.findUnique({
          where: { id: dto.areaId },
          select: { name: true },
        });
        if (area) {
          locationOr.push(
            { hqLocation: { contains: area.name, mode: 'insensitive' } },
            { serviceAreas: { contains: area.name, mode: 'insensitive' } },
          );
        }
      }

      if (locationOr.length) {
        profileWhere.AND = [{ OR: locationOr }];
      }
    }

    const rows = await this.prisma.companyProfile.findMany({
      where: profileWhere,
      select: {
        id: true,
        latitude: true,
        longitude: true,
        logoUrl: true,
      },
      orderBy: { createdAt: 'desc' },
      take: MAP_LIMIT,
    });

    return companiesToFeatureCollection(rows);
  }
}
