import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { IdentityType, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { StorageService } from 'src/core/storage/storage.service';
import { TwilioService } from 'src/core/twilio/twilio.service';
import { EmailOtpService } from 'src/core/email-otp/email-otp.service';
import { PhoneRegistrationPendingService } from 'src/core/phone-registration/phone-registration-pending.service';
import { OtpRateLimiterService } from 'src/core/otp-rate-limiter/otp-rate-limiter.service';
import {
  checkUserExists,
  isEmail,
  isPhone,
} from '../../../core/utils/user.utils';
import {
  RegisterCompanyDto,
  RegisterIndividualDto,
  RegisterOfficeDto,
} from '../dto/register.dto';

@Injectable()
export class UsersRegistrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
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
      this.phoneRegistrationPendingService.save(phone, dto.name, hashedPassword);
      return {
        otpRequired: true,
        identifier: phone,
        message: 'تم إرسال رمز التحقق إلى هاتفك',
      };
    }

    throw new BadRequestException('صيغة البريد الإلكتروني أو رقم الهاتف غير صحيحة');
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
  async registerCompany(
    dto: RegisterCompanyDto,
    logoFile?: Express.Multer.File,
    licenseFile?: Express.Multer.File,
  ) {
    await checkUserExists(this.prisma, dto.email, dto.phone);

    // 1. Upload files to S3 if they exist
    let logoUrl: string | null = null;
    let licenseFileUrl: string | null = null;

    if (logoFile) {
      logoUrl = await this.storageService.uploadFile(logoFile, 'company-logos');
    }
    if (licenseFile) {
      licenseFileUrl = await this.storageService.uploadFile(
        licenseFile,
        'company-licenses',
      );
    }

    // 2. Hash password and save to DB
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: dto.email,
            phone: dto.phone,
            password: hashedPassword,
            role: Role.COMPANY,
          },
        });

        const profile = await tx.companyProfile.create({
          data: {
            userId: user.id,
            name: dto.name,
            services: dto.services,
            hqLocation: dto.hqLocation,
            serviceAreas: dto.serviceAreas,
            about: dto.about,
            licenseActivity: dto.licenseActivity,
            licenseNumber: dto.licenseNumber,
            licenseExpiry: dto.licenseExpiry,
            logoUrl: logoUrl,
            licenseFileUrl: licenseFileUrl,
          },
        });

        // Add ReviewRequest for Option C
        await tx.reviewRequest.create({
          data: {
            companyProfileId: profile.id,
            status: 'PENDING',
            notes: 'طلب تسجيل شركة جديدة',
          },
        });

        // Create the Identity record auth/login relies on.
        await tx.identity.create({
          data: {
            userId: user.id,
            type: IdentityType.COMPANY,
            isActive: true,
            companyData: {
              create: {
                name: dto.name,
                services: dto.services,
                hqLocation: dto.hqLocation,
                serviceAreas: dto.serviceAreas,
                about: dto.about,
                licenseActivity: dto.licenseActivity,
                licenseNumber: dto.licenseNumber,
                licenseExpiry: dto.licenseExpiry,
                logoUrl: logoUrl,
                licenseFileUrl: licenseFileUrl,
              },
            },
          },
        });

        return { user, profile };
      });

      // Remove password from response
      const userWithoutPassword = { ...result.user };
      delete (userWithoutPassword as Partial<typeof userWithoutPassword>)
        .password;
      return { user: userWithoutPassword, profile: result.profile };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('حدث خطأ أثناء إنشاء حساب الشركة');
    }
  }

  // --- Register Office ---
  async registerOffice(
    dto: RegisterOfficeDto,
    logoFile?: Express.Multer.File,
    licenseFile?: Express.Multer.File,
  ) {
    await checkUserExists(this.prisma, dto.email, dto.phone);

    // 1. Upload files to S3 if they exist
    let logoUrl: string | null = null;
    let licenseFileUrl: string | null = null;

    if (logoFile) {
      logoUrl = await this.storageService.uploadFile(logoFile, 'office-logos');
    }
    if (licenseFile) {
      licenseFileUrl = await this.storageService.uploadFile(
        licenseFile,
        'office-licenses',
      );
    }

    // 2. Hash password and save to DB
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: dto.email,
            phone: dto.phone,
            password: hashedPassword,
            role: Role.OFFICE,
          },
        });

        const profile = await tx.officeProfile.create({
          data: {
            userId: user.id,
            name: dto.name,
            services: dto.services,
            hqLocation: dto.hqLocation,
            about: dto.about,
            licenseActivity: dto.licenseActivity,
            licenseNumber: dto.licenseNumber,
            licenseExpiry: dto.licenseExpiry,
            logoUrl: logoUrl,
            licenseFileUrl: licenseFileUrl,
          },
        });

        // Add ReviewRequest for Option C
        await tx.reviewRequest.create({
          data: {
            officeProfileId: profile.id,
            status: 'PENDING',
            notes: 'طلب تسجيل مكتب عقاري جديد',
          },
        });

        // Create the Identity record auth/login relies on.
        await tx.identity.create({
          data: {
            userId: user.id,
            type: IdentityType.OFFICE,
            isActive: true,
            officeData: {
              create: {
                name: dto.name,
                services: dto.services,
                hqLocation: dto.hqLocation,
                about: dto.about,
                licenseActivity: dto.licenseActivity,
                licenseNumber: dto.licenseNumber,
                licenseExpiry: dto.licenseExpiry,
                logoUrl: logoUrl,
                licenseFileUrl: licenseFileUrl,
              },
            },
          },
        });

        return { user, profile };
      });

      // Remove password from response
      const userWithoutPassword = { ...result.user };
      delete (userWithoutPassword as Partial<typeof userWithoutPassword>)
        .password;
      return { user: userWithoutPassword, profile: result.profile };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('حدث خطأ أثناء إنشاء حساب المكتب');
    }
  }
}
