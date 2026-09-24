import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { TwilioService } from 'src/core/twilio/twilio.service';
import { OtpRateLimiterService } from 'src/core/otp-rate-limiter/otp-rate-limiter.service';
import { User } from '@prisma/client';
import { SessionsService } from '../../devices/sessions.service';
import * as bcrypt from 'bcrypt';

/**
 * Password lifecycle for the logged-in account: requesting the change
 * password OTP and performing the change itself.
 */
@Injectable()
export class AuthPasswordService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly twilioService: TwilioService,
    private readonly sessions: SessionsService,
    private readonly rateLimiter?: OtpRateLimiterService,
  ) {}

  async requestChangePasswordOtp(user: User) {
    if (!user.phone) {
      throw new BadRequestException('المستخدم ليس لديه رقم هاتف مسجل');
    }

    // Twilio failures (unverifiable/malformed number, trial-account limits,
    // provider outage) used to re-throw out of sendVerification and surface
    // as a raw 500 -- QA's "server error on change password for phone
    // accounts". Translate into the same handled, user-facing error the
    // registration flow already produces for a failed send.
    try {
      await this.twilioService.sendVerification(user.phone);
    } catch {
      throw new InternalServerErrorException(
        'تعذر إرسال رمز التحقق. يرجى المحاولة مرة أخرى لاحقاً.',
      );
    }
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
      data: {
        password: hashedNewPassword,
        // Lets JwtStrategy reject legacy tokens that carry no sid claim
        // (issued before sessions existed) and could otherwise not be
        // revoked by the session deletion below.
        passwordChangedAt: new Date(),
      },
    });

    // Revoking other devices is opt-out: the client's switch defaults to
    // ON, and this branch is what actually kills Device B's session (its
    // next request 401s via JwtStrategy's sid check).
    if (logoutAllDevices) {
      await this.sessions.deleteAllExceptCurrent(userId, currentSessionId);
    }

    return { message: 'تم تغيير كلمة المرور بنجاح' };
  }
}
