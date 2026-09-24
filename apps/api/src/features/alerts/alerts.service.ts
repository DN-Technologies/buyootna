import { Injectable, NotFoundException } from '@nestjs/common';
import { Alert, ListingType } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { notExpiredWhere } from '../properties/services/property-expiry.util';
import {
  formatProperties,
  propertyFeedPayload,
} from '../properties/services/property-formatting.util';
import { alertMatchWhere } from './alert-matching.util';
import { CreateAlertDto } from './dto/create-alert.dto';

const MATCHES_LIMIT = 50;

type AlertWithCount = Alert & { _count: { matches: number } };

function toAlertResponse({ _count, ...alert }: AlertWithCount) {
  return { ...alert, matchCount: _count.matches };
}

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(identityId: string, dto: CreateAlertDto) {
    return this.prisma.alert.create({
      data: {
        identityId,
        type: dto.type,
        operationType: dto.operationType
          ? (dto.operationType as ListingType)
          : undefined,
        governorateId: dto.governorateId,
        areaId: dto.areaId,
        categoryId: dto.categoryId,
        price: dto.price,
        rentValue: dto.rentValue,
        areaSize: dto.areaSize,
        rooms: dto.rooms,
        baths: dto.baths,
        floors: dto.floors,
        requestYear: dto.requestYear,
        requiredYear: dto.requiredYear,
        amenities: dto.amenities ?? [],
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async findMine(identityId: string) {
    const alerts = await this.prisma.alert.findMany({
      where: { identityId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { matches: true } } },
    });
    return alerts.map(toAlertResponse);
  }

  async setActive(identityId: string, id: string, isActive: boolean) {
    await this.findOwned(identityId, id);
    const alert = await this.prisma.alert.update({
      where: { id },
      data: { isActive },
      include: { _count: { select: { matches: true } } },
    });
    return toAlertResponse(alert);
  }

  async setAllActive(identityId: string, isActive: boolean) {
    const { count } = await this.prisma.alert.updateMany({
      where: { identityId },
      data: { isActive },
    });
    return { count };
  }

  // Live listings that currently satisfy the alert
  async findMatches(identityId: string, id: string) {
    const alert = await this.findOwned(identityId, id);
    const properties = await this.prisma.property.findMany({
      where: {
        AND: [
          alertMatchWhere(alert),
          { status: 'ACTIVE', isHidden: false },
          notExpiredWhere(),
          { NOT: { identityId } },
        ],
      },
      orderBy: [{ isPriority: 'desc' }, { createdAt: 'desc' }],
      take: MATCHES_LIMIT,
      ...propertyFeedPayload,
    });
    return formatProperties(properties);
  }

  async remove(identityId: string, id: string) {
    await this.findOwned(identityId, id);
    await this.prisma.alert.delete({ where: { id } });
    return { message: 'تم حذف التنبيه بنجاح' };
  }

  private async findOwned(identityId: string, id: string) {
    const alert = await this.prisma.alert.findUnique({ where: { id } });
    if (!alert || alert.identityId !== identityId) {
      throw new NotFoundException('التنبيه غير موجود أو تم حذفه');
    }
    return alert;
  }
}
