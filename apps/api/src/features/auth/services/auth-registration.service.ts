import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { defaultLoginMethod } from 'src/core/utils/user.utils';
import { TwilioService } from 'src/core/twilio/twilio.service';
import { UsersRegistrationService } from '../../users/services/users-registration.service';
import { EmailOtpService } from 'src/core/email-otp/email-otp.service';
import { PhoneRegistrationPendingService } from 'src/core/phone-registration/phone-registration-pending.service';
import { OtpRateLimiterService } from 'src/core/otp-rate-limiter/otp-rate-limiter.service';
import { IdentityType, Role, SocialProvider } from '@prisma/client';
import { VerifiedSocialProfile } from './google-auth.service';
import { DeviceCtx } from '../../devices/sessions.service';
import { AuthSessionService } from './auth-session.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

/**
 * Sign-in paths that may create the account on the fly: verified
 * Google/Apple profiles, and the OTP gates that turn a pending phone/email
 * signup into a real account. All of them end in AuthSessionService.login.
 */
@Injectable()
export class AuthRegistrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly twilioService: TwilioService,
    private readonly usersRegistrationService: UsersRegistrationService,
    private readonly emailOtpService: EmailOtpService,
    private readonly phoneRegistrationPendingService: PhoneRegistrationPendingService,
    private readonly sessionService: AuthSessionService,
    private readonly rateLimiter?: OtpRateLimiterService,
  ) {}

  // Sign in (or register) via a verified Google/Apple profile
  async loginOrRegisterWithSocial(
    provider: SocialProvider,
    profile: VerifiedSocialProfile,
    deviceCtx: DeviceCtx = {},
  ) {
    const existingLink = await this.prisma.socialAccount.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId: profile.providerId,
        },
      },
      include: { user: true },
    });

    if (existingLink) {
      const userWithoutPassword = { ...existingLink.user };
      delete (userWithoutPassword as Partial<typeof userWithoutPassword>)
        .password;
      return this.sessionService.login(
        userWithoutPassword,
        undefined,
        deviceCtx,
      );
    }

    // Account linking: an existing user with a matching email adopts this social login.
    if (profile.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: profile.email },
      });

      if (existingUser) {
        await this.prisma.socialAccount.create({
          data: {
            userId: existingUser.id,
            provider,
            providerId: profile.providerId,
            email: profile.email,
          },
        });

        const userWithoutPassword = { ...existingUser };
        delete (userWithoutPassword as Partial<typeof userWithoutPassword>)
          .password;
        return this.sessionService.login(
          userWithoutPassword,
          undefined,
          deviceCtx,
        );
      }
    }

    // Brand-new user: create User + IndividualProfile + Identity + SocialAccount together.
    // Social-only accounts get an unusable random password (the column is non-nullable).
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const newUser = await this.prisma.$transaction(
      async (tx) => {
        const user = await tx.user.create({
          data: {
            email: profile.email,
            password: hashedPassword,
            role: Role.INDIVIDUAL,
            loginMethod: defaultLoginMethod(profile.email, null),
          },
        });

        await tx.individualProfile.create({
          data: { userId: user.id },
        });

        await tx.identity.create({
          data: {
            userId: user.id,
            type: IdentityType.INDIVIDUAL,
            isActive: true,
            individualData: { create: {} },
          },
        });

        await tx.socialAccount.create({
          data: {
            userId: user.id,
            provider,
            providerId: profile.providerId,
            email: profile.email,
          },
        });

        return user;
      },
      { timeout: 15000 },
    );

    const userWithoutPassword = { ...newUser };
    delete (userWithoutPassword as Partial<typeof userWithoutPassword>)
      .password;
    return this.sessionService.login(userWithoutPassword, undefined, deviceCtx);
  }

  // Verify OTP during individual registration. No user exists yet —
  // registration only stashed the signup in PhoneRegistrationPendingService;
  // the account is created here once Twilio confirms the code.
  async verifyRegistrationOtp(
    phone: string,
    otp: string,
    deviceCtx: DeviceCtx = {},
  ) {
    if (!this.phoneRegistrationPendingService.hasPending(phone)) {
      this.rateLimiter?.recordVerifyAttempt(phone, false);
      throw new BadRequestException('رقم الهاتف غير مسجل');
    }

    const isValid = await this.twilioService.checkVerification(phone, otp);
    if (!isValid) {
      this.rateLimiter?.recordVerifyAttempt(phone, false);
      throw new BadRequestException('رمز التحقق غير صحيح أو منتهي الصلاحية');
    }

    this.rateLimiter?.recordVerifyAttempt(phone, true);

    const { user } =
      await this.usersRegistrationService.completePhoneRegistration(phone);

    return this.sessionService.login(user, undefined, deviceCtx);
  }

  // Unlike verifyRegistrationOtp (phone), no user exists yet here —
  // UsersRegistrationService creates the account only once this OTP checks
  // out against the pending signup it stored.
  async verifyEmailRegistrationOtp(
    email: string,
    otp: string,
    deviceCtx: DeviceCtx = {},
  ) {
    try {
      const { user } =
        await this.usersRegistrationService.completeEmailRegistration(
          email,
          otp,
        );

      this.rateLimiter?.recordVerifyAttempt(email, true);
      return this.sessionService.login(user, undefined, deviceCtx);
    } catch (error) {
      this.rateLimiter?.recordVerifyAttempt(email, false);
      throw error;
    }
  }

  /**
   * Dev/CI-only: exposes a pending email signup's OTP, for black-box e2e
   * tools (Maestro) that drive the app from a separate process and have no
   * way to read it the way in-process Jest specs can. Returns null (and the
   * controller 404s) whenever mail isn't in mock mode.
   */
  getMockEmailOtp(email: string): string | null {
    return this.emailOtpService.getMockOtp(email);
  }
}
