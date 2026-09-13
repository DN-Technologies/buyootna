import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { NAME_REGEX, NAME_REGEX_MESSAGE } from '../../../core/validators/name.regex';
import { StorageService } from 'src/core/storage/storage.service';
import { CreateCompanyInvoiceDto } from '../dto/create-company-invoice.dto';
import { CreateProjectDto } from '../dto/create-project.dto';
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

  // --- Customer invoices (company accounts only) ---
  async createInvoice(userId: string, dto: CreateCompanyInvoiceDto) {
    const identity = await this.prisma.identity.findFirst({
      where: { userId, type: 'COMPANY' },
      include: { companyData: true },
    });
    if (!identity || !identity.companyData) {
      throw new NotFoundException('الملف الشخصي للشركة غير موجود');
    }

    // Server-side totals — the client's numbers are never trusted.
    const subtotal = dto.items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    );
    const discount = Math.min(dto.discount ?? 0, subtotal);
    const total = subtotal - discount;

    const invoiceNo = await this.generateInvoiceNo();

    const invoice = await this.prisma.companyInvoice.create({
      data: {
        identityId: identity.id,
        invoiceNo,
        clientName: dto.clientName,
        title: dto.title,
        warrantyMonths: dto.warrantyMonths,
        issueDate: new Date(dto.issueDate),
        items: dto.items as unknown as Prisma.InputJsonValue,
        subtotal,
        discount,
        total,
      },
    });

    return { success: true, invoice };
  }

  async listInvoices(userId: string) {
    const identity = await this.prisma.identity.findFirst({
      where: { userId, type: 'COMPANY' },
    });
    if (!identity) {
      throw new NotFoundException('الملف الشخصي للشركة غير موجود');
    }

    return this.prisma.companyInvoice.findMany({
      where: { identityId: identity.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Generates a unique INV-YYYY-NNNNNN number based on the count of the
   * company's existing invoices, retrying on the (unlikely) unique-constraint
   * collision with concurrent invoices.
   */
  private async generateInvoiceNo(): Promise<string> {
    const year = new Date().getFullYear();
    for (let attempt = 0; attempt < 5; attempt++) {
      const count = await this.prisma.companyInvoice.count({
        where: { invoiceNo: { startsWith: `INV-${year}-` } },
      });
      const candidate = `INV-${year}-${String(count + 1).padStart(6, '0')}`;
      const exists = await this.prisma.companyInvoice.findUnique({
        where: { invoiceNo: candidate },
      });
      if (!exists) return candidate;
    }
    // Fall back to a random suffix after repeated collisions.
    return `INV-${year}-${String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')}`;
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
