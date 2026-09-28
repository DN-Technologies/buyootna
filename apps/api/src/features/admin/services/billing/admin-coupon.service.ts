import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { MailService } from '../../../../core/mail/mail.service';
import {
  AdminGrantCouponDto,
  AdminGrantBulkCouponDto,
} from '../../dto/admin-grant-coupon.dto';
import { AdminAuditLogService } from '../audit/admin-audit-log.service';

export interface AvailableCoupon {
  id: string;
  name: string;
  code: string;
  discount: string;
}

export const AVAILABLE_SYSTEM_COUPONS: AvailableCoupon[] = [
  { id: 'c1', name: 'Byoutna10', code: 'LAUNCHPROMO26', discount: '10%' },
  { id: 'c2', name: 'Byoutna20', code: 'SPECIAL20', discount: '20%' },
  { id: 'c3', name: 'Byoutna50', code: 'VIP50', discount: '50%' },
];

@Injectable()
export class AdminCouponService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly auditLog: AdminAuditLogService,
  ) {}

  getAvailableCoupons(): AvailableCoupon[] {
    return AVAILABLE_SYSTEM_COUPONS;
  }

  async grantCoupon(
    userId: string,
    dto: AdminGrantCouponDto,
    adminUserId?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    if (dto.notifyEmail && user.email) {
      try {
        await this.mailService.sendMail({
          to: user.email,
          subject: 'كوبون خصم جديد - بيوتنا',
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; color: #111;">
              <h2>تهانينا، تم منحك كوبون خصم!</h2>
              <p>مرحباً ${user.name || 'مستخدم بيوتنا'}،</p>
              <p>تم إضافة كود الخصم التالي لتطبيقه على اشتراكك القادم:</p>
              <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; font-weight: bold; font-size: 18px; text-align: center; color: #15304d; margin: 15px 0;">
                ${dto.couponCode}
              </div>
              <p>شكراً لاستخدامك منصة بيوتنا.</p>
            </div>
          `,
        });
      } catch (err) {
        console.warn('Failed to send coupon email notification:', err);
      }
    }

    const displayName = user.name || user.email || 'المستخدم';

    await this.auditLog.log({
      actorAdminId: adminUserId,
      action: 'COUPON_GRANTED',
      targetType: 'COUPON',
      targetUserId: user.id,
      metadata: { couponCode: dto.couponCode, couponName: dto.couponName },
    });

    return {
      message: `تم اضافة كوبون خصم للمستخدم “${displayName}” بنجاح.`,
      coupon: {
        code: dto.couponCode,
        name: dto.couponName || dto.couponCode,
      },
      userId: user.id,
    };
  }

  async grantBulkCoupon(dto: AdminGrantBulkCouponDto, adminUserId?: string) {
    if (!dto.userIds || dto.userIds.length === 0) {
      throw new BadRequestException('يجب تحديد مستخدم واحد على الأقل');
    }

    const users = await this.prisma.user.findMany({
      where: {
        id: { in: dto.userIds },
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const grantedUserIds: string[] = [];
    const failedUserIds: string[] = [];

    for (const userId of dto.userIds) {
      const user = userMap.get(userId);
      if (!user) {
        failedUserIds.push(userId);
        continue;
      }

      if (dto.notifyEmail && user.email) {
        try {
          await this.mailService.sendMail({
            to: user.email,
            subject: 'كوبون خصم جديد - بيوتنا',
            html: `
              <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; color: #111;">
                <h2>تهانينا، تم منحك كوبون خصم!</h2>
                <p>مرحباً ${user.name || 'مستخدم بيوتنا'}،</p>
                <p>تم إضافة كود الخصم التالي لتطبيقه على اشتراكك القادم:</p>
                <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; font-weight: bold; font-size: 18px; text-align: center; color: #15304d; margin: 15px 0;">
                  ${dto.couponCode}
                </div>
                <p>شكراً لاستخدامك منصة بيوتنا.</p>
              </div>
            `,
          });
        } catch (err) {
          console.warn(
            `Failed to send coupon email notification to ${user.email}:`,
            err,
          );
        }
      }

      grantedUserIds.push(user.id);
      await this.auditLog.log({
        actorAdminId: adminUserId,
        action: 'COUPON_BULK_GRANTED',
        targetType: 'COUPON',
        targetUserId: user.id,
        metadata: { couponCode: dto.couponCode, couponName: dto.couponName },
      });
    }

    return {
      message: `تم اضافة كوبون خصم لـ ${grantedUserIds.length} مستخدمين بنجاح.`,
      coupon: {
        code: dto.couponCode,
        name: dto.couponName || dto.couponCode,
      },
      grantedCount: grantedUserIds.length,
      grantedUserIds,
      failedUserIds,
    };
  }
}
