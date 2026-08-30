import { Test, TestingModule } from '@nestjs/testing';
import { RecoveryService } from './recovery.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { TwilioService } from '../../core/twilio/twilio.service';
import { OtpRateLimiterService } from '../../core/otp-rate-limiter/otp-rate-limiter.service';

describe('RecoveryService', () => {
  let service: RecoveryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecoveryService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: TwilioService,
          useValue: {},
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

    service = module.get<RecoveryService>(RecoveryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
