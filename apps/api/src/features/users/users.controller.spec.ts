import { IdentityStatsService } from '../../core/trust-signals/identity-stats.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersRegistrationService } from './services/users-registration.service';
import { UsersProfileService } from './services/users-profile.service';
import { UsersDirectoryService } from './services/users-directory.service';
import { AccountSuspensionService } from './services/account-suspension.service';
import { LoginMethodService } from './services/login-method.service';
import { OtpRateLimiterService } from '../../core/otp-rate-limiter/otp-rate-limiter.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersRegistrationService,
          useValue: {},
        },
        {
          provide: UsersProfileService,
          useValue: {},
        },
        {
          provide: UsersDirectoryService,
          useValue: {},
        },
        {
          provide: AccountSuspensionService,
          useValue: {},
        },
        { provide: LoginMethodService, useValue: {} },
        { provide: IdentityStatsService, useValue: {} },
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

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
