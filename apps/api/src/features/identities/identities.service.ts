import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { IdentityType, Prisma } from '@prisma/client';
import { StorageService } from 'src/core/storage/storage.service';
import { grantTrialIfNew } from '../company-subscriptions/company-subscription.rules';
import {
  CreateIndividualIdentityDto,
  CreateCompanyIdentityDto,
  CreateOfficeIdentityDto,
  UpdateIndividualIdentityDto,
  UpdateCompanyIdentityDto,
  UpdateOfficeIdentityDto,
} from './dto';
import {
  assertLicenseAvailable,
  assertNoPersonaOfType,
  lockKeys,
  normalizeLicenseNumber,
  rethrowAsConflict,
} from './persona-rules';

type ProviderType = Extract<IdentityType, 'COMPANY' | 'OFFICE'>;

// The company/office fields both signup paths collect (files resolved to URLs)
export interface ProviderPersonaData {
  name: string;
  licenseNumber: string;
  services?: string;
  hqLocation?: string;
  serviceAreas?: string;
  about?: string;
  licenseActivity?: string;
  licenseExpiry?: string;
  logoUrl?: string | null;
  licenseFileUrl?: string | null;
  latitude?: number | string;
  longitude?: number | string;
  specialty?: string;
}

const UPLOAD_FOLDERS: Record<ProviderType, { logo: string; license: string }> =
  {
    COMPANY: { logo: 'company-logos', license: 'company-licenses' },
    OFFICE: { logo: 'office-logos', license: 'office-licenses' },
  };

const IDENTITY_INCLUDE = {
  individualData: {
    select: {
      id: true,
      name: true,
      whatsapp: true,
      avatarUrl: true,
    },
  },
  companyData: {
    select: {
      id: true,
      name: true,
      services: true,
      hqLocation: true,
      serviceAreas: true,
      about: true,
      licenseActivity: true,
      licenseNumber: true,
      licenseExpiry: true,
      logoUrl: true,
      licenseFileUrl: true,
      latitude: true,
      longitude: true,
      specialty: true,
      isVerified: true,
      status: true,
    },
  },
  officeData: {
    select: {
      id: true,
      name: true,
      services: true,
      hqLocation: true,
      about: true,
      licenseActivity: true,
      licenseNumber: true,
      licenseExpiry: true,
      logoUrl: true,
      licenseFileUrl: true,
      isVerified: true,
      status: true,
    },
  },
};

