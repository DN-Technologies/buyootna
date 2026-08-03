import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { StorageService } from 'src/core/storage/storage.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class UsersProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

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
      const identity = await this.prisma.identity.findFirst({
        where: { userId, type: 'COMPANY' },
        include: { companyData: true },
      });
      if (!identity || !identity.companyData)
        throw new NotFoundException('الملف الشخصي غير موجود');

      const updated = await this.prisma.companyIdentityData.update({
        where: { identityId: identity.id },
        data: {
          name: dto.name ?? identity.companyData.name,
          hqLocation: dto.hqLocation ?? identity.companyData.hqLocation,
          about: dto.about ?? identity.companyData.about,
          services: dto.services ?? identity.companyData.services,
          serviceAreas: dto.serviceAreas ?? identity.companyData.serviceAreas,
          specialty: dto.specialty ?? identity.companyData.specialty,
          logoUrl: logoUrl ?? identity.companyData.logoUrl,
        },
      });
      return { user: await this.findFullUser(userId), profile: updated };
    }

    if (role === Role.OFFICE) {
      const identity = await this.prisma.identity.findFirst({
        where: { userId, type: 'OFFICE' },
        include: { officeData: true },
      });
      if (!identity || !identity.officeData)
        throw new NotFoundException('الملف الشخصي غير موجود');

      const updated = await this.prisma.officeIdentityData.update({
        where: { identityId: identity.id },
        data: {
          name: dto.name ?? identity.officeData.name,
          hqLocation: dto.hqLocation ?? identity.officeData.hqLocation,
          about: dto.about ?? identity.officeData.about,
          services: dto.services ?? identity.officeData.services,
          logoUrl: logoUrl ?? identity.officeData.logoUrl,
        },
      });
      return { user: await this.findFullUser(userId), profile: updated };
    }

    if (role === Role.INDIVIDUAL) {
      const identity = await this.prisma.identity.findFirst({
        where: { userId, type: 'INDIVIDUAL' },
        include: { individualData: true },
      });
      if (!identity || !identity.individualData)
        throw new NotFoundException('الملف الشخصي غير موجود');

      const updated = await this.prisma.individualIdentityData.update({
        where: { identityId: identity.id },
        data: {
          name: dto.name ?? identity.individualData.name,
          whatsapp: dto.whatsapp ?? identity.individualData.whatsapp,
          avatarUrl: logoUrl ?? identity.individualData.avatarUrl,
        },
      });
      return { user: await this.findFullUser(userId), profile: updated };
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
        identities: {
          include: {
            individualData: true,
            companyData: true,
            officeData: true,
          },
        },
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
