import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminActionType } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import {
  AdminCreateFeaturePackageDto,
  AdminUpdateFeaturePackageDto,
} from '../dto/admin-feature-package.dto';
import { AdminAuditLogService } from './admin-audit-log.service';

/**
 * The "feature this ad" price list the app shows. Packages are deactivated
 * rather than deleted, so past invoices keep pointing at what was bought.
 */
@Injectable()
export class AdminFeaturePackagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AdminAuditLogService,
  ) {}

  list() {
    return this.prisma.featurePackage.findMany({
      orderBy: [{ sortOrder: 'asc' }, { durationDays: 'asc' }],
    });
  }

  async create(dto: AdminCreateFeaturePackageDto, adminUserId: string) {
    const created = await this.prisma.featurePackage.create({ data: dto });
    await this.auditLog.log({
      actorAdminId: adminUserId,
      action: AdminActionType.FEATURE_PACKAGE_CREATED,
      targetType: 'FEATURE_PACKAGE',
      targetId: created.id,
      metadata: { ...dto },
    });
    return created;
  }

  async update(
    id: string,
    dto: AdminUpdateFeaturePackageDto,
    adminUserId: string,
  ) {
    const existing = await this.prisma.featurePackage.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('باقة التمييز غير موجودة');

    const updated = await this.prisma.featurePackage.update({
      where: { id },
      data: dto,
    });
    await this.auditLog.log({
      actorAdminId: adminUserId,
      action: AdminActionType.FEATURE_PACKAGE_UPDATED,
      targetType: 'FEATURE_PACKAGE',
      targetId: id,
      metadata: {
        before: {
          label: existing.label,
          price: existing.price,
          durationDays: existing.durationDays,
          isActive: existing.isActive,
        },
        changes: { ...dto },
      },
    });
    return updated;
  }
}
