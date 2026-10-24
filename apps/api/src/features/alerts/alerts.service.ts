import { Injectable, NotFoundException } from '@nestjs/common';
import { Alert, ListingType } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import {
  notExpiredWhere,
  ownerActiveWhere,
} from '../properties/services/property-expiry.util';
import {
  formatProperties,
  propertyFeedPayload,
} from '../properties/services/property-formatting.util';
import { alertMatchWhere } from './alert-matching.util';
import { CreateAlertDto } from './dto/create-alert.dto';

const MATCHES_LIMIT = 50;

type AlertWithCount = Alert & { _count: { matches: number } };

function toAlertCriteria(dto: CreateAlertDto) {
  return {
    type: dto.type,
    operationType: dto.operationType
      ? (dto.operationType as ListingType)
      : null,
    governorateId: dto.governorateId,
    areaId: dto.areaId ?? null,
    categoryId: dto.categoryId ?? null,
    price: dto.price ?? null,
    rentValue: dto.rentValue ?? null,
    areaSize: dto.areaSize ?? null,
    rooms: dto.rooms ?? null,
    baths: dto.baths ?? null,
    floors: dto.floors ?? null,
    requestYear: dto.requestYear ?? null,
    requiredYear: dto.requiredYear ?? null,
    amenities: dto.amenities ?? [],
    startDate: dto.startDate ? new Date(dto.startDate) : null,
    endDate: dto.endDate ? new Date(dto.endDate) : null,
  };
}

function toAlertResponse({ _count, ...alert }: AlertWithCount) {
  return { ...alert, matchCount: _count.matches };
}

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(identityId: string, dto: CreateAlertDto) {
    return this.prisma.alert.create({
      data: { identityId, ...toAlertCriteria(dto) },
    });
  }

  // Replaces the alert's criteria (the edit form always sends the full set;
  // anything omitted is cleared). Pause state and match history are kept.
  async update(identityId: string, id: string, dto: CreateAlertDto) {
    await this.findOwned(identityId, id);
    const alert = await this.prisma.alert.update({
      where: { id },
      data: toAlertCriteria(dto),
      include: { _count: { select: { matches: true } } },
    });
    return toAlertResponse(alert);
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

  // Live listings that currently satisfy the alert. Opening them is seeing
  // the alert's matches, so the avatar pill's "+N" drops them
  async findMatches(identityId: string, id: string) {
    const alert = await this.findOwned(identityId, id);
    await this.prisma.alertMatch.updateMany({
      where: { alertId: id, seenAt: null },
      data: { seenAt: new Date() },
    });
    const properties = await this.prisma.property.findMany({
      where: {
        AND: [
          alertMatchWhere(alert),
          { status: 'ACTIVE', isHidden: false },
          notExpiredWhere(),
          ownerActiveWhere(),
          { NOT: { identityId } },
        ],
      },
      orderBy: [
        { isPriority: 'desc' },
        { publishedAt: { sort: 'desc', nulls: 'last' } },
      ],
      take: MATCHES_LIMIT,
      ...propertyFeedPayload,
    });
    return formatProperties(properties);
  }

  // Matches of the identity's active alerts not opened yet, on listings
  // still live. alertId says where to go: the one alert they all belong
  // to, or null (none, or several: the alerts list)
  async findUnseenMatches(identityId: string) {
    const unseen = await this.prisma.alertMatch.findMany({
      where: {
        seenAt: null,
        alert: { identityId, isActive: true },
        property: { status: 'ACTIVE', isHidden: false },
      },
      select: { alertId: true },
    });
    const alertIds = new Set(unseen.map((m) => m.alertId));
    return {
      count: unseen.length,
      alertId: alertIds.size === 1 ? [...alertIds][0] : null,
    };
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
