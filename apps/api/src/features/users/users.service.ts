import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { RegisterCompanyDto, RegisterIndividualDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper to check for existing users
  private async checkUserExists(email?: string, phone?: string) {
    const conditions: Record<string, string>[] = [];
    if (email) conditions.push({ email });
    if (phone) conditions.push({ phone });

    if (conditions.length === 0) return;

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: conditions,
      },
    });

    if (existingUser) {
      if (email && existingUser.email === email)
        throw new ConflictException('البريد الإلكتروني مسجل بالفعل');
      if (phone && existingUser.phone === phone)
        throw new ConflictException('رقم الهاتف مسجل بالفعل');
    }
  }

  // --- Register Individual ---
  async registerIndividual(dto: RegisterIndividualDto) {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.identifier);
    const isPhone = /^[569]\d{7}$|^01[0125][0-9]{8}$/.test(dto.identifier); // Kuwait or Egypt

    if (!isEmail && !isPhone) {
      throw new BadRequestException('يجب إدخال بريد إلكتروني أو رقم هاتف صالح');
    }

    const email = isEmail ? dto.identifier : undefined;
    const phone = isPhone ? dto.identifier : undefined;

    await this.checkUserExists(email, phone);

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      // Transaction ensures both records are created, or neither are.
      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: email || null,
            phone: phone || null,
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
  async registerCompany(dto: RegisterCompanyDto) {
    await this.checkUserExists(dto.email, dto.phone);

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
            licenseExpiry: dto.licenseExpiry,
            // logoUrl and licenseFileUrl will be handled in Epic 5 (File Uploads)
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
}
