import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { AdminUpdateIdentityStatusDto } from '../dto/admin-update-identity-status.dto';

@Injectable()
export class AdminIdentityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async updateIdentityStatus(
    identityId: string,
    dto: AdminUpdateIdentityStatusDto,
  ) {
    const identity = await this.prisma.identity.findUnique({
      where: { id: identityId },
      include: { companyData: true, officeData: true },
    });

    if (!identity) {
      throw new NotFoundException('الهوية غير موجودة');
    }

    const isVerified = dto.status === 'APPROVED';
    let identityLabel: string;

    if (identity.type === 'COMPANY' && identity.companyData) {
      await this.prisma.companyIdentityData.update({
        where: { identityId },
        data: { status: dto.status, isVerified },
      });
      identityLabel = 'الشركة';
    } else if (identity.type === 'OFFICE' && identity.officeData) {
      await this.prisma.officeIdentityData.update({
        where: { identityId },
        data: { status: dto.status, isVerified },
      });
      identityLabel = 'المكتب';
    } else {
      throw new BadRequestException('هذا النوع من الهويات لا يخضع للمراجعة');
    }

    const title =
      dto.status === 'APPROVED' ? 'تمت الموافقة على هويتك' : 'تم رفض هويتك';
    const body =
      dto.status === 'APPROVED'
        ? `تمت الموافقة على طلب هوية ${identityLabel} الخاص بك، ويمكنك الآن استخدامه بالكامل.`
        : `للأسف تم رفض طلب هوية ${identityLabel} الخاص بك. يرجى مراجعة بياناتك والمحاولة مرة أخرى أو التواصل مع الدعم.`;

    await this.notificationsService.create({
      userId: identity.userId,
      type:
        dto.status === 'APPROVED' ? 'IDENTITY_APPROVED' : 'IDENTITY_REJECTED',
      title,
      body,
      identityId,
    });

    return this.prisma.identity.findUnique({
      where: { id: identityId },
      include: { companyData: true, officeData: true, individualData: true },
    });
  }
}
