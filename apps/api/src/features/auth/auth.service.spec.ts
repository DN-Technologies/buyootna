import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { TwilioService } from 'src/core/twilio/twilio.service';
import { SocialProvider } from '@prisma/client';

const buildTx = () => ({
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

type Tx = ReturnType<typeof buildTx>;
type LoginResult = Awaited<ReturnType<AuthService['login']>>;
const MOCK_LOGIN_RESULT = {
  access_token: 'mocked_token',
} as unknown as LoginResult;

interface SocialAccountCreateArgs {
  data: {
    userId: string;
    provider: SocialProvider;
    providerId: string;
    email?: string;
  };
}

interface IdentityCreateArgs {
  data: {
    userId: string;
    isActive: boolean;
  };
}

describe('AuthService Unit Tests', () => {
  let service: AuthService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    socialAccount: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((cb: (tx: Tx) => unknown) => cb(buildTx())),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked_token'),
  };

  const mockTwilioService = {
    sendSms: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrismaService.$transaction.mockImplementation(
      (cb: (tx: Tx) => unknown) => cb(buildTx()),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: TwilioService, useValue: mockTwilioService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('loginOrRegisterWithSocial', () => {
    it('logs in directly when a SocialAccount link already exists', async () => {
      const existingUser = {
        id: 'user-1',
        email: 'a@example.com',
        password: 'hashed',
      };
      mockPrismaService.socialAccount.findUnique.mockResolvedValue({
        id: 'link-1',
        user: existingUser,
      });
      const loginSpy = jest
        .spyOn(service, 'login')
        .mockResolvedValue(MOCK_LOGIN_RESULT);

      const result = await service.loginOrRegisterWithSocial(
        SocialProvider.GOOGLE,
        {
          providerId: 'google-sub-1',
          email: 'a@example.com',
        },
      );

      expect(result).toBe(MOCK_LOGIN_RESULT);
      expect(loginSpy).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user-1' }),
      );
      expect(mockPrismaService.socialAccount.create).not.toHaveBeenCalled();
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('links an existing user found by email when no SocialAccount link exists yet', async () => {
      mockPrismaService.socialAccount.findUnique.mockResolvedValue(null);
      const existingUser = {
        id: 'user-2',
        email: 'b@example.com',
        password: 'hashed',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      const loginSpy = jest
        .spyOn(service, 'login')
        .mockResolvedValue(MOCK_LOGIN_RESULT);

      const result = await service.loginOrRegisterWithSocial(
        SocialProvider.APPLE,
        {
          providerId: 'apple-sub-1',
          email: 'b@example.com',
        },
      );

      expect(result).toBe(MOCK_LOGIN_RESULT);
      expect(mockPrismaService.socialAccount.create).toHaveBeenCalledTimes(1);
      const socialAccountCreateCalls = mockPrismaService.socialAccount.create
        .mock.calls as SocialAccountCreateArgs[][];
      const createArgs = socialAccountCreateCalls[0][0];
      expect(createArgs.data).toMatchObject({
        userId: 'user-2',
        provider: SocialProvider.APPLE,
        providerId: 'apple-sub-1',
      });
      expect(loginSpy).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user-2' }),
      );
    });

    it('creates a brand-new User + IndividualProfile + Identity + SocialAccount when nothing matches', async () => {
      mockPrismaService.socialAccount.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      const loginSpy = jest
        .spyOn(service, 'login')
        .mockResolvedValue(MOCK_LOGIN_RESULT);

      let tx: Tx | undefined;
      mockPrismaService.$transaction.mockImplementation(
        (cb: (tx: Tx) => unknown) => {
          tx = buildTx();
          return cb(tx);
        },
      );

      const result = await service.loginOrRegisterWithSocial(
        SocialProvider.GOOGLE,
        {
          providerId: 'google-sub-2',
          email: 'social@example.com',
        },
      );

      expect(result).toBe(MOCK_LOGIN_RESULT);
      expect(loginSpy).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'new-user-1' }),
      );
      // Regression guard for the earlier bug class: registration must create an Identity row,
      // not just a User, or /auth/login breaks immediately after signup.
      expect(tx!.user.create).toHaveBeenCalled();
      expect(tx!.individualProfile.create).toHaveBeenCalled();
      const identityCreateCalls = tx!.identity.create.mock
        .calls as IdentityCreateArgs[][];
      const identityArgs = identityCreateCalls[0][0];
      expect(identityArgs.data).toMatchObject({ isActive: true });
      const socialAccountCreateCalls = tx!.socialAccount.create.mock
        .calls as SocialAccountCreateArgs[][];
      const socialAccountArgs = socialAccountCreateCalls[0][0];
      expect(socialAccountArgs.data).toMatchObject({
        provider: SocialProvider.GOOGLE,
        providerId: 'google-sub-2',
      });
    });
  });
});
