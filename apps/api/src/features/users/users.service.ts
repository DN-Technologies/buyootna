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
      },
    };

    // If the frontend sends a category filter (and it's not 'all'), filter by the services string
    if (category && category !== 'all') {
      whereClause.companyProfile = {
        is: {
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
        isVerified: true,
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
    // 1. Handle file upload if a new logo is uploaded
    let logoUrl: string | undefined = undefined;
    if (logoFile) {
      const folder = role === Role.COMPANY ? 'company-logos' : 'office-logos';
      logoUrl = await this.storageService.uploadFile(logoFile, folder);
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
      return updated;
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
      return updated;
    }

    if (role === Role.INDIVIDUAL) {
      const profile = await this.prisma.individualProfile.findUnique({
        where: { userId },
      });
      if (!profile) throw new NotFoundException('الملف الشخصي غير موجود');
      // Individuals don't have fields in IndividualProfile yet, but we return success
      return profile;
    }

    throw new InternalServerErrorException('نوع الحساب غير صالح');
  }

  async findFullUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        freeAdsRemaining: true,
        individualProfile: true,
        companyProfile: true,
        officeProfile: true,
      },
    });
  }
}
