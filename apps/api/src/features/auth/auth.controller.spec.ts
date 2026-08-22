import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleAuthService } from './services/google-auth.service';
import { AppleAuthService } from './services/apple-auth.service';
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

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: GoogleAuthService, useValue: mockGoogleAuthService },
        { provide: AppleAuthService, useValue: mockAppleAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('login() delegates to authService.login with req.user, ignoring the DTO body', () => {
    const req = { user: { id: 'user-1' } } as unknown as Parameters<
      AuthController['login']
    >[0];
    mockAuthService.login.mockReturnValue('login-result');

    const result = controller.login(req, {
      identifier: 'a@example.com',
      password: 'secret1',
    });

    expect(mockAuthService.login).toHaveBeenCalledWith(req.user);
    expect(result).toBe('login-result');
  });

  it('googleLogin() verifies the ID token then delegates to loginOrRegisterWithSocial with GOOGLE', async () => {
    const profile = { providerId: 'g-sub-1', email: 'a@example.com' };
    mockGoogleAuthService.verifyIdToken.mockResolvedValue(profile);
    mockAuthService.loginOrRegisterWithSocial.mockResolvedValue(
      'social-result',
    );

    const result = await controller.googleLogin({ idToken: 'raw-token' });

    expect(mockGoogleAuthService.verifyIdToken).toHaveBeenCalledWith(
      'raw-token',
    );
    expect(mockAuthService.loginOrRegisterWithSocial).toHaveBeenCalledWith(
      SocialProvider.GOOGLE,
      profile,
    );
    expect(result).toBe('social-result');
  });

  it('appleLogin() verifies the identity token then delegates to loginOrRegisterWithSocial with APPLE', async () => {
    const profile = { providerId: 'apple-sub-1', email: 'a@example.com' };
    mockAppleAuthService.verifyIdentityToken.mockResolvedValue(profile);
    mockAuthService.loginOrRegisterWithSocial.mockResolvedValue(
      'social-result',
    );

    const result = await controller.appleLogin({
      identityToken: 'raw-identity-token',
    });

    expect(mockAppleAuthService.verifyIdentityToken).toHaveBeenCalledWith(
      'raw-identity-token',
    );
    expect(mockAuthService.loginOrRegisterWithSocial).toHaveBeenCalledWith(
      SocialProvider.APPLE,
      profile,
    );
    expect(result).toBe('social-result');
  });

  it('verifyRegisterOtp() delegates to authService.verifyRegistrationOtp with dto.phone and dto.otp', async () => {
    mockAuthService.verifyRegistrationOtp.mockResolvedValue('otp-result');

    const result = await controller.verifyRegisterOtp({
      phone: '+96555123456',
      otp: '123456',
    });

    expect(mockAuthService.verifyRegistrationOtp).toHaveBeenCalledWith(
      '+96555123456',
      '123456',
    );
    expect(result).toBe('otp-result');
  });

  it('switchIdentity() delegates to authService.switchIdentity with reqUser.userId and dto.identityId', async () => {
    const reqUser = { userId: 'user-1' } as RequestUser;
    mockAuthService.switchIdentity.mockResolvedValue('switch-result');

    const result = await controller.switchIdentity(reqUser, {
      identityId: 'identity-2',
    });

    expect(mockAuthService.switchIdentity).toHaveBeenCalledWith(
      'user-1',
      'identity-2',
    );
    expect(result).toBe('switch-result');
  });

  it('requestChangePasswordOtp() delegates to authService.requestChangePasswordOtp with reqUser.user', async () => {
    const reqUser = {
      user: { id: 'user-1', phone: '+96555123456' },
    } as unknown as RequestUser;
    mockAuthService.requestChangePasswordOtp.mockResolvedValue('otp-result');

    const result = await controller.requestChangePasswordOtp(reqUser);

    expect(mockAuthService.requestChangePasswordOtp).toHaveBeenCalledWith(
      reqUser.user,
    );
    expect(result).toBe('otp-result');
  });

  it('changePassword() delegates to authService.changePassword with all args in the correct order', async () => {
    const reqUser = { userId: 'user-1' } as RequestUser;
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
    );
    expect(result).toBe('change-result');
  });
});
