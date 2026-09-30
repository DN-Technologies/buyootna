import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { AuthCredentialsService } from '../services/auth-credentials.service';
import { AuthSessionService } from '../services/auth-session.service';
import { AuthRegistrationService } from '../services/auth-registration.service';
import { AuthPasswordService } from '../services/auth-password.service';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { TwilioService } from 'src/core/twilio/twilio.service';
import { UsersRegistrationService } from '../../users/services/users-registration.service';
import { EmailOtpService } from 'src/core/email-otp/email-otp.service';
import { PhoneRegistrationPendingService } from 'src/core/phone-registration/phone-registration-pending.service';
import { OtpRateLimiterService } from 'src/core/otp-rate-limiter/otp-rate-limiter.service';
import { AuthIdentitiesService } from '../services/auth-identities.service';
import { LoginAlertService } from '../../devices/login-alert.service';
import { SessionsService } from '../../devices/sessions.service';
import { AccountStateService } from '../../users/services/account-state.service';
import { SocialProvider } from '@prisma/client';

export const buildTx = () => ({
  user: {
    create: jest.fn().mockResolvedValue({
      id: 'new-user-1',
      email: 'social@example.com',
      phone: null,
      password: 'hashed',
    }),
  },
  individualProfile: {
    create: jest.fn().mockResolvedValue({ id: 'profile-1' }),
  },
  identity: {
    create: jest.fn().mockResolvedValue({ id: 'identity-1' }),
  },
  socialAccount: {
    create: jest.fn().mockResolvedValue({ id: 'social-1' }),
  },
});

export type Tx = ReturnType<typeof buildTx>;
export type LoginResult = Awaited<ReturnType<AuthService['login']>>;
export const MOCK_LOGIN_RESULT = {
  access_token: 'mocked_token',
} as unknown as LoginResult;

export interface SocialAccountCreateArgs {
  data: {
    userId: string;
    provider: SocialProvider;
    providerId: string;
    email?: string;
  };
}

export interface IdentityCreateArgs {
  data: {
    userId: string;
    isActive: boolean;
  };
}

export interface UserUpdateArgs {
  where: { id: string };
  data: { password: string; passwordChangedAt?: Date };
}

export interface AuthTestContext {
  service: AuthService;
  // The registration/social suites assert "ends in login" by spying on the
  // session service directly -- since the modularization, the registration
  // paths call AuthSessionService.login, not a facade method.
  sessionService: AuthSessionService;
  prisma: {
    user: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    identity: {
      updateMany: jest.Mock;
      update: jest.Mock;
    };
    socialAccount: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  jwt: {
    sign: jest.Mock;
  };
  twilio: {
    sendVerification: jest.Mock;
    checkVerification: jest.Mock;
  };
  usersRegistration: {
    completeEmailRegistration: jest.Mock;
    completePhoneRegistration: jest.Mock;
  };
  emailOtp: {
    getMockOtp: jest.Mock;
  };
  phoneRegistrationPending: {
    save: jest.Mock;
    hasPending: jest.Mock;
    consume: jest.Mock;
  };
  otpRateLimiter: {
    checkRequestLimit: jest.Mock;
    checkVerifyLimit: jest.Mock;
    recordRequest: jest.Mock;
    recordVerifyAttempt: jest.Mock;
  };
  identities: {
    findById: jest.Mock;
    findActive: jest.Mock;
    findEarliest: jest.Mock;
    findForDevice: jest.Mock;
    markLastUsed: jest.Mock;
    listAll: jest.Mock;
    createDefaultForOrphanedUser: jest.Mock;
  };
  sessions: {
    upsertSession: jest.Mock;
    deleteAllExceptCurrent: jest.Mock;
    touchLastActive: jest.Mock;
    setActiveIdentity: jest.Mock;
  };
  loginAlerts: { notifyNewDeviceLogin: jest.Mock };
  setup: () => Promise<void>;
}

export function createAuthTestContext(): AuthTestContext {
  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    identity: {
      updateMany: jest.fn(),
      update: jest.fn(),
    },
    socialAccount: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((arg: ((tx: Tx) => unknown) | Promise<unknown>[]) =>
      Array.isArray(arg) ? Promise.all(arg) : arg(buildTx()),
    ),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked_token'),
  };

