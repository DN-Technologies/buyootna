import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, SavedLocationLabel } from '@prisma/client';
import { toAddressDetailsJson } from '../../core/dto/address-details.dto';
import { PrismaService } from '../../core/prisma/prisma.service';
import {
  CreateSavedLocationDto,
  UpdateSavedLocationDto,
} from './dto/saved-location.dto';

export const MAX_SAVED_LOCATIONS = 20;

// المنزل and العمل first, then custom places, newest first
const LABEL_ORDER: Record<SavedLocationLabel, number> = {
  HOME: 0,
  WORK: 1,
  OTHER: 2,
};

/**
 * The account's saved places for the location picker. HOME and WORK are
 * one each -- saving a new one replaces the old; OTHER needs a name.
 */
@Injectable()
export class SavedLocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const rows = await this.prisma.savedLocation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.sort((a, b) => LABEL_ORDER[a.label] - LABEL_ORDER[b.label]);
  }

  async create(userId: string, dto: CreateSavedLocationDto) {
    const name = this.checkName(dto.label, dto.name);
    const data = {
      label: dto.label,
      name,
      address: dto.address,
      latitude: dto.latitude,
      longitude: dto.longitude,
      details: toAddressDetailsJson(dto.details) ?? Prisma.DbNull,
    };

    if (dto.label !== SavedLocationLabel.OTHER) {
      // One المنزل and one العمل: a new one replaces the old
      const existing = await this.prisma.savedLocation.findFirst({
        where: { userId, label: dto.label },
      });
      if (existing) {
        return this.prisma.savedLocation.update({
          where: { id: existing.id },
          data,
        });
      }
    }

    const count = await this.prisma.savedLocation.count({ where: { userId } });
    if (count >= MAX_SAVED_LOCATIONS) {
      throw new BadRequestException(
        `يمكنك حفظ ${MAX_SAVED_LOCATIONS} موقعاً كحد أقصى، احذف موقعاً لإضافة جديد`,
      );
    }
    return this.prisma.savedLocation.create({ data: { ...data, userId } });
  }

  async update(userId: string, id: string, dto: UpdateSavedLocationDto) {
    const existing = await this.own(userId, id);
    const label = dto.label ?? existing.label;
    const name = this.checkName(label, dto.name ?? existing.name ?? undefined);
    if (label !== existing.label && label !== SavedLocationLabel.OTHER) {
      // Becoming المنزل / العمل replaces the current one of that kind
      await this.prisma.savedLocation.deleteMany({
        where: { userId, label, NOT: { id } },
      });
    }
    return this.prisma.savedLocation.update({
      where: { id },
      data: {
        label,
        name,
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.latitude !== undefined ? { latitude: dto.latitude } : {}),
        ...(dto.longitude !== undefined ? { longitude: dto.longitude } : {}),
        ...(dto.details !== undefined
          ? { details: toAddressDetailsJson(dto.details) ?? Prisma.DbNull }
          : {}),
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.own(userId, id);
    await this.prisma.savedLocation.delete({ where: { id } });
    return { success: true };
  }

  private async own(userId: string, id: string) {
    const row = await this.prisma.savedLocation.findFirst({
      where: { id, userId },
    });
    if (!row) throw new NotFoundException('الموقع غير موجود');
    return row;
  }

  private checkName(label: SavedLocationLabel, name?: string) {
    if (label === SavedLocationLabel.OTHER) {
      if (!name?.trim()) {
        throw new BadRequestException('اكتب اسماً للموقع');
      }
      return name.trim();
    }
    return null;
  }
}