@Injectable()
export class IdentitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  // List all identities for a user
  async findAll(userId: string) {
    return this.prisma.identity.findMany({
      where: { userId },
      include: IDENTITY_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
  }

  // Get active identity
  async findCurrent(userId: string, identityId: string) {
    const identity = await this.prisma.identity.findFirst({
      where: {
        id: identityId,
        userId,
      },
      include: IDENTITY_INCLUDE,
    });

    if (!identity) {
      throw new NotFoundException('الهوية غير موجودة');
    }

    return identity;
  }

  // Get identity by ID (with ownership check)
  async findOne(userId: string, identityId: string) {
    const identity = await this.prisma.identity.findFirst({
      where: {
        id: identityId,
        userId,
      },
      include: IDENTITY_INCLUDE,
    });

    if (!identity) {
      throw new NotFoundException('الهوية غير موجودة أو لا تنتمي لهذا الحساب');
    }

    return identity;
  }

  // Create individual identity
  async createIndividual(userId: string, dto: CreateIndividualIdentityDto) {
    await assertNoPersonaOfType(this.prisma, userId, IdentityType.INDIVIDUAL);
    try {
      return await this.prisma.$transaction(async (tx) => {
        await lockKeys(tx, `persona:${userId}:INDIVIDUAL`);
        await assertNoPersonaOfType(tx, userId, IdentityType.INDIVIDUAL);
        const isFirstIdentity =
          (await tx.identity.count({ where: { userId } })) === 0;

        return tx.identity.create({
          data: {
            userId,
            type: IdentityType.INDIVIDUAL,
            isActive: isFirstIdentity,
            individualData: {
              create: {
                name: dto.name,
                whatsapp: dto.whatsapp,
                avatarUrl: dto.avatarUrl,
              },
            },
          },
          include: IDENTITY_INCLUDE,
        });
      });
    } catch (error) {
      rethrowAsConflict(error);
    }
  }

  // Add a company persona to an existing account (in-app onboarding)
  createCompany(
    userId: string,
    dto: CreateCompanyIdentityDto,
    logoFile?: Express.Multer.File,
    licenseFile?: Express.Multer.File,
  ) {
    return this.createProviderPersona(
      IdentityType.COMPANY,
      userId,
      dto,
      logoFile,
      licenseFile,
    );
  }

  // Add an office persona to an existing account (in-app onboarding)
  createOffice(
    userId: string,
    dto: CreateOfficeIdentityDto,
    logoFile?: Express.Multer.File,
    licenseFile?: Express.Multer.File,
  ) {
    return this.createProviderPersona(
      IdentityType.OFFICE,
      userId,
      dto,
      logoFile,
      licenseFile,
    );
  }

  /**
   * Checks the rules first (so a refused request never uploads anything),
   * then uploads the files, then creates the persona. If the write fails
   * the uploaded files are deleted again.
   */
  private async createProviderPersona(
    type: ProviderType,
    userId: string,
    dto: ProviderPersonaData,
    logoFile?: Express.Multer.File,
    licenseFile?: Express.Multer.File,
  ) {
    const licenseNumber = normalizeLicenseNumber(dto.licenseNumber);
    await assertNoPersonaOfType(this.prisma, userId, type);
    await assertLicenseAvailable(this.prisma, licenseNumber);

    const uploaded = await this.uploadProviderFiles(
      type,
      logoFile,
      licenseFile,
    );
    try {
      return await this.prisma.$transaction(async (tx) => {
        const isFirstIdentity =
          (await tx.identity.count({ where: { userId } })) === 0;
        return this.createProviderPersonaInTx(
          tx,
          type,
          userId,
          { ...dto, ...pickDefined(uploaded) },
          { isActive: isFirstIdentity },
        );
      });
    } catch (error) {
      await this.deleteUploads(uploaded);
      rethrowAsConflict(error);
    }
  }

  /** Uploads the logo/licence files for a new company/office persona. */
  async uploadProviderFiles(
    type: ProviderType,
    logoFile?: Express.Multer.File,
    licenseFile?: Express.Multer.File,
  ): Promise<{ logoUrl?: string; licenseFileUrl?: string }> {
    const folders = UPLOAD_FOLDERS[type];
    const logoUrl = logoFile
      ? await this.storageService.uploadFile(logoFile, folders.logo)
      : undefined;
    try {
      const licenseFileUrl = licenseFile
        ? await this.storageService.uploadFile(licenseFile, folders.license)
        : undefined;
      return { logoUrl, licenseFileUrl };
    } catch (error) {
      await this.storageService.deleteFile(logoUrl);
      throw error;
    }
  }

  async deleteUploads(uploaded: { logoUrl?: string; licenseFileUrl?: string }) {
    await Promise.all([
      this.storageService.deleteFile(uploaded.logoUrl),
      this.storageService.deleteFile(uploaded.licenseFileUrl),
    ]);
  }

  /**
   * THE one place a company/office persona is created -- used by in-app
   * onboarding above and by direct signup (UsersRegistrationService) inside
   * its own transaction. Enforces one-per-type and platform-wide licence
   * uniqueness under per-key locks. A company is approved from the start
   * (listed and usable at once, on its free trial); an office still waits
   * for an admin, so it opens the approval request.
   */
  async createProviderPersonaInTx(
    tx: Prisma.TransactionClient,
    type: ProviderType,
    userId: string,
    data: ProviderPersonaData,
    options: { isActive: boolean },
  ) {
    const licenseNumber = normalizeLicenseNumber(data.licenseNumber);
    await lockKeys(tx, `persona:${userId}:${type}`, `license:${licenseNumber}`);
    await assertNoPersonaOfType(tx, userId, type);
    await assertLicenseAvailable(tx, licenseNumber);

    const common = {
      name: data.name,
      licenseNumber,
      services: data.services,
      hqLocation: data.hqLocation,
      about: data.about,
      licenseActivity: data.licenseActivity,
      licenseExpiry: data.licenseExpiry,
      logoUrl: data.logoUrl ?? null,
      licenseFileUrl: data.licenseFileUrl ?? null,
    };

    const identity = await tx.identity.create({
      data: {
        userId,
        type,
        isActive: options.isActive,
        ...(type === IdentityType.COMPANY
          ? {
              companyData: {
                create: {
                  ...common,
                  // No admin wait for companies. `isVerified` (the badge)
                  // stays off until an admin has checked the licence
                  status: 'APPROVED',
                  serviceAreas: data.serviceAreas,
                  specialty: data.specialty,
                  latitude:
                    data.latitude !== undefined && data.latitude !== ''
                      ? Number(data.latitude)
                      : undefined,
                  longitude:
                    data.longitude !== undefined && data.longitude !== ''
                      ? Number(data.longitude)
                      : undefined,
                },
              },
            }
          : { officeData: { create: common } }),
      },
      include: IDENTITY_INCLUDE,
    });

    if (type === IdentityType.COMPANY) {
      await grantTrialIfNew(tx, identity.id);
      return identity;
    }

    // Opens the admin approval request (a new office starts PENDING)
    await tx.reviewRequest.create({
      data: {
        status: 'PENDING',
        notes: 'طلب تسجيل مكتب عقاري جديد',
        officeIdentityDataId: identity.officeData!.id,
      },
    });

    return identity;
  }

  // Update identity. Company/office updates may attach a new logo and/or
  // licence file -- they are uploaded first and, if the write fails, deleted
  // again (the same rule createProviderPersona follows: a failed request
  // never leaves files behind).
  async update(
    userId: string,
    identityId: string,
    dto:
      | UpdateIndividualIdentityDto
      | UpdateCompanyIdentityDto
      | UpdateOfficeIdentityDto,
    logoFile?: Express.Multer.File,
    licenseFile?: Express.Multer.File,
  ) {
    const identity = await this.findOne(userId, identityId);

    // A changed licence number must still be free platform-wide
    const nextLicense = (
      dto as UpdateCompanyIdentityDto | UpdateOfficeIdentityDto
    ).licenseNumber;
    const licenseNumber = nextLicense
      ? normalizeLicenseNumber(nextLicense)
      : undefined;
    if (licenseNumber) {
      await assertLicenseAvailable(this.prisma, licenseNumber, identityId);
    }

    const hasFiles =
      identity.type !== IdentityType.INDIVIDUAL && !!(logoFile || licenseFile);
    const uploaded = hasFiles
      ? await this.uploadProviderFiles(
          identity.type as ProviderType,
          logoFile,
          licenseFile,
        )
      : {};
    const payload = hasFiles
      ? ({ ...dto, ...pickDefined(uploaded) } as typeof dto)
      : dto;

    try {
      if (identity.type === IdentityType.INDIVIDUAL) {
        const individualDto = payload as UpdateIndividualIdentityDto;
        await this.prisma.individualIdentityData.update({
          where: { identityId },
          data: {
            name: individualDto.name,
            whatsapp: individualDto.whatsapp,
            avatarUrl: individualDto.avatarUrl,
          },
        });
      } else if (identity.type === IdentityType.COMPANY) {
        const companyDto = payload as UpdateCompanyIdentityDto;
        await this.prisma.companyIdentityData.update({
          where: { identityId },
          data: {
            name: companyDto.name,
            licenseNumber,
            services: companyDto.services,
            hqLocation: companyDto.hqLocation,
            serviceAreas: companyDto.serviceAreas,
            about: companyDto.about,
            licenseActivity: companyDto.licenseActivity,
            licenseExpiry: companyDto.licenseExpiry,
            logoUrl: companyDto.logoUrl,
            licenseFileUrl: companyDto.licenseFileUrl,
            latitude: companyDto.latitude,
            longitude: companyDto.longitude,
            specialty: companyDto.specialty,
          },
        });
      } else if (identity.type === IdentityType.OFFICE) {
        const officeDto = payload as UpdateOfficeIdentityDto;
        await this.prisma.officeIdentityData.update({
          where: { identityId },
          data: {
            name: officeDto.name,
            licenseNumber,
            services: officeDto.services,
            hqLocation: officeDto.hqLocation,
            about: officeDto.about,
            licenseActivity: officeDto.licenseActivity,
            licenseExpiry: officeDto.licenseExpiry,
            logoUrl: officeDto.logoUrl,
            licenseFileUrl: officeDto.licenseFileUrl,
          },
        });
      }
    } catch (error) {
      if (uploaded.logoUrl || uploaded.licenseFileUrl) {
        await this.deleteUploads(uploaded);
      }
      throw error;
    }

    return this.findOne(userId, identityId);
  }

  // Delete identity
  async delete(userId: string, identityId: string) {
    const identity = await this.findOne(userId, identityId);

    // Count user's identities
    const identityCount = await this.prisma.identity.count({
      where: { userId },
    });

    // Cannot delete last identity
    if (identityCount === 1) {
      throw new BadRequestException('لا يمكن حذف آخر هوية لديك');
    }

    // Check if this identity has properties
    const propertyCount = await this.prisma.property.count({
      where: { identityId },
    });

    if (propertyCount > 0) {
      throw new BadRequestException(
        `لا يمكن حذف هذه الهوية لأنها تحتوي على ${propertyCount} عقار(ات). يرجى نقل أو حذف العقارات أولاً`,
      );
    }

    // If this was the active identity, activate another one
    if (identity.isActive) {
      const anotherIdentity = await this.prisma.identity.findFirst({
        where: {
          userId,
          id: { not: identityId },
        },
        orderBy: { createdAt: 'asc' },
      });

      if (anotherIdentity) {
        await this.prisma.identity.update({
          where: { id: anotherIdentity.id },
          data: { isActive: true },
        });
      }
    }

    // Delete the identity (cascade will delete profile data)
    await this.prisma.identity.delete({
      where: { id: identityId },
    });

    return { message: 'تم حذف الهوية بنجاح' };
  }

  // Get identity public profile (for viewing other users' profiles)
  async getPublicProfile(identityId: string) {
    const identity = await this.prisma.identity.findUnique({
      where: { id: identityId },
      include: {
        individualData: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
        companyData: {
          select: {
            name: true,
            services: true,
            hqLocation: true,
            serviceAreas: true,
            about: true,
            logoUrl: true,
            specialty: true,
            isVerified: true,
          },
        },
        officeData: {
          select: {
            name: true,
            services: true,
            hqLocation: true,
            about: true,
            logoUrl: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            properties: true,
            receivedReviews: true,
          },
        },
      },
    });

    if (!identity) {
      throw new NotFoundException('الهوية غير موجودة');
    }

    return identity;
  }
}

// Drops undefined keys so uploaded URLs only override what was actually sent
function pickDefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}
