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
import { arabicDays } from '../../auth/account-status.util';
import { SuspendAccountDto } from '../dto/suspend-account.dto';
import { AccountStateService } from './account-state.service';

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
 * reasons, and undone by signing in again (AuthSessionService.login) or,
 * for a timed one, automatically when the period ends.
 */
@Injectable()
export class AccountSuspensionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly twilio: TwilioService,
    private readonly emailOtp: EmailOtpService,
    private readonly rateLimiter: OtpRateLimiterService,
    private readonly accountState: AccountStateService,
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
        await this.twilio.sendVerification(user.phone, 'ACCOUNT_SUSPEND');
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
   * Checks the code, then disables the account, records why, and ends every
   * session so all devices are signed out (AccountStateService).
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

    const until = dto.durationDays
      ? new Date(Date.now() + dto.durationDays * 86_400_000)
      : null;

    await this.accountState.deactivateByUser(user.id, {
      reasons: dto.reasons,
      note,
      until,
    });

    return {
      success: true,
      suspendedUntil: until,
      message: dto.durationDays
        ? `تم تعطيل حسابك مؤقتاً، وسيُعاد تفعيله تلقائياً بعد ${arabicDays(dto.durationDays)}. يمكنك إعادة تفعيله قبل ذلك بتسجيل الدخول.`
        : 'تم تعطيل حسابك مؤقتاً. يمكنك إعادة تفعيله في أي وقت بتسجيل الدخول.',
    };
  }
}
