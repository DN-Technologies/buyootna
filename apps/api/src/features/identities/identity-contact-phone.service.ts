import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { OtpRateLimiterService } from '../../core/otp-rate-limiter/otp-rate-limiter.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TwilioService } from '../../core/twilio/twilio.service';
import { isPhone } from '../../core/utils/user.utils';
import { maskPhone } from '../users/services/account-suspension.service';
import { contactPhoneOf } from './utils/contact-phone.util';

/**
 * A persona's contact number (رقم التواصل): the account's phone by default,
 * or its own number proven by an SMS code -- e.g. a company's office line
 * instead of the owner's mobile. Only the persona the request speaks as can
 * be changed. Unlike the account phone it's not unique and never signs in.
 */
@Injectable()
export class IdentityContactPhoneService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly twilio: TwilioService,
    private readonly rateLimiter: OtpRateLimiterService,
  ) {}

  private async load(userId: string, identityId: string) {
    const identity = await this.prisma.identity.findFirst({
      where: { id: identityId, userId },
      select: {
        id: true,
        type: true,
        useAccountPhone: true,
        contactPhone: true,
        contactPhoneVerifiedAt: true,
        user: { select: { phone: true } },
      },
    });
    if (!identity) throw new NotFoundException('الهوية غير موجودة');
    return identity;
  }

  private view(
    identity: Awaited<ReturnType<IdentityContactPhoneService['load']>>,
  ) {
    return {
      useAccountPhone: identity.useAccountPhone,
      accountPhone: identity.user.phone,
      contactPhone: identity.contactPhone,
      contactPhoneVerified: !!identity.contactPhoneVerifiedAt,
      // What people actually see and call
      effectivePhone: contactPhoneOf(identity, identity.user),
    };
  }

  private clean(phone: string): string {
    const clean = phone.trim();
    if (!isPhone(clean.replace(/[\s\-()]/g, ''))) {
      throw new BadRequestException('رقم الهاتف غير صالح');
    }
    return clean;
  }

  async get(userId: string, identityId: string) {
    return this.view(await this.load(userId, identityId));
  }

  /** Texts a code to the number this persona wants to be reached on. */
  async requestOtp(userId: string, identityId: string, phone: string) {
    await this.load(userId, identityId);
    const clean = this.clean(phone);
    try {
      await this.twilio.sendVerification(clean, 'CONTACT_PHONE');
    } catch {
      throw new InternalServerErrorException(
        'تعذر إرسال رمز التحقق. يرجى المحاولة مرة أخرى لاحقاً.',
      );
    }
    this.rateLimiter.recordRequest(userId);
    return { destination: maskPhone(this.twilio.formatPhoneNumber(clean)) };
  }

  /** Checks the code; only then does the number become this persona's. */
  async verify(userId: string, identityId: string, phone: string, otp: string) {
    await this.load(userId, identityId);
    const clean = this.clean(phone);
    const valid = await this.twilio.checkVerification(clean, otp);
    this.rateLimiter.recordVerifyAttempt(userId, valid);
    if (!valid) {
      throw new BadRequestException('رمز التحقق غير صحيح أو منتهي الصلاحية');
    }
    await this.prisma.identity.update({
      where: { id: identityId },
      data: {
        contactPhone: clean,
        contactPhoneVerifiedAt: new Date(),
        useAccountPhone: false,
      },
    });
    return {
      ...this.view(await this.load(userId, identityId)),
      message: 'تم التحقق من رقم التواصل',
    };
  }

  /**
   * The checkbox: back to the account's phone, or back to this persona's own
   * number -- which must already be verified (a new one goes through verify).
   */
  async setUseAccountPhone(
    userId: string,
    identityId: string,
    useAccountPhone: boolean,
  ) {
    const identity = await this.load(userId, identityId);
    if (
      !useAccountPhone &&
      !(identity.contactPhone && identity.contactPhoneVerifiedAt)
    ) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'CONTACT_PHONE_NOT_VERIFIED',
        message: 'تحقق من رقم التواصل الخاص بهذه الهوية أولاً.',
      });
    }
    await this.prisma.identity.update({
      where: { id: identityId },
      data: { useAccountPhone },
    });
    return this.view(await this.load(userId, identityId));
  }
}
