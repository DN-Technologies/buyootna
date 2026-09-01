import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RecoveryController } from './recovery.controller';
import { RecoveryService } from './recovery.service';
import { EmailOtpService } from '../../core/email-otp/email-otp.service';
import { OtpRateLimiterService } from '../../core/otp-rate-limiter/otp-rate-limiter.service';

describe('RecoveryController', () => {
  let controller: RecoveryController;
  let emailOtpService: { getMockPasswordResetOtp: jest.Mock };

  beforeEach(async () => {
    emailOtpService = { getMockPasswordResetOtp: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecoveryController],
      providers: [
        {
          provide: RecoveryService,
          useValue: {},
        },
        {
          provide: EmailOtpService,
          useValue: emailOtpService,
        },
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

    controller = module.get<RecoveryController>(RecoveryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('debugEmailOtp', () => {
    it('returns the pending OTP when one exists', () => {
      emailOtpService.getMockPasswordResetOtp.mockReturnValue('123456');

      expect(controller.debugEmailOtp('jane@example.com')).toEqual({
        otp: '123456',
      });
    });

    it('404s when no pending OTP exists (or mail is not in mock mode)', () => {
      emailOtpService.getMockPasswordResetOtp.mockReturnValue(null);

      expect(() => controller.debugEmailOtp('jane@example.com')).toThrow(
        NotFoundException,
      );
    });
  });
});
