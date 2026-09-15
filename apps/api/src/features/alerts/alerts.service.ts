import { Injectable, NotFoundException } from '@nestjs/common';
import { ListingType } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateAlertDto } from './dto/create-alert.dto';

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
    return this.prisma.alert.findMany({
      where: { identityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(identityId: string, id: string) {
    const alert = await this.prisma.alert.findUnique({ where: { id } });
    if (!alert || alert.identityId !== identityId) {
      throw new NotFoundException('التنبيه غير موجود أو تم حذفه');
    }
    await this.prisma.alert.delete({ where: { id } });
    return { message: 'تم حذف التنبيه بنجاح' };
  }
}
