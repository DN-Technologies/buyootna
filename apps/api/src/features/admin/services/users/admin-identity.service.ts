import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import {
  MailService,
  SendMailOptions,
} from '../../../../core/mail/mail.service';
import { NotificationsService } from '../../../notifications/notifications.service';
import { AdminUpdateIdentityStatusDto } from '../../dto/admin-update-identity-status.dto';
import { AdminRequestIdentityEditDto } from '../../dto/admin-request-identity-edit.dto';
import { identityVerificationDecisionTemplate } from '../../../../core/mail/templates/identity-verification-decision.template';
import { identityEditRequestedTemplate } from '../../../../core/mail/templates/identity-edit-requested.template';
import { AdminAuditLogService } from '../audit/admin-audit-log.service';
import { grantTrialIfNew } from '../../../company-subscriptions/company-subscription.rules';
import {
  CompanyVerificationService,
  VERIFICATION_FIELDS,
} from '../../../identities/verification/company-verification.service';

// The reasons the admin gave per field, as one text (notification, email)
const FIELD_LABELS: Record<(typeof VERIFICATION_FIELDS)[number], string> = {
  licenseFile: 'صورة الرخصة',
  licenseNumber: 'رقم الرخصة',
  licenseActivity: 'النشاط',
  licenseExpiry: 'تاريخ الانتهاء',
};

@Injectable()
export class AdminIdentityService {
  private readonly logger = new Logger(AdminIdentityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
    private readonly auditLog: AdminAuditLogService,
    private readonly verification: CompanyVerificationService,
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
      identityLabel = 'الشركة';
      if (dto.status === 'APPROVED') {
        // Its «طلب التوثيق», if pending: the licence goes onto the company
        await this.verification.approve(identityId, adminUserId);
        await this.prisma.companyIdentityData.update({
          where: { identityId },
          data: { status: 'APPROVED', isVerified: true },
        });
        // An approved company starts on its free trial (once)
        await grantTrialIfNew(this.prisma, identityId);
      } else {
        // Verification is only the «موثق» badge: the company stays live. A
        // pending «طلب التوثيق» goes back to it with the reason
        const sentBack = await this.verification.requestChanges(
          identityId,
          { note: dto.reason?.trim() || 'لم يتم قبول بيانات الرخصة' },
          adminUserId,
        );
        if (!sentBack) {
          await this.prisma.companyIdentityData.update({
            where: { identityId },
            data: { isVerified: false },
          });
        }
      }

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

    const isCompany = identity.type === 'COMPANY';
    const title = isCompany
      ? dto.status === 'APPROVED'
        ? 'حسابك موثق بنجاح'
        : 'مطلوب استكمال بيانات طلب التوثيق'
      : dto.status === 'APPROVED'
        ? 'تمت الموافقة على هويتك'
        : 'تم رفض هويتك';
    const body = isCompany
      ? dto.status === 'APPROVED'
        ? 'تم التحقق من بيانات الرخصة واعتماد حسابك.'
        : `بعد مراجعة طلبك، نحتاج إلى تحديث بيانات الرخصة لاستكمال عملية التوثيق.${dto.reason ? ` ${dto.reason}` : ''}`
      : dto.status === 'APPROVED'
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
    // Per field (a company's «طلب التوثيق»), as one text for the message
    const fieldReasons = VERIFICATION_FIELDS.filter((f) =>
      dto.issues?.[f]?.trim(),
    ).map((f) => `${FIELD_LABELS[f]}: ${dto.issues![f]!.trim()}`);
    const notes = [dto.notes?.trim(), ...fieldReasons]
      .filter(Boolean)
      .join('\n');
    if (!notes) {
      throw new BadRequestException('حدد البيانات المطلوب تعديلها');
    }

    if (identity.type === 'COMPANY' && identity.companyData) {
      identityLabel = 'الشركة';
      // Its open «طلب التوثيق» goes back with a reason per field
      await this.verification.requestChanges(
        identityId,
        { ...dto.issues, note: dto.notes },
        adminUserId,
      );
      await this.prisma.reviewRequest.create({
        data: {
          status: 'PENDING',
          notes,
          companyIdentityDataId: identity.companyData.id,
        },
      });
    } else if (identity.type === 'OFFICE' && identity.officeData) {
      identityLabel = 'المكتب';
      await this.prisma.reviewRequest.create({
        data: {
          status: 'PENDING',
          notes,
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
        body: notes,
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
          notes,
        }),
      });
    }

    await this.auditLog.log({
      actorAdminId: adminUserId,
      action: 'IDENTITY_EDIT_REQUESTED',
      targetType: 'IDENTITY',
      targetId: identityId,
      targetUserId: identity.userId,
      metadata: { notes },
    });

    return this.prisma.identity.findUnique({
      where: { id: identityId },
      include: { companyData: true, officeData: true, individualData: true },
    });
  }
}
