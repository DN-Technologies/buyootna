import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminCouponService } from './admin-coupon.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { MailService } from '../../../../core/mail/mail.service';
import { AdminAuditLogService } from '../audit/admin-audit-log.service';

describe('AdminCouponService', () => {
  let service: AdminCouponService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
  };
  let mail: { sendMail: jest.Mock };
  let auditLog: { log: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };

    mail = {
      sendMail: jest.fn().mockResolvedValue({ success: true }),
    };

    auditLog = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminCouponService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: MailService,
          useValue: mail,
        },
        {
          provide: AdminAuditLogService,
          useValue: auditLog,
        },
      ],
    }).compile();

    service = module.get<AdminCouponService>(AdminCouponService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAvailableCoupons', () => {
    it('should return available promotional coupons', () => {
      const coupons = service.getAvailableCoupons();
      expect(coupons).toBeDefined();
      expect(coupons.length).toBeGreaterThan(0);
      expect(coupons[0].name).toBe('Byoutna10');
    });
  });

  describe('grantCoupon', () => {
    it('should throw NotFoundException when granting coupon to non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.grantCoupon('non-existent', {
          couponCode: 'LAUNCHPROMO26',
          couponName: 'Byoutna10',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should grant coupon and return success message matching Figma 5634:72196', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-coupon-1',
        name: 'على البالي',
        email: 'ali@example.com',
      });

      const res = await service.grantCoupon('user-coupon-1', {
        couponCode: 'LAUNCHPROMO26',
        couponName: 'Byoutna10',
        notifyEmail: true,
      });

      expect(mail.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'ali@example.com',
          subject: 'كوبون خصم جديد - بيوتنا',
        }),
      );
      expect(res.message).toBe(
        'تم اضافة كوبون خصم للمستخدم “على البالي” بنجاح.',
      );
      expect(res.coupon.code).toBe('LAUNCHPROMO26');
      expect(res.userId).toBe('user-coupon-1');
    });

    it('logs COUPON_GRANTED against the user', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-coupon-1',
        name: 'على البالي',
        email: 'ali@example.com',
      });

      await service.grantCoupon(
        'user-coupon-1',
        { couponCode: 'LAUNCHPROMO26', couponName: 'Byoutna10' },
        'admin-1',
      );

      expect(auditLog.log).toHaveBeenCalledWith({
        actorAdminId: 'admin-1',
        action: 'COUPON_GRANTED',
        targetType: 'COUPON',
        targetUserId: 'user-coupon-1',
        metadata: { couponCode: 'LAUNCHPROMO26', couponName: 'Byoutna10' },
      });
    });
  });

  describe('grantBulkCoupon', () => {
    it('should throw BadRequestException if userIds is empty', async () => {
      await expect(
        service.grantBulkCoupon({
          userIds: [],
          couponCode: 'LAUNCHPROMO26',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should grant coupon to multiple users and return summary', async () => {
      prisma.user.findMany.mockResolvedValue([
        { id: 'u1', name: 'محمد الجارح', email: 'm1@example.com' },
        { id: 'u2', name: 'أحمد علي', email: 'm2@example.com' },
      ]);

      const res = await service.grantBulkCoupon({
        userIds: ['u1', 'u2', 'missing-user'],
        couponCode: 'LAUNCHPROMO26',
        couponName: 'Byoutna10',
        notifyEmail: true,
      });

      expect(res.grantedCount).toBe(2);
      expect(res.message).toBe('تم اضافة كوبون خصم لـ 2 مستخدمين بنجاح.');
      expect(res.grantedUserIds).toEqual(['u1', 'u2']);
      expect(res.failedUserIds).toEqual(['missing-user']);
    });

    it('logs COUPON_BULK_GRANTED once per successfully granted user', async () => {
      prisma.user.findMany.mockResolvedValue([
        { id: 'u1', name: 'محمد الجارح', email: 'm1@example.com' },
        { id: 'u2', name: 'أحمد علي', email: 'm2@example.com' },
      ]);

      await service.grantBulkCoupon(
        {
          userIds: ['u1', 'u2', 'missing-user'],
          couponCode: 'LAUNCHPROMO26',
        },
        'admin-1',
      );

      expect(auditLog.log).toHaveBeenCalledTimes(2);
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'COUPON_BULK_GRANTED',
          targetUserId: 'u1',
        }),
      );
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'COUPON_BULK_GRANTED',
          targetUserId: 'u2',
        }),
      );
    });
  });
});
