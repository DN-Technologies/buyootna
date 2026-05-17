import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { RegisterCompanyDto, RegisterIndividualDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { checkUserExists, isEmail, isPhone } from '../../core/utils/user.utils';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Register Individual ---
  async registerIndividual(dto: RegisterIndividualDto) {
    const validEmail = isEmail(dto.identifier);
    const validPhone = isPhone(dto.identifier);

    if (!validEmail && !validPhone) {
      throw new BadRequestException('يجب إدخال بريد إلكتروني أو رقم هاتف صالح');
    }

    const email = validEmail ? dto.identifier : undefined;
    const phone = validPhone ? dto.identifier : undefined;

    await checkUserExists(this.prisma, email, phone);

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
    await checkUserExists(this.prisma, dto.email, dto.phone);

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
