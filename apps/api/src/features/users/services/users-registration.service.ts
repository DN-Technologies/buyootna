import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { IdentityType, Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { TwilioService } from 'src/core/twilio/twilio.service';
import { EmailOtpService } from 'src/core/email-otp/email-otp.service';
import { PhoneRegistrationPendingService } from 'src/core/phone-registration/phone-registration-pending.service';
import { OtpRateLimiterService } from 'src/core/otp-rate-limiter/otp-rate-limiter.service';
import {
  checkUserExists,
  isEmail,
  isPhone,
} from '../../../core/utils/user.utils';
import { RegisterIndividualDto } from '../dto/register.dto';
import { RegisterCompanyDto } from '../../company/dto/register-company.dto';
import { RegisterOfficeDto } from '../../office/dto/register-office.dto';
import { IdentitiesService } from '../../identities/identities.service';
import {
  assertLicenseAvailable,
  normalizeLicenseNumber,
  rethrowAsConflict,
} from '../../identities/persona-rules';

@Injectable()
export class UsersRegistrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly identitiesService: IdentitiesService,
    private readonly twilioService: TwilioService,
    private readonly emailOtpService: EmailOtpService,
    private readonly phoneRegistrationPendingService: PhoneRegistrationPendingService,
    private readonly rateLimiter?: OtpRateLimiterService,
  ) {}

  // --- Register Individual ---
  // Neither email NOR phone identifiers create an account up front: the
  // signup details sit in a pending store until verify-otp succeeds (see
  // completeEmailRegistration / completePhoneRegistration), so an
  // abandoned/never-verified signup leaves zero DB rows — no admin-dashboard
  // pollution, no permanently squatted unique phone.
  async registerIndividual(dto: RegisterIndividualDto) {
    const email = isEmail(dto.identifier) ? dto.identifier : undefined;
    const phone = isPhone(dto.identifier) ? dto.identifier : undefined;

    await checkUserExists(this.prisma, email, phone);

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    if (email) {
      try {
        await this.emailOtpService.sendRegistrationOtp(
          email,
          dto.name,
          hashedPassword,
        );
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException(
          'تعذر إرسال رمز التحقق إلى بريدك الإلكتروني. يرجى المحاولة مرة أخرى لاحقاً.',
        );
      }
      return {
        otpRequired: true,
        identifier: email,
        message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
      };
    }

    if (phone) {
      try {
        await this.twilioService.sendVerification(phone);
        // Keyed by the raw identifier to match @OtpRequestRateLimit('identifier')
        // on the controller, which is what actually enforces the cooldown.
        this.rateLimiter?.recordRequest(dto.identifier);
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException(
          'تعذر إرسال رمز التحقق. يرجى المحاولة مرة أخرى لاحقاً.',
        );
      }
      this.phoneRegistrationPendingService.save(
        phone,
        dto.name,
        hashedPassword,
      );
      return {
        otpRequired: true,
        identifier: phone,
        message: 'تم إرسال رمز التحقق إلى هاتفك',
      };
    }

    throw new BadRequestException(
      'صيغة البريد الإلكتروني أو رقم الهاتف غير صحيحة',
    );
  }

  /**
   * Verifies a pending phone registration's OTP and, only on success,
   * actually creates the account. Called after verifyRegistrationOtp
   * confirmed the code with Twilio Verify.
   */
  async completePhoneRegistration(phone: string) {
    const pending = this.phoneRegistrationPendingService.consume(phone);
    if (!pending) {
      throw new BadRequestException('انتهت جلسة التسجيل، يرجى إعادة المحاولة');
    }

    // Re-check for a race: another registration (e.g. via a different
    // identifier path) could have taken this phone while the OTP was
    // pending.
    await checkUserExists(this.prisma, undefined, phone);

    return this.createIndividualAccount(
      undefined,
      phone,
      pending.name,
      pending.hashedPassword,
    );
  }

  /**
   * Verifies a pending email registration's OTP and, only on success,
   * actually creates the account. Called after registerIndividual sent the
   * OTP for an email identifier.
   */
  async completeEmailRegistration(email: string, otp: string) {
    const pending = this.emailOtpService.verifyAndConsume(email, otp);
    if (!pending) {
      throw new BadRequestException('رمز التحقق غير صحيح أو منتهي الصلاحية');
    }

    // Re-check for a race: another registration (e.g. via a different
    // identifier path) could have taken this email while the OTP was
    // pending.
    await checkUserExists(this.prisma, email, undefined);

    return this.createIndividualAccount(
      email,
      undefined,
      pending.name,
      pending.hashedPassword,
    );
  }

  private async createIndividualAccount(
    email: string | undefined,
    phone: string | undefined,
    name: string,
    hashedPassword: string,
  ) {
    try {
      // Transaction ensures both records are created, or neither are.
      const result = await this.prisma.$transaction(
        async (tx) => {
          const user = await tx.user.create({
            data: {
              email,
              phone,
              password: hashedPassword,
              role: Role.INDIVIDUAL,
              // Legacy field kept in sync with individualData.name below —
              // UsersProfileService.updateProfile does the same on updates.
              name,
            },
          });

          const profile = await tx.individualProfile.create({
            data: { userId: user.id },
          });

          // Create the Identity record auth/login relies on.
          await tx.identity.create({
            data: {
              userId: user.id,
              type: IdentityType.INDIVIDUAL,
              isActive: true,
              individualData: { create: { name } },
            },
          });

          return { user, profile };
        },
        { timeout: 15000 },
      );

      // Remove password from response
      const userWithoutPassword = { ...result.user };
      delete (userWithoutPassword as Partial<typeof userWithoutPassword>)
        .password;
      return { user: userWithoutPassword, profile: result.profile };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('حدث خطأ أثناء إنشاء الحساب');
    }
  }

  // --- Register Company ---
  registerCompany(
    dto: RegisterCompanyDto,
    logoFile?: Express.Multer.File,
    licenseFile?: Express.Multer.File,
  ) {
    return this.registerProvider(
      IdentityType.COMPANY,
      dto,
      logoFile,
      licenseFile,
      'حدث خطأ أثناء إنشاء حساب الشركة',
    );
  }

  // --- Register Office ---
  registerOffice(
    dto: RegisterOfficeDto,
    logoFile?: Express.Multer.File,
    licenseFile?: Express.Multer.File,
  ) {
    return this.registerProvider(
      IdentityType.OFFICE,
      dto,
      logoFile,
      licenseFile,
      'حدث خطأ أثناء إنشاء حساب المكتب',
    );
  }

  /**
   * Direct company/office signup: creates the login and then the persona
   * through IdentitiesService -- the same path (and rules) as adding a
   * company/office from inside the app. Everything is validated before any
   * file is uploaded, and uploads are removed again if the write fails.
   */
  private async registerProvider(
    type: typeof IdentityType.COMPANY | typeof IdentityType.OFFICE,
    dto: RegisterCompanyDto | RegisterOfficeDto,
    logoFile: Express.Multer.File | undefined,
    licenseFile: Express.Multer.File | undefined,
    failureMessage: string,
  ) {
    await checkUserExists(this.prisma, dto.email, dto.phone);
    await assertLicenseAvailable(
      this.prisma,
      normalizeLicenseNumber(dto.licenseNumber),
    );

    const uploaded = await this.identitiesService.uploadProviderFiles(
      type,
      logoFile,
      licenseFile,
    );
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: dto.email,
            phone: dto.phone,
            password: hashedPassword,
            role: type === IdentityType.COMPANY ? Role.COMPANY : Role.OFFICE,
          },
        });

        const identity = await this.identitiesService.createProviderPersonaInTx(
          tx,
          type,
          user.id,
          { ...dto, ...uploaded },
          { isActive: true },
        );

        return { user, identity };
      });

      // Remove password from response
      const userWithoutPassword = { ...result.user };
      delete (userWithoutPassword as Partial<typeof userWithoutPassword>)
        .password;
      return {
        user: userWithoutPassword,
        profile: result.identity.companyData ?? result.identity.officeData,
      };
    } catch (error) {
      await this.identitiesService.deleteUploads(uploaded);
      if (error instanceof HttpException) throw error;
      if (isLicenseConflict(error)) rethrowAsConflict(error);
      console.log(error);
      throw new InternalServerErrorException(failureMessage);
    }
  }
}

// A licence number taken by a concurrent signup (unique index)
function isLicenseConflict(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002' &&
    JSON.stringify(error.meta?.target ?? '').includes('licenseNumber')
  );
}
