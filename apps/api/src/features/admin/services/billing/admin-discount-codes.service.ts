import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminActionType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { normalizeDiscountCode } from '../../../payments/discounts.rules';
import {
  AdminCreateDiscountCodeDto,
  AdminUpdateDiscountCodeDto,
} from '../../dto/admin-discount-code.dto';
import { AdminAuditLogService } from '../audit/admin-audit-log.service';

/**
 * «أكواد الخصم»: the codes the app's payment screen accepts. Codes are
 * deactivated rather than deleted, so paid invoices keep pointing at them.
 */
@Injectable()
export class AdminDiscountCodesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AdminAuditLogService,
  ) {}

  list() {
    return this.prisma.discountCode.findMany({
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });
  }

  private assertValid(
    dto: Pick<AdminCreateDiscountCodeDto, 'type' | 'value'> &
      Partial<Pick<AdminCreateDiscountCodeDto, 'startsAt' | 'expiresAt'>>,
  ) {
    if (dto.type === 'PERCENT' && dto.value > 100) {
      throw new BadRequestException('نسبة الخصم لا تتجاوز 100%');
    }
    if (dto.startsAt && dto.expiresAt && dto.expiresAt <= dto.startsAt) {
      throw new BadRequestException('تاريخ الانتهاء يجب أن يكون بعد البداية');
    }
  }

  async create(dto: AdminCreateDiscountCodeDto, adminUserId: string) {
    this.assertValid(dto);
    const code = normalizeDiscountCode(dto.code);
    try {
      const created = await this.prisma.discountCode.create({
        data: { ...dto, code },
      });
      await this.auditLog.log({
        actorAdminId: adminUserId,
        action: AdminActionType.DISCOUNT_CODE_CREATED,
        targetType: 'DISCOUNT_CODE',
        targetId: created.id,
        metadata: { ...dto, code },
      });
      return created;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('هذا الكود موجود مسبقاً');
      }
      throw error;
    }
  }

  async update(
    id: string,
    dto: AdminUpdateDiscountCodeDto,
    adminUserId: string,
  ) {
    const existing = await this.prisma.discountCode.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('كود الخصم غير موجود');
    this.assertValid({
      type: dto.type ?? existing.type,
      value: dto.value ?? existing.value,
      startsAt: dto.startsAt === undefined ? existing.startsAt : dto.startsAt,
      expiresAt:
        dto.expiresAt === undefined ? existing.expiresAt : dto.expiresAt,
    });

    const data = dto.code
      ? { ...dto, code: normalizeDiscountCode(dto.code) }
      : dto;
    try {
      const updated = await this.prisma.discountCode.update({
        where: { id },
        data,
      });
      await this.auditLog.log({
        actorAdminId: adminUserId,
        action: AdminActionType.DISCOUNT_CODE_UPDATED,
        targetType: 'DISCOUNT_CODE',
        targetId: id,
        metadata: {
          before: {
            code: existing.code,
            type: existing.type,
            value: existing.value,
            isActive: existing.isActive,
          },
          changes: { ...data },
        },
      });
      return updated;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('هذا الكود موجود مسبقاً');
      }
      throw error;
    }
  }
}
