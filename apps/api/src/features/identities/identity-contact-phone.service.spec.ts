import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OtpRateLimiterService } from '../../core/otp-rate-limiter/otp-rate-limiter.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TwilioService } from '../../core/twilio/twilio.service';
import { IdentityContactPhoneService } from './identity-contact-phone.service';

describe('IdentityContactPhoneService', () => {
  let prisma: { identity: { findFirst: jest.Mock; update: jest.Mock } };
  let twilio: {
    sendVerification: jest.Mock;
    checkVerification: jest.Mock;
    formatPhoneNumber: jest.Mock;
  };
  let rateLimiter: { recordRequest: jest.Mock; recordVerifyAttempt: jest.Mock };
  let service: IdentityContactPhoneService;

  const identity = (overrides: Record<string, unknown> = {}) => ({
    id: 'company-1',
    type: 'COMPANY',
    useAccountPhone: true,
    contactPhone: null,
    contactPhoneVerifiedAt: null,
    user: { phone: '99990000' },
    ...overrides,
  });

  beforeEach(() => {
    prisma = {
      identity: {
        findFirst: jest.fn().mockResolvedValue(identity()),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    twilio = {
      sendVerification: jest.fn().mockResolvedValue(undefined),
      checkVerification: jest.fn().mockResolvedValue(true),
      formatPhoneNumber: jest.fn((p: string) => `+965${p}`),
    };
    rateLimiter = { recordRequest: jest.fn(), recordVerifyAttempt: jest.fn() };
    service = new IdentityContactPhoneService(
      prisma as unknown as PrismaService,
      twilio as unknown as TwilioService,
      rateLimiter as unknown as OtpRateLimiterService,
    );
  });

  it('only touches a persona of the signed-in account', async () => {
    prisma.identity.findFirst.mockResolvedValue(null);

    await expect(service.get('user-1', 'someone-else')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.identity.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'someone-else', userId: 'user-1' },
      }),
    );
  });

  it("shows the account's phone as the contact number by default", async () => {
    expect(await service.get('user-1', 'company-1')).toMatchObject({
      useAccountPhone: true,
      accountPhone: '99990000',
      effectivePhone: '99990000',
    });
  });

  it('texts a code to the new number', async () => {
    await service.requestOtp('user-1', 'company-1', '55556666');

    expect(twilio.sendVerification).toHaveBeenCalledWith('55556666');
    expect(rateLimiter.recordRequest).toHaveBeenCalledWith('user-1');
  });

  it('refuses an invalid number', async () => {
    await expect(
      service.requestOtp('user-1', 'company-1', '12'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(twilio.sendVerification).not.toHaveBeenCalled();
  });

  it('switches the persona to its own number only with the right code', async () => {
    twilio.checkVerification.mockResolvedValue(false);
    await expect(
      service.verify('user-1', 'company-1', '55556666', '000000'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.identity.update).not.toHaveBeenCalled();

    twilio.checkVerification.mockResolvedValue(true);
    await service.verify('user-1', 'company-1', '55556666', '123456');

    expect(prisma.identity.update).toHaveBeenCalledWith({
      where: { id: 'company-1' },
      data: expect.objectContaining({
        contactPhone: '55556666',
        useAccountPhone: false,
        contactPhoneVerifiedAt: expect.any(Date),
      }),
    });
  });

  it("goes back to the account's phone with the checkbox", async () => {
    await service.setUseAccountPhone('user-1', 'company-1', true);

    expect(prisma.identity.update).toHaveBeenCalledWith({
      where: { id: 'company-1' },
      data: { useAccountPhone: true },
    });
  });

  it('refuses unticking the checkbox without a verified own number', async () => {
    await expect(
      service.setUseAccountPhone('user-1', 'company-1', false),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'CONTACT_PHONE_NOT_VERIFIED' }),
    });

    prisma.identity.findFirst.mockResolvedValue(
      identity({
        contactPhone: '55556666',
        contactPhoneVerifiedAt: new Date(),
      }),
    );
    await service.setUseAccountPhone('user-1', 'company-1', false);
    expect(prisma.identity.update).toHaveBeenCalledWith({
      where: { id: 'company-1' },
      data: { useAccountPhone: false },
    });
  });
});
