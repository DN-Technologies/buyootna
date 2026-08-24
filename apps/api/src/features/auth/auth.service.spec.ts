import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { TwilioService } from 'src/core/twilio/twilio.service';
import { UsersRegistrationService } from '../users/services/users-registration.service';
import { EmailOtpService } from 'src/core/email-otp/email-otp.service';
import { SocialProvider, IdentityType, type User } from '@prisma/client';
import {
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

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

interface UserUpdateArgs {
  where: { id: string };
  data: { password: string };
}

describe('AuthService Unit Tests', () => {
  let service: AuthService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    identity: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
    socialAccount: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    otpCode: {
      delete: jest.fn(),
    },
    session: {
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
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
  };

  const mockEmailOtpService = {
    getMockOtp: jest.fn(),
  };

  const mockTwilioService = {
    sendVerification: jest.fn(),
    checkVerification: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrismaService.$transaction.mockImplementation(
      (arg: ((tx: Tx) => unknown) | Promise<unknown>[]) =>
        Array.isArray(arg) ? Promise.all(arg) : arg(buildTx()),
    );
    mockPrismaService.identity.findMany.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: TwilioService, useValue: mockTwilioService },
        {
          provide: UsersRegistrationService,
          useValue: mockUsersRegistrationService,
        },
        { provide: EmailOtpService, useValue: mockEmailOtpService },
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

  describe('validateUser', () => {
    const storedHash = bcrypt.hashSync('correct-password', 10);
    const dbUser = {
      id: 'user-1',
      email: 'a@example.com',
      phone: null,
      password: storedHash,
      isDisabled: false,
    };

    it('returns the user without the password when identifier and password match', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(dbUser);

      const result = await service.validateUser(
        'a@example.com',
        'correct-password',
      );

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { OR: [{ email: 'a@example.com' }, { phone: 'a@example.com' }] },
      });
      expect(result).not.toHaveProperty('password');
      expect(result).toMatchObject({ id: 'user-1' });
    });

    it('throws UnauthorizedException when no user matches the identifier', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.validateUser('missing@example.com', 'whatever'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when the account is disabled, without checking the password', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({
        ...dbUser,
        isDisabled: true,
      });

      await expect(
        service.validateUser('a@example.com', 'correct-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when the password does not match', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(dbUser);

      await expect(
        service.validateUser('a@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    const user = { id: 'user-1', email: 'a@example.com' } as unknown as Omit<
      User,
      'password'
    >;
    const buildIdentity = (overrides: Record<string, unknown> = {}) => ({
      id: 'identity-1',
      userId: 'user-1',
      type: IdentityType.INDIVIDUAL,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      ...overrides,
    });

    it('uses the specified identityId, scoped to id + userId', async () => {
      const identity = buildIdentity({ id: 'identity-2' });
      mockPrismaService.identity.findFirst.mockResolvedValue(identity);

      const result = await service.login(user, 'identity-2');

      expect(mockPrismaService.identity.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'identity-2', userId: 'user-1' },
        }),
      );
      expect(result.activeIdentity).toBe(identity);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        ident: 'identity-2',
        type: IdentityType.INDIVIDUAL,
      });
    });

    it('falls back to the currently active identity when no identityId is provided', async () => {
      const activeIdentity = buildIdentity({ isActive: true });
      mockPrismaService.identity.findFirst.mockResolvedValueOnce(
        activeIdentity,
      );

      const result = await service.login(user);

      expect(mockPrismaService.identity.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1', isActive: true },
        }),
      );
      expect(result.activeIdentity).toBe(activeIdentity);
    });

    it('auto-promotes the earliest-created identity to active when none is currently active', async () => {
      const fallbackIdentity = buildIdentity({
        id: 'identity-3',
        isActive: false,
      });
      mockPrismaService.identity.findFirst
        .mockResolvedValueOnce(null) // no active identity
        .mockResolvedValueOnce(fallbackIdentity); // earliest-created fallback

      const result = await service.login(user);

      expect(mockPrismaService.identity.update).toHaveBeenCalledWith({
        where: { id: 'identity-3' },
        data: { isActive: true },
      });
      expect(result.activeIdentity.isActive).toBe(true);
    });

    it('throws BadRequestException when the user has no identities at all', async () => {
      mockPrismaService.identity.findFirst
        .mockResolvedValueOnce(null) // no active identity
        .mockResolvedValueOnce(null); // no identities at all

      await expect(service.login(user)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.identity.update).not.toHaveBeenCalled();
    });

    it('returns the signed access_token, user, activeIdentity, and full identities list', async () => {
      const identity = buildIdentity();
      const allIdentities = [identity];
      mockPrismaService.identity.findFirst.mockResolvedValue(identity);
      mockPrismaService.identity.findMany.mockResolvedValue(allIdentities);

      const result = await service.login(user, 'identity-1');

      expect(result).toEqual({
        access_token: 'mocked_token',
        user,
        activeIdentity: identity,
        identities: allIdentities,
      });
    });
  });

  describe('switchIdentity', () => {
    const identity = {
      id: 'identity-2',
      userId: 'user-1',
      type: IdentityType.COMPANY,
      isActive: false,
      createdAt: new Date('2024-01-01'),
    };

    it('throws ForbiddenException when the identity does not belong to the user', async () => {
      mockPrismaService.identity.findFirst.mockResolvedValue(null);

      await expect(
        service.switchIdentity('user-1', 'identity-2'),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('deactivates all identities then activates the selected one, and returns a fresh JWT', async () => {
      mockPrismaService.identity.findFirst.mockResolvedValue(identity);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'a@example.com',
        password: 'hashed',
      });
      mockPrismaService.identity.updateMany.mockResolvedValue({ count: 2 });
      mockPrismaService.identity.update.mockResolvedValue({
        ...identity,
        isActive: true,
      });
      mockPrismaService.identity.findMany.mockResolvedValue([
        { id: 'identity-1', isActive: false },
        { id: 'identity-2', isActive: true },
      ]);

      const result = await service.switchIdentity('user-1', 'identity-2');

      expect(mockPrismaService.identity.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { isActive: false },
      });
      expect(mockPrismaService.identity.update).toHaveBeenCalledWith({
        where: { id: 'identity-2' },
        data: { isActive: true },
      });
      expect(result.activeIdentity).toMatchObject({ isActive: true });
      expect(result.identities).toEqual([
        { id: 'identity-1', isActive: false },
        { id: 'identity-2', isActive: true },
      ]);
      expect(result.user).not.toHaveProperty('password');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        ident: 'identity-2',
        type: IdentityType.COMPANY,
      });
    });

    it('throws UnauthorizedException if the user disappears before the post-switch refetch', async () => {
      mockPrismaService.identity.findFirst.mockResolvedValue(identity);
      mockPrismaService.identity.updateMany.mockResolvedValue({ count: 2 });
      mockPrismaService.identity.update.mockResolvedValue({
        ...identity,
        isActive: true,
      });
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.switchIdentity('user-1', 'identity-2'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyRegistrationOtp', () => {
    it('throws BadRequestException when the phone is not registered', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.verifyRegistrationOtp('+96555123456', '123456'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when the OTP is invalid or expired', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        phone: '+96555123456',
        password: 'hashed',
      });
      mockTwilioService.checkVerification.mockResolvedValue(false);

      await expect(
        service.verifyRegistrationOtp('+96555123456', '000000'),
      ).rejects.toThrow(BadRequestException);
    });

    it('logs the user in on a valid OTP', async () => {
      const dbUser = {
        id: 'user-1',
        phone: '+96555123456',
        password: 'hashed',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(dbUser);
      mockTwilioService.checkVerification.mockResolvedValue(true);
      const loginSpy = jest
        .spyOn(service, 'login')
        .mockResolvedValue(MOCK_LOGIN_RESULT);

      const result = await service.verifyRegistrationOtp(
        '+96555123456',
        '123456',
      );

      expect(result).toBe(MOCK_LOGIN_RESULT);
      expect(loginSpy).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user-1' }),
      );
      const loginArg = loginSpy.mock.calls[0][0];
      expect(loginArg).not.toHaveProperty('password');
    });
  });

  describe('verifyEmailRegistrationOtp', () => {
    it('creates the account via UsersRegistrationService then logs the user in', async () => {
      const createdUser = { id: 'user-2', email: 'ali@example.com' };
      mockUsersRegistrationService.completeEmailRegistration.mockResolvedValue(
        { user: createdUser, profile: { id: 'profile-1' } },
      );
      const loginSpy = jest
        .spyOn(service, 'login')
        .mockResolvedValue(MOCK_LOGIN_RESULT);

      const result = await service.verifyEmailRegistrationOtp(
        'ali@example.com',
        '123456',
      );

      expect(
        mockUsersRegistrationService.completeEmailRegistration,
      ).toHaveBeenCalledWith('ali@example.com', '123456');
      expect(loginSpy).toHaveBeenCalledWith(createdUser);
      expect(result).toBe(MOCK_LOGIN_RESULT);
    });

    it('propagates BadRequestException from an invalid OTP without logging in', async () => {
      mockUsersRegistrationService.completeEmailRegistration.mockRejectedValue(
        new BadRequestException('رمز التحقق غير صحيح أو منتهي الصلاحية'),
      );
      const loginSpy = jest.spyOn(service, 'login');

      await expect(
        service.verifyEmailRegistrationOtp('ali@example.com', '000000'),
      ).rejects.toThrow(BadRequestException);
      expect(loginSpy).not.toHaveBeenCalled();
    });
  });

  describe('getMockEmailOtp', () => {
    it('delegates to EmailOtpService.getMockOtp', () => {
      mockEmailOtpService.getMockOtp.mockReturnValue('123456');

      const result = service.getMockEmailOtp('ali@example.com');

      expect(result).toBe('123456');
      expect(mockEmailOtpService.getMockOtp).toHaveBeenCalledWith(
        'ali@example.com',
      );
    });
  });

  describe('requestChangePasswordOtp', () => {
    it('throws BadRequestException when the user has no phone on file', async () => {
      await expect(
        service.requestChangePasswordOtp({
          phone: null,
        } as unknown as User),
      ).rejects.toThrow(BadRequestException);
    });

    it('sends a verification OTP and returns a success message', async () => {
      mockTwilioService.sendVerification.mockResolvedValue({ success: true });

      const result = await service.requestChangePasswordOtp({
        phone: '+96555123456',
      } as unknown as User);

      expect(mockTwilioService.sendVerification).toHaveBeenCalledWith(
        '+96555123456',
      );
      expect(result).toEqual({ message: 'تم إرسال رمز التحقق بنجاح' });
    });
  });

  describe('changePassword', () => {
    const storedHash = bcrypt.hashSync('old-password', 10);
    const dbUser = {
      id: 'user-1',
      phone: '+96555123456',
      password: storedHash,
    };

    it('throws BadRequestException when the user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.changePassword(
          'user-1',
          'old-password',
          'new-password',
          '123456',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when the user has no phone on file', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...dbUser,
        phone: null,
      });

      await expect(
        service.changePassword(
          'user-1',
          'old-password',
          'new-password',
          '123456',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when the OTP is invalid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(dbUser);
      mockTwilioService.checkVerification.mockResolvedValue(false);

      await expect(
        service.changePassword(
          'user-1',
          'old-password',
          'new-password',
          '000000',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when the old password does not match', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(dbUser);
      mockTwilioService.checkVerification.mockResolvedValue(true);

      await expect(
        service.changePassword(
          'user-1',
          'wrong-old-password',
          'new-password',
          '123456',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    // Documents current (likely buggy) behavior: nothing in the individual
    // registration/verify-otp flow ever creates an OtpCode row, so a typical
    // individual user hits this unconditional delete with no matching row.
    // This is not asserted as "correct" — it's a pinned regression guard
    // flagging a real gap worth a follow-up fix.
    it('propagates the error when no OtpCode row exists for the user (documents current behavior)', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(dbUser);
      mockTwilioService.checkVerification.mockResolvedValue(true);
      const notFoundError = new Error('Record to delete does not exist.');
      mockPrismaService.otpCode.delete.mockRejectedValue(notFoundError);

      await expect(
        service.changePassword(
          'user-1',
          'old-password',
          'new-password',
          '123456',
        ),
      ).rejects.toThrow(notFoundError);
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('hashes and persists the new password on success', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(dbUser);
      mockTwilioService.checkVerification.mockResolvedValue(true);
      mockPrismaService.otpCode.delete.mockResolvedValue({ id: 'otp-1' });
      mockPrismaService.user.update.mockResolvedValue({
        ...dbUser,
        password: 'new-hash',
      });

      const result = await service.changePassword(
        'user-1',
        'old-password',
        'new-password',
        '123456',
      );

      expect(mockPrismaService.user.update).toHaveBeenCalledTimes(1);
      const updateCalls = mockPrismaService.user.update.mock
        .calls as UserUpdateArgs[][];
      const updateArgs = updateCalls[0][0];
      expect(updateArgs.where).toEqual({ id: 'user-1' });
      expect(updateArgs.data.password).not.toBe('new-password');
      expect(bcrypt.compareSync('new-password', updateArgs.data.password)).toBe(
        true,
      );
      expect(result).toEqual({ message: 'تم تغيير كلمة المرور بنجاح' });
    });

    it('deletes all other sessions except the most recently active one when logoutAllDevices is true', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(dbUser);
      mockTwilioService.checkVerification.mockResolvedValue(true);
      mockPrismaService.otpCode.delete.mockResolvedValue({ id: 'otp-1' });
      mockPrismaService.user.update.mockResolvedValue(dbUser);
      mockPrismaService.session.findFirst.mockResolvedValue({
        id: 'session-latest',
      });

      await service.changePassword(
        'user-1',
        'old-password',
        'new-password',
        '123456',
        true,
      );

      expect(mockPrismaService.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', id: { not: 'session-latest' } },
      });
    });

    it('skips session deletion when logoutAllDevices is true but no active session exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(dbUser);
      mockTwilioService.checkVerification.mockResolvedValue(true);
      mockPrismaService.otpCode.delete.mockResolvedValue({ id: 'otp-1' });
      mockPrismaService.user.update.mockResolvedValue(dbUser);
      mockPrismaService.session.findFirst.mockResolvedValue(null);

      await service.changePassword(
        'user-1',
        'old-password',
        'new-password',
        '123456',
        true,
      );

      expect(mockPrismaService.session.deleteMany).not.toHaveBeenCalled();
    });

    it('never queries sessions when logoutAllDevices is falsy or omitted', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(dbUser);
      mockTwilioService.checkVerification.mockResolvedValue(true);
      mockPrismaService.otpCode.delete.mockResolvedValue({ id: 'otp-1' });
      mockPrismaService.user.update.mockResolvedValue(dbUser);

      await service.changePassword(
        'user-1',
        'old-password',
        'new-password',
        '123456',
      );

      expect(mockPrismaService.session.findFirst).not.toHaveBeenCalled();
      expect(mockPrismaService.session.deleteMany).not.toHaveBeenCalled();
    });
  });
});
