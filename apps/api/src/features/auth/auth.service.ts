import { Injectable } from '@nestjs/common';
import { IdentityType, User, SocialProvider } from '@prisma/client';
import { VerifiedSocialProfile } from './services/google-auth.service';
import type { DeviceCtx } from '../devices/sessions.service';
import { AuthCredentialsService } from './services/auth-credentials.service';
import { AuthSessionService } from './services/auth-session.service';
import { AuthRegistrationService } from './services/auth-registration.service';
import { AuthPasswordService } from './services/auth-password.service';

/**
 * Public facade over the auth feature. The real logic lives in focused
 * sub-services under ./services/ (same structure as the properties and
 * chat features): credential validation, token/session issuance, the
 * social/registration sign-in paths, and password management.
 * The controller and strategies keep injecting this class, so the
 * module's public API is unchanged by the split.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly credentialsService: AuthCredentialsService,
    private readonly sessionService: AuthSessionService,
    private readonly registrationService: AuthRegistrationService,
    private readonly passwordService: AuthPasswordService,
  ) {}

  // 1. Verify credentials (used by LocalStrategy)
  validateUser(identifier: string, pass: string) {
    return this.credentialsService.validateUser(identifier, pass);
  }

  // 2. Generate JWT token with identity information
  login(
    user: Omit<User, 'password'>,
    identityId?: string,
    deviceCtx: DeviceCtx = {},
    opts: { identityType?: IdentityType } = {},
  ) {
    return this.sessionService.login(user, identityId, deviceCtx, opts);
  }

  // 2.1. Finish a sign-in paused at "reactivate your account now?"
  loginWithReactivationTicket(ticket: string, deviceCtx: DeviceCtx = {}) {
    return this.sessionService.loginWithReactivationTicket(ticket, deviceCtx);
  }

  // 2.5. Sign in (or register) via a verified Google/Apple profile
  loginOrRegisterWithSocial(
    provider: SocialProvider,
    profile: VerifiedSocialProfile,
    deviceCtx: DeviceCtx = {},
  ) {
    return this.registrationService.loginOrRegisterWithSocial(
      provider,
      profile,
      deviceCtx,
    );
  }

  // 3. Switch active identity
  switchIdentity(userId: string, identityId: string, sessionId?: string) {
    return this.sessionService.switchIdentity(userId, identityId, sessionId);
  }

  // 4. Verify OTP during individual registration
  verifyRegistrationOtp(phone: string, otp: string, deviceCtx: DeviceCtx = {}) {
    return this.registrationService.verifyRegistrationOtp(
      phone,
      otp,
      deviceCtx,
    );
  }

  verifyEmailRegistrationOtp(
    email: string,
    otp: string,
    deviceCtx: DeviceCtx = {},
  ) {
    return this.registrationService.verifyEmailRegistrationOtp(
      email,
      otp,
      deviceCtx,
    );
  }

  /**
   * Dev/CI-only: exposes a pending email signup's OTP for black-box e2e
   * tools (Maestro). Returns null whenever mail isn't in mock mode.
   */
  getMockEmailOtp(email: string): string | null {
    return this.registrationService.getMockEmailOtp(email);
  }

  async requestChangePasswordOtp(user: User, oldPassword?: string) {
    return this.passwordService.requestChangePasswordOtp(user, oldPassword);
  }

  async changePassword(
    userId: string,
    oldPass: string,
    newPass: string,
    otp?: string,
    logoutAllDevices?: boolean,
    currentSessionId?: string,
  ) {
    return this.passwordService.changePassword(
      userId,
      oldPass,
      newPass,
      otp,
      logoutAllDevices,
      currentSessionId,
    );
  }
}
