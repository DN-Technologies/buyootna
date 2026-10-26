import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { RecoveryService } from './recovery.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { TwilioService } from '../../core/twilio/twilio.service';
import { EmailOtpService } from '../../core/email-otp/email-otp.service';
import { OtpRateLimiterService } from '../../core/otp-rate-limiter/otp-rate-limiter.service';

describe('RecoveryService', () => {
  let service: RecoveryService;
  let prisma: { user: { findFirst: jest.Mock } };
  let twilioService: {
    sendVerification: jest.Mock;
    checkVerification: jest.Mock;
  };
  let emailOtpService: {
    sendPasswordResetOtp: jest.Mock;
    verifyPasswordResetOtp: jest.Mock;
  };
  let jwtService: { sign: jest.Mock };

  const emailUser = {
    id: 'user-email-1',
    email: 'jane@example.com',
    phone: null,
    name: 'Jane',
  };
  const phoneUser = {
    id: 'user-phone-1',
    email: null,
    phone: '+96599998888',
    name: 'Sam',
  };

  beforeEach(async () => {
    prisma = { user: { findFirst: jest.fn() } };
    twilioService = {
      sendVerification: jest.fn().mockResolvedValue({ success: true }),
      checkVerification: jest.fn(),
    };
    emailOtpService = {
      sendPasswordResetOtp: jest.fn().mockResolvedValue(undefined),
      verifyPasswordResetOtp: jest.fn(),
    };
    jwtService = { sign: jest.fn().mockReturnValue('signed-reset-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecoveryService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: TwilioService, useValue: twilioService },
        { provide: EmailOtpService, useValue: emailOtpService },
        {
          provide: OtpRateLimiterService,
          useValue: {
            checkRequestLimit: jest.fn(),
            checkVerifyLimit: jest.fn(),
            recordRequest: jest.fn(),
            recordVerifyAttempt: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RecoveryService>(RecoveryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('requestOtp', () => {
    it('sends an email OTP for an email-only account (the reported bug: this previously sent nothing)', async () => {
      prisma.user.findFirst.mockResolvedValue(emailUser);

      const result = await service.requestOtp({
        identifier: 'jane@example.com',
      });

      expect(emailOtpService.sendPasswordResetOtp).toHaveBeenCalledWith(
        'jane@example.com',
        'Jane',
      );
      expect(twilioService.sendVerification).not.toHaveBeenCalled();
      expect(result.message).toBe('تم إرسال رمز التحقق بنجاح');
    });

    it('sends an SMS OTP for a phone-only account', async () => {
      prisma.user.findFirst.mockResolvedValue(phoneUser);

      await service.requestOtp({ identifier: '+96599998888' });

      expect(twilioService.sendVerification).toHaveBeenCalledWith(
        '+96599998888',
        'RECOVERY',
      );
      expect(emailOtpService.sendPasswordResetOtp).not.toHaveBeenCalled();
    });

    it('does not reveal account existence when no user matches', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      const result = await service.requestOtp({
        identifier: 'nobody@example.com',
      });

      expect(emailOtpService.sendPasswordResetOtp).not.toHaveBeenCalled();
      expect(twilioService.sendVerification).not.toHaveBeenCalled();
      expect(result.message).toBe(
        'إذا كان الحساب موجوداً، فسيتم إرسال رمز التحقق',
      );
    });

    it('rejects an identifier that is neither a valid email nor phone', async () => {
      await expect(
        service.requestOtp({ identifier: 'not-an-identifier' }),
      ).rejects.toThrow('يجب إدخال بريد إلكتروني أو رقم هاتف صالح');
    });

    it('translates a Twilio send failure into a handled error instead of a raw 500', async () => {
      prisma.user.findFirst.mockResolvedValue(phoneUser);
      twilioService.sendVerification.mockRejectedValueOnce(
        new Error('Twilio: number is not verified'),
      );

      await expect(
        service.requestOtp({ identifier: '+96599998888' }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('translates an email send failure into a handled error instead of a raw 500', async () => {
      prisma.user.findFirst.mockResolvedValue(emailUser);
      emailOtpService.sendPasswordResetOtp.mockRejectedValueOnce(
        new Error('SMTP unavailable'),
      );

      await expect(
        service.requestOtp({ identifier: 'jane@example.com' }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('verifyOtp', () => {
    it('verifies an email OTP for an email-only account and issues a reset token', async () => {
      prisma.user.findFirst.mockResolvedValue(emailUser);
      emailOtpService.verifyPasswordResetOtp.mockReturnValue(true);

      const result = await service.verifyOtp({
        identifier: 'jane@example.com',
        otp: '123456',
      });

      expect(emailOtpService.verifyPasswordResetOtp).toHaveBeenCalledWith(
        'jane@example.com',
        '123456',
      );
      expect(twilioService.checkVerification).not.toHaveBeenCalled();
      expect(result.resetToken).toBe('signed-reset-token');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: emailUser.id,
        purpose: 'password_reset',
      });
    });

    it('verifies a phone OTP for a phone-only account', async () => {
      prisma.user.findFirst.mockResolvedValue(phoneUser);
      twilioService.checkVerification.mockResolvedValue(true);

      const result = await service.verifyOtp({
        identifier: '+96599998888',
        otp: '654321',
      });

      expect(twilioService.checkVerification).toHaveBeenCalledWith(
        '+96599998888',
        '654321',
      );
      expect(emailOtpService.verifyPasswordResetOtp).not.toHaveBeenCalled();
      expect(result.resetToken).toBe('signed-reset-token');
    });

    it('rejects an incorrect email OTP', async () => {
      prisma.user.findFirst.mockResolvedValue(emailUser);
      emailOtpService.verifyPasswordResetOtp.mockReturnValue(false);

      await expect(
        service.verifyOtp({ identifier: 'jane@example.com', otp: '000000' }),
      ).rejects.toThrow('رمز التحقق غير صحيح أو منتهي الصلاحية');
    });

    it('rejects when no user matches the identifier', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.verifyOtp({ identifier: 'nobody@example.com', otp: '123456' }),
      ).rejects.toThrow('البيانات غير صحيحة');
    });
  });
});