  const mockUsersRegistrationService = {
    completeEmailRegistration: jest.fn(),
    completePhoneRegistration: jest.fn(),
  };

  const mockEmailOtpService = {
    getMockOtp: jest.fn(),
  };

  const mockPhoneRegistrationPendingService = {
    save: jest.fn(),
    hasPending: jest.fn(),
    consume: jest.fn(),
  };

  const mockTwilioService = {
    sendVerification: jest.fn(),
    checkVerification: jest.fn(),
  };

  const mockOtpRateLimiterService = {
    checkRequestLimit: jest.fn(),
    checkVerifyLimit: jest.fn(),
    recordRequest: jest.fn(),
    recordVerifyAttempt: jest.fn(),
  };

  const mockIdentitiesService = {
    findById: jest.fn(),
    findActive: jest.fn(),
    findEarliest: jest.fn(),
    // No persona remembered for the device unless a test says so
    findForDevice: jest.fn().mockResolvedValue(null),
    markLastUsed: jest.fn(),
    listAll: jest.fn().mockResolvedValue([]),
    createDefaultForOrphanedUser: jest.fn(),
  };

  const mockLoginAlertService = { notifyNewDeviceLogin: jest.fn() };

  const mockSessionsService = {
    upsertSession: jest.fn().mockResolvedValue({ id: 'session-1' }),
    deleteAllExceptCurrent: jest.fn(),
    touchLastActive: jest.fn(),
    setActiveIdentity: jest.fn(),
  };

  const context: AuthTestContext = {
    service: null as unknown as AuthService,
    sessionService: null as unknown as AuthSessionService,
    prisma: mockPrismaService,
    jwt: mockJwtService,
    twilio: mockTwilioService,
    usersRegistration: mockUsersRegistrationService,
    emailOtp: mockEmailOtpService,
    phoneRegistrationPending: mockPhoneRegistrationPendingService,
    otpRateLimiter: mockOtpRateLimiterService,
    identities: mockIdentitiesService,
    sessions: mockSessionsService,
    loginAlerts: mockLoginAlertService,
    setup: async () => {
      jest.clearAllMocks();
      mockPrismaService.$transaction.mockImplementation(
        (arg: ((tx: Tx) => unknown) | Promise<unknown>[]) =>
          Array.isArray(arg) ? Promise.all(arg) : arg(buildTx()),
      );
      mockIdentitiesService.listAll.mockResolvedValue([]);
      mockSessionsService.upsertSession.mockResolvedValue({ id: 'session-1' });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AuthCredentialsService,
          AuthSessionService,
          AuthRegistrationService,
          AuthPasswordService,
          AuthService,
          { provide: PrismaService, useValue: mockPrismaService },
          { provide: JwtService, useValue: mockJwtService },
          { provide: TwilioService, useValue: mockTwilioService },
          {
            provide: UsersRegistrationService,
            useValue: mockUsersRegistrationService,
          },
          { provide: EmailOtpService, useValue: mockEmailOtpService },
          {
            provide: PhoneRegistrationPendingService,
            useValue: mockPhoneRegistrationPendingService,
          },
          {
            provide: OtpRateLimiterService,
            useValue: mockOtpRateLimiterService,
          },
          { provide: AuthIdentitiesService, useValue: mockIdentitiesService },
          { provide: SessionsService, useValue: mockSessionsService },
          { provide: LoginAlertService, useValue: mockLoginAlertService },
          AccountStateService,
        ],
      }).compile();

      context.service = module.get<AuthService>(AuthService);
      context.sessionService =
        module.get<AuthSessionService>(AuthSessionService);
    },
  };

  return context;
}
