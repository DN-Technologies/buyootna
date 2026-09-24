import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TwilioService } from '../../core/twilio/twilio.service';
import { EmailOtpService } from '../../core/email-otp/email-otp.service';
import { OtpRateLimiterService } from '../../core/otp-rate-limiter/otp-rate-limiter.service';
import {
  RequestOtpDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto/recovery.dto';
import { isEmail, isPhone } from '../../core/utils/user.utils';
import * as bcrypt from 'bcrypt';

interface ResetTokenPayload {
  sub: string;
  purpose: string;
}

@Injectable()
export class RecoveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly twilioService: TwilioService,
    private readonly emailOtpService: EmailOtpService,
    private readonly rateLimiter?: OtpRateLimiterService,
  ) {}

  // STEP 1: Generate and send OTP
  async requestOtp(dto: RequestOtpDto) {
    const validEmail = isEmail(dto.identifier);
    const validPhone = isPhone(dto.identifier);

    if (!validEmail && !validPhone) {
      throw new BadRequestException('يجب إدخال بريد إلكتروني أو رقم هاتف صالح');
    }

    const email = validEmail ? dto.identifier : undefined;
    const phone = validPhone ? dto.identifier : undefined;

    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: email }, { phone: phone }] },
    });

    this.rateLimiter?.recordRequest(dto.identifier);

    if (!user) {
      // Security best practice: Don't reveal if the user exists or not
      return { message: 'إذا كان الحساب موجوداً، فسيتم إرسال رمز التحقق' };
    }

    // Deliver the OTP over whichever channel the entered identifier
    // actually is — an email-only account (no phone on file) previously
    // fell through this check silently, so no OTP was ever sent for it.
    //
    // Send failures (Twilio rejecting an unverifiable/malformed number,
    // provider outage, SMTP failure) must not escape as a raw 500 -- they
    // are translated into the same handled, user-facing error the
    // registration flow produces for a failed send.
    try {
      if (validPhone && user.phone) {
        await this.twilioService.sendVerification(user.phone);
      } else if (validEmail && user.email) {
        await this.emailOtpService.sendPasswordResetOtp(
          user.email,
          user.name ?? 'مستخدم',
        );
      }
    } catch {
      throw new InternalServerErrorException(
        'تعذر إرسال رمز التحقق. يرجى المحاولة مرة أخرى لاحقاً.',
      );
    }

    return { message: 'تم إرسال رمز التحقق بنجاح' };
  }

  // STEP 2: Verify the OTP and issue a temporary Reset Token
  async verifyOtp(dto: VerifyOtpDto) {
    const validEmail = isEmail(dto.identifier);
    const validPhone = isPhone(dto.identifier);

    const email = validEmail ? dto.identifier : undefined;
    const phone = validPhone ? dto.identifier : undefined;

    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: email }, { phone: phone }] },
    });

    if (!user) {
      this.rateLimiter?.recordVerifyAttempt(dto.identifier, false);
      throw new BadRequestException('البيانات غير صحيحة');
    }

    let isValid = false;
    if (validPhone && user.phone) {
      isValid = await this.twilioService.checkVerification(user.phone, dto.otp);
    } else if (validEmail && user.email) {
      isValid = this.emailOtpService.verifyPasswordResetOtp(
        user.email,
        dto.otp,
      );
    }

    if (!isValid) {
      this.rateLimiter?.recordVerifyAttempt(dto.identifier, false);
      throw new BadRequestException('رمز التحقق غير صحيح أو منتهي الصلاحية');
    }

    this.rateLimiter?.recordVerifyAttempt(dto.identifier, true);

    // Generate a temporary JWT just for resetting the password
    const resetToken = this.jwtService.sign({
      sub: user.id,
      purpose: 'password_reset',
    });

    return {
      message: 'تم التحقق بنجاح',
      resetToken,
    };
  }

  // STEP 3: Use the Reset Token to change the password
  async resetPassword(dto: ResetPasswordDto) {
    try {
      // Verify the temporary token
      const payload = this.jwtService.verify<ResetTokenPayload>(dto.resetToken);

      if (payload.purpose !== 'password_reset') {
        throw new UnauthorizedException('توكن غير صالح');
      }

      const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

      // Update the user's password
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { password: hashedPassword },
      });

      return { message: 'تم تحديث كلمة المرور بنجاح' };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException(
        'انتهت صلاحية الجلسة، يرجى المحاولة مرة أخرى',
      );
    }
  }
}
