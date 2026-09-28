import { BadRequestException } from '@nestjs/common';
import { EmailOtpService } from '../../../core/email-otp/email-otp.service';
import { OtpRateLimiterService } from '../../../core/otp-rate-limiter/otp-rate-limiter.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { TwilioService } from '../../../core/twilio/twilio.service';
import {
  AccountSuspensionService,
  maskEmail,
  maskPhone,
} from './account-suspension.service';

describe('AccountSuspensionService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn().mockReturnValue('user-op'),
    },
    accountSuspension: { create: jest.fn().mockReturnValue('suspension-op') },
    session: { deleteMany: jest.fn().mockReturnValue('sessions-op') },
    $transaction: jest.fn().mockResolvedValue([]),
  };
  const twilio = {
    sendVerification: jest.fn().mockResolvedValue({ success: true }),
    checkVerification: jest.fn(),
  };
  const emailOtp = {
    sendAccountSuspendOtp: jest.fn(),
    verifyAccountSuspendOtp: jest.fn(),
  };
  const rateLimiter = {
    recordRequest: jest.fn(),
    recordVerifyAttempt: jest.fn(),
  };

  const service = new AccountSuspensionService(
    prisma as unknown as PrismaService,
    twilio as unknown as TwilioService,
    emailOtp as unknown as EmailOtpService,
    rateLimiter as unknown as OtpRateLimiterService,
  );

  const phoneUser = {
    id: 'u1',
    name: 'Ali',
    phone: '+96599998888',
    email: null,
  };
  const emailUser = {
    id: 'u2',
    name: 'Sara',
    phone: null,
    email: 'sara.k@mail.com',
  };

  beforeEach(() => jest.clearAllMocks());

  describe('requestOtp', () => {
    it('texts the code to the phone and says where it went', async () => {
      prisma.user.findUnique.mockResolvedValue(phoneUser);

      await expect(service.requestOtp('u1')).resolves.toEqual({
        channel: 'phone',
        destination: '+965 •••• 88',
      });
      expect(twilio.sendVerification).toHaveBeenCalledWith('+96599998888');
      expect(emailOtp.sendAccountSuspendOtp).not.toHaveBeenCalled();
      expect(rateLimiter.recordRequest).toHaveBeenCalledWith('u1');
    });

    it('emails the code when there is no phone', async () => {
      prisma.user.findUnique.mockResolvedValue(emailUser);

      await expect(service.requestOtp('u2')).resolves.toEqual({
        channel: 'email',
        destination: 's•••@mail.com',
      });
      expect(emailOtp.sendAccountSuspendOtp).toHaveBeenCalledWith(
        'sara.k@mail.com',
        'Sara',
      );
      expect(rateLimiter.recordRequest).toHaveBeenCalledWith('u2');
    });

    it('refuses an account with neither', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...emailUser, email: null });

      await expect(service.requestOtp('u2')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('suspend', () => {
    const dto = {
      otp: '123456',
      reasons: ['temp_break', 'other'],
      note: ' سفر ',
    };

    it('does nothing with a wrong code', async () => {
      prisma.user.findUnique.mockResolvedValue(phoneUser);
      twilio.checkVerification.mockResolvedValue(false);

      await expect(service.suspend('u1', dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(rateLimiter.recordVerifyAttempt).toHaveBeenCalledWith('u1', false);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('suspends, records the reasons and signs out every device', async () => {
      prisma.user.findUnique.mockResolvedValue(phoneUser);
      twilio.checkVerification.mockResolvedValue(true);

      const result = await service.suspend('u1', dto);

      expect(twilio.checkVerification).toHaveBeenCalledWith(
        '+96599998888',
        '123456',
      );
      const [[update]] = prisma.user.update.mock.calls as [
        { data: { isDisabled: boolean; suspendedAt: Date } },
      ][];
      expect(update.data.isDisabled).toBe(true);
      expect(update.data.suspendedAt).toBeInstanceOf(Date);
      expect(prisma.accountSuspension.create).toHaveBeenCalledWith({
        data: { userId: 'u1', reasons: ['temp_break', 'other'], note: 'سفر' },
      });
      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
      });
      expect(prisma.$transaction).toHaveBeenCalledWith([
        'user-op',
        'suspension-op',
        'sessions-op',
      ]);
      expect(result.success).toBe(true);
    });

    it('checks an email code for an email-only account, and drops a note without "other"', async () => {
      prisma.user.findUnique.mockResolvedValue(emailUser);
      emailOtp.verifyAccountSuspendOtp.mockReturnValue(true);

      await service.suspend('u2', {
        otp: '654321',
        reasons: ['not_using'],
        note: 'x',
      });

      expect(emailOtp.verifyAccountSuspendOtp).toHaveBeenCalledWith(
        'sara.k@mail.com',
        '654321',
      );
      expect(prisma.accountSuspension.create).toHaveBeenCalledWith({
        data: { userId: 'u2', reasons: ['not_using'], note: null },
      });
    });
  });

  it('masks phones and emails', () => {
    expect(maskPhone('+965 9999 8888')).toBe('+965 •••• 88');
    expect(maskEmail('ali@gmail.com')).toBe('a•••@gmail.com');
  });
});
