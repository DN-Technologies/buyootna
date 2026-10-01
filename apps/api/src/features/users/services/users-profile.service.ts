import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import {
  NAME_REGEX,
  NAME_REGEX_MESSAGE,
} from '../../../core/validators/name.regex';
import { StorageService } from 'src/core/storage/storage.service';
import { CreateProjectDto } from '../../company/dto/create-project.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { AccountStateService } from './account-state.service';

// Last 8 digits: "+96599998888", "96599998888" and "99998888" are one number
function localPhone(phone?: string | null): string {
  return (phone ?? '').replace(/\D/g, '').slice(-8);
}

@Injectable()
export class UsersProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly accountState: AccountStateService,
  ) {}

  // --- Update Profile ---
  async updateProfile(
    userId: string,
    role: Role,
    dto: UpdateProfileDto,
    logoFile?: Express.Multer.File,
  ) {
    // A person's name is restricted to letters/spaces (see name.regex.ts) --
    // company/office names legitimately contain digits and symbols (e.g.
    // "24/7 Real Estate Co."), so this only applies to individual profiles,
    // unlike RegisterIndividualDto where the DTO itself is individual-only.
    if (
      role === Role.INDIVIDUAL &&
      dto.name !== undefined &&
      !NAME_REGEX.test(dto.name)
    ) {
      throw new BadRequestException(NAME_REGEX_MESSAGE);
    }

    // 1. Update basic user fields if provided
    const userUpdateData: Prisma.UserUpdateInput = {};
    if (dto.name !== undefined) userUpdateData.name = dto.name;
    // The phone is a sign-in identifier, so a new number only lands through
    // the SMS check (POST /users/account/phone/verify). The unchanged number,
    // which the app sends back on every save, is simply left as it is.
    if (dto.phone !== undefined) {
      const current = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { phone: true },
      });
      if (localPhone(dto.phone) !== localPhone(current?.phone)) {
        throw new BadRequestException({
          statusCode: 400,
          code: 'PHONE_VERIFICATION_REQUIRED',
          message: 'لتغيير رقم الهاتف يجب التحقق منه برمز يُرسل إليه.',
        });
      }
    }
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

  // --- Create Portfolio Project (company accounts only) ---
  async createProject(userId: string, dto: CreateProjectDto) {
    const identity = await this.prisma.identity.findFirst({
      where: { userId, type: 'COMPANY' },
      include: { companyData: true },
    });
    if (!identity || !identity.companyData) {
      throw new NotFoundException('الملف الشخصي للشركة غير موجود');
    }

    const project = await this.prisma.companyProject.create({
      data: {
        identityId: identity.id,
        title: dto.title,
        description: dto.description,
        images: dto.images,
      },
    });

    return { success: true, project };
  }

  // --- List/delete own portfolio projects (company accounts only) ---
  async listMyProjects(userId: string) {
    const identity = await this.prisma.identity.findFirst({
      where: { userId, type: 'COMPANY' },
    });
    if (!identity) {
      throw new NotFoundException('الملف الشخصي للشركة غير موجود');
    }

    return this.prisma.companyProject.findMany({
      where: { identityId: identity.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteMyProject(userId: string, projectId: string) {
    const identity = await this.prisma.identity.findFirst({
      where: { userId, type: 'COMPANY' },
    });
    if (!identity) {
      throw new NotFoundException('الملف الشخصي للشركة غير موجود');
    }

    const project = await this.prisma.companyProject.findUnique({
      where: { id: projectId },
    });
    if (!project || project.identityId !== identity.id) {
      throw new NotFoundException('المشروع غير موجود');
    }

    await this.prisma.companyProject.delete({ where: { id: projectId } });
    return { success: true, message: 'تم حذف المشروع بنجاح' };
  }

  async deleteAccount(userId: string) {
    await this.prisma.user.delete({
      where: { id: userId },
    });
    return { success: true, message: 'تم حذف الحساب بنجاح' };
  }

  // Older app builds' "disable" (no code, no reasons): the same
  // self-deactivation as the suspend flow, so signing in brings it back and
  // every device is signed out -- not an admin-style lock-out
  async disableAccount(userId: string) {
    await this.accountState.deactivateByUser(userId, { reasons: [] });
    return { success: true, message: 'تم تعطيل الحساب بنجاح' };
  }

  async updateRole(userId: string, role: Role) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  private readonly fullUserSelect = {
    id: true,
    email: true,
    phone: true,
    role: true,
    freeAdsRemaining: true,
    name: true,
    whatsapp: true,
    avatarUrl: true,
    isDisabled: true,
    isBlocked: true,
    isAdmin: true,
    identities: {
      include: {
        individualData: true,
        companyData: true,
        officeData: true,
      },
    },
  } satisfies Prisma.UserSelect;

  async findFullUser(userId: string) {
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: this.fullUserSelect,
    });

    // `userId` is sometimes actually an Identity id — e.g. property listings
    // expose `host.id` as the owning Identity's id, not the User's id.
    // Fall back to resolving it via the Identity table, mirroring the same
    // OR-based fallback already used for company/office identity lookups.
    if (!user) {
      const identity = await this.prisma.identity.findUnique({
        where: { id: userId },
        select: { userId: true },
      });

      if (identity) {
        user = await this.prisma.user.findUnique({
          where: { id: identity.userId },
          select: this.fullUserSelect,
        });
      }
    }

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
