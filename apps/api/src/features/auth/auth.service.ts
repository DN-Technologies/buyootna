import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { TwilioService } from 'src/core/twilio/twilio.service';
import { UsersRegistrationService } from '../users/services/users-registration.service';
import { EmailOtpService } from 'src/core/email-otp/email-otp.service';
import { OtpRateLimiterService } from 'src/core/otp-rate-limiter/otp-rate-limiter.service';
import { DeviceCtx, SessionsService } from '../devices/sessions.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, IdentityType, Role, SocialProvider } from '@prisma/client';
import { JwtPayload } from './strategies/jwt.strategy';
import { VerifiedSocialProfile } from './services/google-auth.service';
import {
  AuthIdentitiesService,
  IdentityWithData,
} from './services/auth-identities.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly twilioService: TwilioService,
    private readonly usersRegistrationService: UsersRegistrationService,
    private readonly emailOtpService: EmailOtpService,
    private readonly identities: AuthIdentitiesService,
    private readonly sessions: SessionsService,
    private readonly rateLimiter?: OtpRateLimiterService,
  ) {}

  // 1. Verify credentials (used by LocalStrategy)
  async validateUser(
    identifier: string,
    pass: string,
  ): Promise<Omit<User, 'password'>> {
    // Look up user by email OR phone
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'البريد الإلكتروني أو رقم الهاتف غير صحيح',
      );
    }

    if (user.isDisabled && !user.isAdmin) {
      throw new UnauthorizedException('الحساب معطل مؤقتاً');
    }

    if (user.isBlocked && !user.isAdmin) {
      throw new UnauthorizedException('الحساب محظور');
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('كلمة المرور غير صحيحة');
    }

    // Never return the password!
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as Partial<typeof userWithoutPassword>)
      .password;
    return userWithoutPassword;
  }

  // 2. Generate JWT token with identity information
  async login(
    user: Omit<User, 'password'>,
    identityId?: string,
    deviceCtx: DeviceCtx = {},
  ) {
    // Get the active identity or the specified one
    let identity: IdentityWithData | null;

    if (identityId) {
      identity = await this.identities.findById(identityId, user.id);
    } else {
      identity = await this.identities.findActive(user.id);

      // If no active identity, get the first one (and set it as active)
      if (!identity) {
        identity = await this.identities.findEarliest(user.id);

        if (identity) {
          await this.identities.activate(identity.id);
          identity.isActive = true;
        }
      }

      // Self-heal: registration always creates the User row and its first
      // Identity together in one transaction, so a User with zero
      // identities should never exist. If one somehow does (legacy data,
      // a manual DB edit, a bug we haven't found), don't lock the account
      // out forever with no way back in -- provision a default individual
      // identity instead of throwing. Never done for an explicit
      // identityId switch below, since that's a real "not found" error,
      // not an orphaned-account recovery.
      if (!identity) {
        identity = await this.identities.createDefaultForOrphanedUser(user.id);
      }
    }

    if (!identity) {
      throw new BadRequestException('لا توجد هوية مرتبطة بهذا الحساب');
    }

    const session = await this.sessions.upsertSession(user.id, deviceCtx);

    // Build JWT payload
    const payload: JwtPayload = {
      sub: user.id,
      ident: identity.id,
      type: identity.type,
      sid: session.id,
    };

    const identities = await this.identities.listAll(user.id);

    return {
      access_token: this.jwtService.sign(payload),
      sessionId: session.id,
      user,
      activeIdentity: identity,
      identities,
    };
  }

  // 2.5. Sign in (or register) via a verified Google/Apple profile
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
      return this.login(userWithoutPassword, undefined, deviceCtx);
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
        return this.login(userWithoutPassword, undefined, deviceCtx);
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
    return this.login(userWithoutPassword, undefined, deviceCtx);
  }

  // 3. Switch active identity
  async switchIdentity(userId: string, identityId: string, sessionId?: string) {
    // Verify identity belongs to user
    const identity = await this.identities.findById(identityId, userId);

    if (!identity) {
      throw new ForbiddenException('الهوية غير موجودة أو لا تنتمي لهذا الحساب');
    }

    // Update isActive flags in a transaction
    await this.prisma.$transaction([
      // Deactivate all user's identities
      this.prisma.identity.updateMany({
        where: { userId },
        data: { isActive: false },
      }),
      // Activate the selected identity
      this.prisma.identity.update({
        where: { id: identityId },
        data: { isActive: true },
      }),
    ]);

    // Get updated user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('المستخدم غير موجود');
    }

    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as Partial<typeof userWithoutPassword>)
      .password;

    // Switching identity stays on the same device/session — reuse the
    // existing sid rather than creating a new Session row.
    if (sessionId) {
      await this.sessions.touchLastActive(sessionId);
    }

    // Generate new JWT token with updated identity
    const payload: JwtPayload = {
      sub: userId,
      ident: identity.id,
      type: identity.type,
      sid: sessionId,
    };

    // Get all identities
    const identities = await this.identities.listAll(userId);

    return {
      access_token: this.jwtService.sign(payload),
      sessionId,
      user: userWithoutPassword,
      activeIdentity: { ...identity, isActive: true },
      identities: identities.map((i) => ({
        ...i,
        isActive: i.id === identityId,
      })),
    };
  }

  // 4. Verify OTP during individual registration
  async verifyRegistrationOtp(
    phone: string,
    otp: string,
    deviceCtx: DeviceCtx = {},
  ) {
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      this.rateLimiter?.recordVerifyAttempt(phone, false);
      throw new BadRequestException('رقم الهاتف غير مسجل');
    }

    const isValid = await this.twilioService.checkVerification(phone, otp);
    if (!isValid) {
      this.rateLimiter?.recordVerifyAttempt(phone, false);
      throw new BadRequestException('رمز التحقق غير صحيح أو منتهي الصلاحية');
    }

    this.rateLimiter?.recordVerifyAttempt(phone, true);

    // Return access token and user info
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as Partial<typeof userWithoutPassword>)
      .password;

    return this.login(userWithoutPassword, undefined, deviceCtx);
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
      return this.login(user, undefined, deviceCtx);
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

  async requestChangePasswordOtp(user: User) {
    if (!user.phone) {
      throw new BadRequestException('المستخدم ليس لديه رقم هاتف مسجل');
    }

    await this.twilioService.sendVerification(user.phone);
    this.rateLimiter?.recordRequest(user.id);

    return { message: 'تم إرسال رمز التحقق بنجاح' };
  }

  async changePassword(
    userId: string,
    oldPass: string,
    newPass: string,
    otp?: string,
    logoutAllDevices?: boolean,
    currentSessionId?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      this.rateLimiter?.recordVerifyAttempt(userId, false);
      throw new BadRequestException('المستخدم غير موجود');
    }

    // Only accounts with a phone on file can be OTP-verified -- for
    // everyone else (email/social-only accounts), the already-required
    // old-password check below is the sole re-authentication factor.
    if (user.phone) {
      if (!otp) {
        this.rateLimiter?.recordVerifyAttempt(userId, false);
        throw new BadRequestException('رمز التحقق مطلوب');
      }
      const isValid = await this.twilioService.checkVerification(
        user.phone,
        otp,
      );
      if (!isValid) {
        this.rateLimiter?.recordVerifyAttempt(userId, false);
        throw new BadRequestException('رمز التحقق غير صحيح أو منتهي الصلاحية');
      }
    }

    const isMatch = await bcrypt.compare(oldPass, user.password);
    if (!isMatch) {
      this.rateLimiter?.recordVerifyAttempt(userId, false);
      throw new BadRequestException('كلمة المرور القديمة غير صحيحة');
    }

    this.rateLimiter?.recordVerifyAttempt(userId, true);

    const hashedNewPassword = await bcrypt.hash(newPass, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    if (logoutAllDevices) {
      await this.sessions.deleteAllExceptCurrent(userId, currentSessionId);
    }

    return { message: 'تم تغيير كلمة المرور بنجاح' };
  }
}
