import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleAuthService } from './services/google-auth.service';
import { AppleAuthService } from './services/apple-auth.service';
import { OtpRateLimiterService } from '../../core/otp-rate-limiter/otp-rate-limiter.service';
import { SocialProvider } from '@prisma/client';
import type { RequestUser } from './strategies/jwt.strategy';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
    loginOrRegisterWithSocial: jest.fn(),
    verifyRegistrationOtp: jest.fn(),
    switchIdentity: jest.fn(),
    requestChangePasswordOtp: jest.fn(),
    changePassword: jest.fn(),
  };

  const mockGoogleAuthService = {
    verifyIdToken: jest.fn(),
  };

  const mockAppleAuthService = {
    verifyIdentityToken: jest.fn(),
  };

  const mockOtpRateLimiterService = {
    checkRequestLimit: jest.fn(),
    checkVerifyLimit: jest.fn(),
    recordRequest: jest.fn(),
    recordVerifyAttempt: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: GoogleAuthService, useValue: mockGoogleAuthService },
        { provide: AppleAuthService, useValue: mockAppleAuthService },
        { provide: OtpRateLimiterService, useValue: mockOtpRateLimiterService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Shared fake request for the endpoints that now extract device context
  // (X-Device-Id / X-Device-Platform headers, ip, user-agent) via @Req().
  function makeReq(overrides: Record<string, unknown> = {}) {
    return {
      headers: {
        'x-device-id': 'device-1',
        'x-device-platform': 'ios',
        'user-agent': 'test-agent',
      },
      ip: '127.0.0.1',
      ...overrides,
    } as unknown as Parameters<AuthController['login']>[0];
  }

  const expectedDeviceCtx = {
    deviceId: 'device-1',
    platform: 'ios',
    ip: '127.0.0.1',
    userAgent: 'test-agent',
  };

  it('login() delegates to authService.login with req.user and the extracted device context; credentials stay with the LocalStrategy', () => {
    const req = makeReq({ user: { id: 'user-1' } });
    mockAuthService.login.mockReturnValue('login-result');

    const result = controller.login(req, {
      identifier: 'a@example.com',
      password: 'secret1',
    });

    expect(mockAuthService.login).toHaveBeenCalledWith(
      req.user,
      undefined,
      expectedDeviceCtx,
      { identityType: undefined },
    );
    expect(result).toBe('login-result');
  });

  it('login() passes the persona picked on the login screen (identityType)', () => {
    const req = makeReq({ user: { id: 'user-1' } });

    controller.login(req, {
      identifier: 'a@example.com',
      password: 'secret1',
      identityType: 'COMPANY',
    });

    expect(mockAuthService.login).toHaveBeenCalledWith(
      req.user,
      undefined,
      expectedDeviceCtx,
      { identityType: 'COMPANY' },
    );
  });

  it('googleLogin() verifies the ID token then delegates to loginOrRegisterWithSocial with GOOGLE and the device context', async () => {
    const profile = { providerId: 'g-sub-1', email: 'a@example.com' };
    mockGoogleAuthService.verifyIdToken.mockResolvedValue(profile);
    mockAuthService.loginOrRegisterWithSocial.mockResolvedValue(
      'social-result',
    );

    const result = await controller.googleLogin(makeReq(), {
      idToken: 'raw-token',
    });

    expect(mockGoogleAuthService.verifyIdToken).toHaveBeenCalledWith(
      'raw-token',
    );
    expect(mockAuthService.loginOrRegisterWithSocial).toHaveBeenCalledWith(
      SocialProvider.GOOGLE,
      profile,
      expectedDeviceCtx,
    );
    expect(result).toBe('social-result');
  });

  it('appleLogin() verifies the identity token then delegates to loginOrRegisterWithSocial with APPLE and the device context', async () => {
    const profile = { providerId: 'apple-sub-1', email: 'a@example.com' };
    mockAppleAuthService.verifyIdentityToken.mockResolvedValue(profile);
    mockAuthService.loginOrRegisterWithSocial.mockResolvedValue(
      'social-result',
    );

    const result = await controller.appleLogin(makeReq(), {
      identityToken: 'raw-identity-token',
    });

    expect(mockAppleAuthService.verifyIdentityToken).toHaveBeenCalledWith(
      'raw-identity-token',
    );
    expect(mockAuthService.loginOrRegisterWithSocial).toHaveBeenCalledWith(
      SocialProvider.APPLE,
      profile,
      expectedDeviceCtx,
    );
    expect(result).toBe('social-result');
  });

  it('verifyRegisterOtp() delegates to authService.verifyRegistrationOtp with dto.phone, dto.otp and the device context', async () => {
    mockAuthService.verifyRegistrationOtp.mockResolvedValue('otp-result');

    const result = await controller.verifyRegisterOtp(makeReq(), {
      phone: '+96555123456',
      otp: '123456',
    });

    expect(mockAuthService.verifyRegistrationOtp).toHaveBeenCalledWith(
      '+96555123456',
      '123456',
      expectedDeviceCtx,
    );
    expect(result).toBe('otp-result');
  });

  it('switchIdentity() delegates to authService.switchIdentity with reqUser.userId, dto.identityId and reqUser.sessionId', async () => {
    const reqUser = { userId: 'user-1', sessionId: 'session-1' } as RequestUser;
    mockAuthService.switchIdentity.mockResolvedValue('switch-result');

    const result = await controller.switchIdentity(reqUser, {
      identityId: 'identity-2',
    });

    expect(mockAuthService.switchIdentity).toHaveBeenCalledWith(
      'user-1',
      'identity-2',
      'session-1',
    );
    expect(result).toBe('switch-result');
  });

  it('requestChangePasswordOtp() delegates to authService.requestChangePasswordOtp with reqUser.user', async () => {
    const reqUser = {
      user: { id: 'user-1', phone: '+96555123456' },
    } as unknown as RequestUser;
    mockAuthService.requestChangePasswordOtp.mockResolvedValue('otp-result');

    const result = await controller.requestChangePasswordOtp(reqUser, {
      oldPassword: 'current-pass',
    });

    expect(mockAuthService.requestChangePasswordOtp).toHaveBeenCalledWith(
      reqUser.user,
      'current-pass',
    );
    expect(result).toBe('otp-result');
  });

  it('changePassword() delegates to authService.changePassword with all args in the correct order, including reqUser.sessionId', async () => {
    const reqUser = { userId: 'user-1', sessionId: 'session-1' } as RequestUser;
    mockAuthService.changePassword.mockResolvedValue('change-result');

    const result = await controller.changePassword(reqUser, {
      oldPassword: 'old-pass',
      newPassword: 'new-pass',
      otp: '123456',
      logoutAllDevices: true,
    });

    expect(mockAuthService.changePassword).toHaveBeenCalledWith(
      'user-1',
      'old-pass',
      'new-pass',
      '123456',
      true,
      'session-1',
    );
    expect(result).toBe('change-result');
  });
});
