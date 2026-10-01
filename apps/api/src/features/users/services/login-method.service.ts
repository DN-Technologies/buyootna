import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LoginMethod } from '@prisma/client';
import type { LoginMethodChoice } from '../dto/login-method.dto';
import { OtpRateLimiterService } from '../../../core/otp-rate-limiter/otp-rate-limiter.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { TwilioService } from '../../../core/twilio/twilio.service';
import { isPhone } from '../../../core/utils/user.utils';
import { maskPhone } from './account-suspension.service';

export const PHONE_NOT_VERIFIED_MESSAGE =
  'يجب التحقق من رقم الهاتف أولاً، يمكنك التحقق من رقم الهاتف من تعديل الملف الشخصي.';
export const NO_EMAIL_MESSAGE =
  'أضف بريداً إلكترونياً إلى حسابك أولاً لاستخدامه في تسجيل الدخول.';

/**
 * طريقة تسجيل الدخول: which identifier (email or phone) a password login
 * accepts, and proving a phone number with an SMS code so it can be that
 * identifier. A phone only becomes the account's phone once its code is
 * checked here -- Edit Profile no longer changes it directly.
 */
@Injectable()
export class LoginMethodService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly twilio: TwilioService,
    private readonly rateLimiter: OtpRateLimiterService,
  ) {}

  private async findUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        phoneVerifiedAt: true,
        loginMethod: true,
      },
    });
    if (!user) throw new NotFoundException('المستخدم غير موجود');
    return user;
  }

  private view(user: Awaited<ReturnType<LoginMethodService['findUser']>>) {
    return {
      loginMethod: user.loginMethod ?? ('BOTH' as LoginMethodChoice),
      email: user.email,
      phone: user.phone,
      phoneVerified: !!(user.phone && user.phoneVerifiedAt),
    };
  }

  async get(userId: string) {
    return this.view(await this.findUser(userId));
  }

  async set(userId: string, method: LoginMethodChoice) {
    const user = await this.findUser(userId);
    if (method === LoginMethod.PHONE && !(user.phone && user.phoneVerifiedAt)) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'PHONE_NOT_VERIFIED',
        message: PHONE_NOT_VERIFIED_MESSAGE,
      });
    }
    if (method === LoginMethod.EMAIL && !user.email) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'NO_EMAIL',
        message: NO_EMAIL_MESSAGE,
      });
    }
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { loginMethod: method === 'BOTH' ? null : method },
      select: {
        id: true,
        email: true,
        phone: true,
        phoneVerifiedAt: true,
        loginMethod: true,
      },
    });
    return {
      ...this.view(updated),
      message: 'تم تحديث طريقة تسجيل الدخول بنجاح.',
    };
  }

  /** The same number in the forms it may be stored in (8 digits / 965 / +965). */
  private variants(phone: string): string[] {
    const local = phone.replace(/\D/g, '').slice(-8);
    return [phone, local, `965${local}`, `+965${local}`];
  }

  private async assertPhoneAvailable(userId: string, phone: string) {
    if (!isPhone(phone.replace(/[\s\-()]/g, ''))) {
      throw new BadRequestException('رقم الهاتف غير صالح');
    }
    const taken = await this.prisma.user.findFirst({
      where: { phone: { in: this.variants(phone) }, id: { not: userId } },
      select: { id: true },
    });
    if (taken) {
      throw new ConflictException('رقم الهاتف مستخدم في حساب آخر');
    }
  }

  /** Texts a code to the number the user wants on their account. */
  async requestPhoneOtp(userId: string, phone: string) {
    const clean = phone.trim();
    await this.assertPhoneAvailable(userId, clean);
    try {
      await this.twilio.sendVerification(clean);
    } catch {
      throw new InternalServerErrorException(
        'تعذر إرسال رمز التحقق. يرجى المحاولة مرة أخرى لاحقاً.',
      );
    }
    this.rateLimiter.recordRequest(userId);
    return { destination: maskPhone(this.twilio.formatPhoneNumber(clean)) };
  }

  /** Checks the code; only then does the number become the account's. */
  async verifyPhone(userId: string, phone: string, otp: string) {
    const clean = phone.trim();
    await this.assertPhoneAvailable(userId, clean);
    const valid = await this.twilio.checkVerification(clean, otp);
    this.rateLimiter.recordVerifyAttempt(userId, valid);
    if (!valid) {
      throw new BadRequestException('رمز التحقق غير صحيح أو منتهي الصلاحية');
    }
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { phone: clean, phoneVerifiedAt: new Date() },
      select: {
        id: true,
        email: true,
        phone: true,
        phoneVerifiedAt: true,
        loginMethod: true,
      },
    });
    return { ...this.view(updated), message: 'تم التحقق من رقم الهاتف' };
  }
}
