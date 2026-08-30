import { Test, TestingModule } from '@nestjs/testing';
import { RecoveryController } from './recovery.controller';
import { RecoveryService } from './recovery.service';
import { OtpRateLimiterService } from '../../core/otp-rate-limiter/otp-rate-limiter.service';

describe('RecoveryController', () => {
  let controller: RecoveryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecoveryController],
      providers: [
        {
          provide: RecoveryService,
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

    controller = module.get<RecoveryController>(RecoveryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
