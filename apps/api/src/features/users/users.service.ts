import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import {
  RegisterCompanyDto,
  RegisterIndividualDto,
  RegisterOfficeDto,
} from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';
import { checkUserExists } from '../../core/utils/user.utils';
import { StorageService } from 'src/core/storage/storage.service';
import { GetCompaniesFilterDto } from './dto/get-companies-filter.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  // --- Register Individual ---
  async registerIndividual(dto: RegisterIndividualDto) {
    await checkUserExists(this.prisma, dto.email, dto.phone);

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      // Transaction ensures both records are created, or neither are.
      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: dto.email,
            phone: dto.phone,
            password: hashedPassword,
            role: Role.INDIVIDUAL,
          },
        });

        const profile = await tx.individualProfile.create({
          data: { userId: user.id },
        });

        // Generate a 6-digit random registration OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await tx.otpCode.create({
          data: {
            userId: user.id,
            code: otp,
            expiresAt,
          },
        });

        console.log(
          `\n🔑 [MOCK SMS] Your Registration OTP for user ${dto.phone} is: ${otp}\n`,
        );

        return { user, profile };
      });

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

  // --- Find Companies ---
  async findCompanies(filters: GetCompaniesFilterDto) {
    const { category, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    // Build the query
    const whereClause: Prisma.UserWhereInput = {
      role: 'COMPANY',
      companyProfile: {
        isNot: null,
        is: {
          status: 'APPROVED',
        },
      },
    };

    // If the frontend sends a category filter (and it's not 'all'), filter by the services string
    if (category && category !== 'all') {
      whereClause.companyProfile = {
        isNot: null,
        is: {
          status: 'APPROVED',
          services: {
            contains: category, // Matches substrings like 'تشطيب'
            mode: 'insensitive',
          },
        },
      };
    }

    // Run data and count queries concurrently
    const [companies, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { companyProfile: true },
      }),
      this.prisma.user.count({ where: whereClause }),
    ]);

    // Format for React Native
    const formattedCompanies = companies
      .filter((c) => c.companyProfile !== null)
      .map((c) => ({
        id: c.companyProfile!.id,
        name: c.companyProfile!.name,
        category: c.companyProfile!.services || '',
        rating: 4.5, // Placeholder
        projectsCount: '+50', // Placeholder
        serviceArea: c.companyProfile!.serviceAreas,
        logoUrl: c.companyProfile!.logoUrl,
        isVerified: c.companyProfile!.isVerified,
      }));

    return {
      data: formattedCompanies,
      meta: {
        total: totalCount,
        current: page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
      },
    };
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

  // --- Update Profile ---
  async updateProfile(
    userId: string,
    role: Role,
    dto: UpdateProfileDto,
    logoFile?: Express.Multer.File,
  ) {
    // 1. Update basic user fields if provided
    const userUpdateData: Prisma.UserUpdateInput = {};
    if (dto.name !== undefined) userUpdateData.name = dto.name;
    if (dto.phone !== undefined) userUpdateData.phone = dto.phone;
    if (dto.email !== undefined) userUpdateData.email = dto.email;
    if (dto.whatsapp !== undefined) userUpdateData.whatsapp = dto.whatsapp;

    // 2. Handle file upload if a new logo/avatar is uploaded
    let logoUrl: string | undefined = undefined;
    if (logoFile) {
      const folder =
        role === Role.COMPANY
          ? 'company-logos'
          : role === Role.OFFICE
            ? 'office-logos'
            : 'avatars';
      logoUrl = await this.storageService.uploadFile(logoFile, folder);
    }

    if (logoUrl) {
      userUpdateData.avatarUrl = logoUrl;
    } else if (dto.avatarUrl !== undefined) {
      userUpdateData.avatarUrl = dto.avatarUrl;
    }

    if (Object.keys(userUpdateData).length > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: userUpdateData,
      });
    }

    if (role === Role.COMPANY) {
      const profile = await this.prisma.companyProfile.findUnique({
        where: { userId },
      });
      if (!profile) throw new NotFoundException('الملف الشخصي غير موجود');

      const updated = await this.prisma.companyProfile.update({
        where: { userId },
        data: {
          name: dto.name ?? profile.name,
          hqLocation: dto.hqLocation ?? profile.hqLocation,
          about: dto.about ?? profile.about,
          services: dto.services ?? profile.services,
          serviceAreas: dto.serviceAreas ?? profile.serviceAreas,
          specialty: dto.specialty ?? profile.specialty,
          logoUrl: logoUrl ?? profile.logoUrl,
        },
      });
      return { user: await this.findFullUser(userId), profile: updated };
    }

    if (role === Role.OFFICE) {
      const profile = await this.prisma.officeProfile.findUnique({
        where: { userId },
      });
      if (!profile) throw new NotFoundException('الملف الشخصي غير موجود');

      const updated = await this.prisma.officeProfile.update({
        where: { userId },
        data: {
          name: dto.name ?? profile.name,
          hqLocation: dto.hqLocation ?? profile.hqLocation,
          about: dto.about ?? profile.about,
          services: dto.services ?? profile.services,
          logoUrl: logoUrl ?? profile.logoUrl,
        },
      });
      return { user: await this.findFullUser(userId), profile: updated };
    }

    if (role === Role.INDIVIDUAL) {
      const profile = await this.prisma.individualProfile.findUnique({
        where: { userId },
      });
      if (!profile) throw new NotFoundException('الملف الشخصي غير موجود');
      return { user: await this.findFullUser(userId), profile };
    }

    throw new InternalServerErrorException('نوع الحساب غير صالح');
  }

  async deleteAccount(userId: string) {
    await this.prisma.user.delete({
      where: { id: userId },
    });
    return { success: true, message: 'تم حذف الحساب بنجاح' };
  }

  async disableAccount(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isDisabled: true },
    });
    return { success: true, message: 'تم تعطيل الحساب بنجاح' };
  }

  async updateRole(userId: string, role: Role) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  async findFullUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        freeAdsRemaining: true,
        name: true,
        whatsapp: true,
        avatarUrl: true,
        isDisabled: true,
        individualProfile: true,
        companyProfile: true,
        officeProfile: true,
      },
    });

    if (!user) return null;

    const hasSubscription =
      user.role === 'COMPANY' ||
      user.role === 'OFFICE' ||
      (user.email
        ? user.email.includes('sub') || user.email === 'youssef@youssef.app'
        : false);

    return {
      ...user,
      hasSubscription,
      subscription: hasSubscription
        ? {
            goldRemaining: 5,
            silverRemaining: 12,
            normalRemaining: 1,
          }
        : null,
    };
  }
}
