import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { MailService, SendMailOptions } from '../../../core/mail/mail.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { AdminUpdateIdentityStatusDto } from '../dto/admin-update-identity-status.dto';
import { AdminRequestIdentityEditDto } from '../dto/admin-request-identity-edit.dto';
import { identityVerificationDecisionTemplate } from '../../../core/mail/templates/identity-verification-decision.template';
import { identityEditRequestedTemplate } from '../../../core/mail/templates/identity-edit-requested.template';
import { AdminAuditLogService } from './admin-audit-log.service';

@Injectable()
export class AdminIdentityService {
  private readonly logger = new Logger(AdminIdentityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
    private readonly auditLog: AdminAuditLogService,
  ) {}

  // The identity/ReviewRequest write above this call already succeeded and
  // committed -- a transient email-delivery failure (invalid address,
  // provider rejection, etc.) is a supplementary-notification problem, not
  // a reason to make the actual admin action look like it failed.
  private async sendMailBestEffort(options: SendMailOptions): Promise<void> {
    try {
      await this.mailService.sendMail(options);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Notification email to ${options.to} failed: ${message}`,
      );
    }
  }

  async updateIdentityStatus(
    identityId: string,
    dto: AdminUpdateIdentityStatusDto,
    adminUserId?: string,
  ) {
    const identity = await this.prisma.identity.findUnique({
      where: { id: identityId },
      include: { companyData: true, officeData: true, user: true },
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

      if (dto.status === 'REJECTED' && dto.reason) {
        await this.prisma.reviewRequest.create({
          data: {
            status: 'REJECTED',
            notes: dto.reason,
            companyIdentityDataId: identity.companyData.id,
          },
        });
      }
    } else if (identity.type === 'OFFICE' && identity.officeData) {
      await this.prisma.officeIdentityData.update({
        where: { identityId },
        data: { status: dto.status, isVerified },
      });
      identityLabel = 'المكتب';

      if (dto.status === 'REJECTED' && dto.reason) {
        await this.prisma.reviewRequest.create({
          data: {
            status: 'REJECTED',
            notes: dto.reason,
            officeIdentityDataId: identity.officeData.id,
          },
        });
      }
    } else {
      throw new BadRequestException('هذا النوع من الهويات لا يخضع للمراجعة');
    }

    const title =
      dto.status === 'APPROVED' ? 'تمت الموافقة على هويتك' : 'تم رفض هويتك';
    const body =
      dto.status === 'APPROVED'
        ? `تمت الموافقة على طلب هوية ${identityLabel} الخاص بك، ويمكنك الآن استخدامه بالكامل.`
        : `للأسف تم رفض طلب هوية ${identityLabel} الخاص بك. يرجى مراجعة بياناتك والمحاولة مرة أخرى أو التواصل مع الدعم.`;

    if (dto.notifyInApp !== false) {
      await this.notificationsService.create({
        userId: identity.userId,
        type:
          dto.status === 'APPROVED' ? 'IDENTITY_APPROVED' : 'IDENTITY_REJECTED',
        title,
        body,
        identityId,
      });
    }

    if (dto.notifyEmail !== false && identity.user.email) {
      await this.sendMailBestEffort({
        to: identity.user.email,
        subject: title,
        html: identityVerificationDecisionTemplate({
          userName: identity.user.name || 'مستخدم بيوتنا',
          identityLabel,
          approved: dto.status === 'APPROVED',
          reason: dto.status === 'REJECTED' ? dto.reason : undefined,
        }),
      });
    }

    await this.auditLog.log({
      actorAdminId: adminUserId,
      action:
        dto.status === 'APPROVED' ? 'IDENTITY_APPROVED' : 'IDENTITY_REJECTED',
      targetType: 'IDENTITY',
      targetId: identityId,
      targetUserId: identity.userId,
      metadata: dto.reason ? { reason: dto.reason } : undefined,
    });

    return this.prisma.identity.findUnique({
      where: { id: identityId },
      include: { companyData: true, officeData: true, individualData: true },
    });
  }

  async requestIdentityEdit(
    identityId: string,
    dto: AdminRequestIdentityEditDto,
    adminUserId?: string,
  ) {
    const identity = await this.prisma.identity.findUnique({
      where: { id: identityId },
      include: { companyData: true, officeData: true, user: true },
    });

    if (!identity) {
      throw new NotFoundException('الهوية غير موجودة');
    }

    let identityLabel: string;

    if (identity.type === 'COMPANY' && identity.companyData) {
      identityLabel = 'الشركة';
      await this.prisma.reviewRequest.create({
        data: {
          status: 'PENDING',
          notes: dto.notes,
          companyIdentityDataId: identity.companyData.id,
        },
      });
    } else if (identity.type === 'OFFICE' && identity.officeData) {
      identityLabel = 'المكتب';
      await this.prisma.reviewRequest.create({
        data: {
          status: 'PENDING',
          notes: dto.notes,
          officeIdentityDataId: identity.officeData.id,
        },
      });
    } else {
      throw new BadRequestException('هذا النوع من الهويات لا يخضع للمراجعة');
    }

    // Identity status is intentionally left untouched (stays PENDING) --
    // this only asks the owner for corrections, it isn't a decision.

    if (dto.notifyInApp !== false) {
      await this.notificationsService.create({
        userId: identity.userId,
        type: 'IDENTITY_EDIT_REQUESTED',
        title: `مطلوب تعديل على بيانات ${identityLabel}`,
        body: dto.notes,
        identityId,
      });
    }

    if (dto.notifyEmail !== false && identity.user.email) {
      await this.sendMailBestEffort({
        to: identity.user.email,
        subject: `مطلوب تعديل على بيانات ${identityLabel}`,
        html: identityEditRequestedTemplate({
          userName: identity.user.name || 'مستخدم بيوتنا',
          identityLabel,
          notes: dto.notes,
        }),
      });
    }

    await this.auditLog.log({
      actorAdminId: adminUserId,
      action: 'IDENTITY_EDIT_REQUESTED',
      targetType: 'IDENTITY',
      targetId: identityId,
      targetUserId: identity.userId,
      metadata: { notes: dto.notes },
    });

    return this.prisma.identity.findUnique({
      where: { id: identityId },
      include: { companyData: true, officeData: true, individualData: true },
    });
  }
}
