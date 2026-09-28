import { Injectable, NotFoundException } from '@nestjs/common';
import { ListingStatus } from '@prisma/client';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AdminUpdatePropertyDto } from '../../dto/admin-update-property.dto';
import { AdminAuditLogService } from '../audit/admin-audit-log.service';

@Injectable()
export class AdminPropertiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AdminAuditLogService,
  ) {}

  async updateProperty(
    propertyId: string,
    dto: AdminUpdatePropertyDto,
    adminUserId: string,
  ) {
    const existing = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: { identity: { select: { userId: true } } },
    });
    if (!existing) throw new NotFoundException('الاعلان غير موجود');

    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: {
        ...(dto.isHidden !== undefined ? { isHidden: dto.isHidden } : {}),
        ...(dto.isFeatured !== undefined ? { isFeatured: dto.isFeatured } : {}),
        ...(dto.featuredUntil !== undefined
          ? { featuredUntil: new Date(dto.featuredUntil) }
          : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
    });

    const targetUserId = existing.identity?.userId;

    if (dto.isFeatured === true) {
      await this.auditLog.log({
        actorAdminId: adminUserId,
        action: 'PROPERTY_FEATURED',
        targetType: 'PROPERTY',
        targetId: propertyId,
        targetUserId,
      });
    }
    if (dto.isHidden === true) {
      await this.auditLog.log({
        actorAdminId: adminUserId,
        action: 'PROPERTY_HIDDEN',
        targetType: 'PROPERTY',
        targetId: propertyId,
        targetUserId,
      });
    }
    if (dto.isHidden === false) {
      await this.auditLog.log({
        actorAdminId: adminUserId,
        action: 'PROPERTY_UNHIDDEN',
        targetType: 'PROPERTY',
        targetId: propertyId,
        targetUserId,
      });
    }
    if (dto.status === ListingStatus.ACTIVE) {
      await this.auditLog.log({
        actorAdminId: adminUserId,
        action: 'PROPERTY_REPUBLISHED',
        targetType: 'PROPERTY',
        targetId: propertyId,
        targetUserId,
      });
    }

    return updated;
  }
}
