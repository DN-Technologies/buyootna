import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EmailOtpService } from '../../../core/email-otp/email-otp.service';
import { OtpRateLimiterService } from '../../../core/otp-rate-limiter/otp-rate-limiter.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { TwilioService } from '../../../core/twilio/twilio.service';
import { SuspendAccountDto } from '../dto/suspend-account.dto';

export type SuspendOtpChannel = 'phone' | 'email';

// "+96599998888" -> "+965 •••• 88": enough to recognise, not to read off
export function maskPhone(phone: string): string {
  const clean = phone.replace(/\s+/g, '');
  if (clean.length < 6) return '••••';
  return `${clean.slice(0, 4)} •••• ${clean.slice(-2)}`;
}

// "ali.salem@gmail.com" -> "a•••@gmail.com"
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '••••';
  return `${local.slice(0, 1)}•••@${domain}`;
}

/**
 * The user suspending their own account (تعطيل الحساب مؤقتًا): confirmed with
 * a code (SMS, or email for accounts without a phone), recorded with the
 * reasons, and undone by signing in again (AuthSessionService.login).
 */
@Injectable()
export class AccountSuspensionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly twilio: TwilioService,
    private readonly emailOtp: EmailOtpService,
    private readonly rateLimiter: OtpRateLimiterService,
  ) {}

  private async findUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, phone: true, email: true },
    });
    if (!user) throw new NotFoundException('المستخدم غير موجود');
    return user;
  }

  /** Sends the confirmation code; the phone wins when there is one. */
  async requestOtp(
    userId: string,
  ): Promise<{ channel: SuspendOtpChannel; destination: string }> {
    const user = await this.findUser(userId);

    if (user.phone) {
      try {
        await this.twilio.sendVerification(user.phone);
      } catch {
        throw new InternalServerErrorException(
          'تعذر إرسال رمز التحقق. يرجى المحاولة مرة أخرى لاحقاً.',
        );
      }
      this.rateLimiter.recordRequest(user.id);
      return { channel: 'phone', destination: maskPhone(user.phone) };
    }

    if (user.email) {
      await this.emailOtp.sendAccountSuspendOtp(
        user.email,
        user.name || 'مستخدم بيوتنا',
      );
      this.rateLimiter.recordRequest(user.id);
      return { channel: 'email', destination: maskEmail(user.email) };
    }

    throw new BadRequestException(
      'لا يوجد رقم هاتف أو بريد إلكتروني لإرسال رمز التحقق',
    );
  }

  /**
   * Checks the code, then in one transaction disables the account, records
   * why, and ends every session so all devices are signed out.
   */
  async suspend(userId: string, dto: SuspendAccountDto) {
    const user = await this.findUser(userId);

    const valid = user.phone
      ? await this.twilio.checkVerification(user.phone, dto.otp)
      : user.email
        ? this.emailOtp.verifyAccountSuspendOtp(user.email, dto.otp)
        : false;

    this.rateLimiter.recordVerifyAttempt(user.id, valid);
    if (!valid) {
      throw new BadRequestException('رمز التحقق غير صحيح أو منتهي الصلاحية');
    }

    const note = dto.reasons.includes('other')
      ? dto.note?.trim() || null
      : null;

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { isDisabled: true, suspendedAt: new Date() },
      }),
      this.prisma.accountSuspension.create({
        data: { userId: user.id, reasons: dto.reasons, note },
      }),
      this.prisma.session.deleteMany({ where: { userId: user.id } }),
    ]);

    return {
      success: true,
      message:
        'تم تعطيل حسابك مؤقتاً. يمكنك إعادة تفعيله في أي وقت بتسجيل الدخول.',
    };
  }
}
