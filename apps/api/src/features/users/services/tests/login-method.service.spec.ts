import { BadRequestException, ConflictException } from '@nestjs/common';
import { OtpRateLimiterService } from '../../../../core/otp-rate-limiter/otp-rate-limiter.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { TwilioService } from '../../../../core/twilio/twilio.service';
import {
  LoginMethodService,
  PHONE_NOT_VERIFIED_MESSAGE,
} from '../login-method.service';

describe('LoginMethodService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };
  const twilio = {
    sendVerification: jest.fn().mockResolvedValue({ success: true }),
    checkVerification: jest.fn(),
    formatPhoneNumber: jest.fn((p: string) => `+965${p.slice(-8)}`),
  };
  const rateLimiter = {
    recordRequest: jest.fn(),
    recordVerifyAttempt: jest.fn(),
  };
  const service = new LoginMethodService(
    prisma as unknown as PrismaService,
    twilio as unknown as TwilioService,
    rateLimiter as unknown as OtpRateLimiterService,
  );

  const user = (over: Record<string, unknown> = {}) => ({
    id: 'u1',
    email: 'salem@mail.com',
    phone: '99998888',
    phoneVerifiedAt: new Date(),
    loginMethod: null,
    ...over,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.update.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) => ({ ...user(), ...data }),
    );
    prisma.user.findFirst.mockResolvedValue(null);
  });

  it('reports BOTH for an account that never chose', async () => {
    prisma.user.findUnique.mockResolvedValue(user());
    await expect(service.get('u1')).resolves.toMatchObject({
      loginMethod: 'BOTH',
      phoneVerified: true,
    });
  });

  it.each([
    ['EMAIL', 'EMAIL'],
    ['PHONE', 'PHONE'],
    ['BOTH', null],
  ] as const)('saves %s', async (method, stored) => {
    prisma.user.findUnique.mockResolvedValue(user());

    const result = await service.set('u1', method);

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { loginMethod: stored } }),
    );
    expect(result.message).toBe('تم تحديث طريقة تسجيل الدخول بنجاح.');
  });

  it('refuses PHONE while the phone is not verified, with the design message', async () => {
    prisma.user.findUnique.mockResolvedValue(user({ phoneVerifiedAt: null }));

    await expect(service.set('u1', 'PHONE')).rejects.toThrow(
      PHONE_NOT_VERIFIED_MESSAGE,
    );
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('refuses EMAIL for an account without an email', async () => {
    prisma.user.findUnique.mockResolvedValue(user({ email: null }));
    await expect(service.set('u1', 'EMAIL')).rejects.toThrow(
      BadRequestException,
    );
  });

  describe('phone verification', () => {
    it('texts the code to the new number', async () => {
      await expect(service.requestPhoneOtp('u1', '55556666')).resolves.toEqual({
        destination: '+965 •••• 66',
      });
      expect(twilio.sendVerification).toHaveBeenCalledWith('55556666');
    });

    it("refuses a number that is another account's, in any stored form", async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'u2' });

      await expect(
        service.requestPhoneOtp('u1', '55556666'),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          phone: {
            in: ['55556666', '55556666', '96555556666', '+96555556666'],
          },
          id: { not: 'u1' },
        },
        select: { id: true },
      });
      expect(twilio.sendVerification).not.toHaveBeenCalled();
    });

    it('refuses something that is not a Kuwaiti number', async () => {
      await expect(service.requestPhoneOtp('u1', '12')).rejects.toThrow(
        'رقم الهاتف غير صالح',
      );
    });

    it('a wrong code changes nothing', async () => {
      twilio.checkVerification.mockResolvedValue(false);

      await expect(
        service.verifyPhone('u1', '55556666', '000000'),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(rateLimiter.recordVerifyAttempt).toHaveBeenCalledWith('u1', false);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('the right code sets the number and marks it verified', async () => {
      twilio.checkVerification.mockResolvedValue(true);

      const result = await service.verifyPhone('u1', '55556666', '123456');

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            phone: '55556666',
            phoneVerifiedAt: expect.any(Date) as Date,
          },
        }),
      );
      expect(result.phoneVerified).toBe(true);
    });
  });
});
