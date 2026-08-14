import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IdentityType, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { StorageService } from 'src/core/storage/storage.service';
import { TwilioService } from 'src/core/twilio/twilio.service';
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
  ) {}

  // --- Register Individual ---
  async registerIndividual(dto: RegisterIndividualDto) {
    const email = isEmail(dto.identifier) ? dto.identifier : undefined;
    const phone = isPhone(dto.identifier) ? dto.identifier : undefined;

    await checkUserExists(this.prisma, email, phone);

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      // Transaction ensures both records are created, or neither are.
      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            phone,
            password: hashedPassword,
            role: Role.INDIVIDUAL,
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
            individualData: { create: {} },
          },
        });

        return { user, profile };
      });

      // Send Twilio Verify SMS OTP
      if (phone) {
        await this.twilioService.sendVerification(phone);
      }

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
