import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { assertCleanContent } from 'src/core/content-filter/content-filter';
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
  assertSpecialtyChangeAllowed,
  assertLicenseAvailable,
  assertNoPersonaOfType,
  lockKeys,
  normalizeLicenseNumber,
  rethrowAsConflict,
} from './persona-rules';
import { ABOUT_MAX_LENGTH } from '../../common/utils/location.util';
import { parseWorkingHours } from '../../common/utils/working-hours.util';

type ProviderType = Extract<IdentityType, 'COMPANY' | 'OFFICE'>;

// The company/office fields both signup paths collect (files resolved to URLs)
export interface ProviderPersonaData {
  name: string;
  // A company signs up without one (it comes with «طلب التوثيق»)
  licenseNumber?: string;
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

// A map coordinate from JSON (a number) or a multipart body (text);
// undefined when absent or not a number, so the stored one is kept
const toCoordinate = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
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
    await assertNoPersonaOfType(this.prisma, userId, type);
    // A company may come without a licence (it comes with «طلب التوثيق»)
    if (dto.licenseNumber?.trim()) {
      await assertLicenseAvailable(
        this.prisma,
        normalizeLicenseNumber(dto.licenseNumber),
      );
    }

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
    const licenseNumber = data.licenseNumber?.trim()
      ? normalizeLicenseNumber(data.licenseNumber)
      : null;
    // An office still registers with its licence; a company adds it later
    if (type === IdentityType.OFFICE && !licenseNumber) {
      throw new BadRequestException('رقم الرخصة مطلوب');
    }
    // «التخصص» (the services catalogue's مجال التخصص). Older app builds sent
    // only «النشاط», from the same list
    const specialty =
      data.specialty?.trim() || data.licenseActivity?.trim() || undefined;
    if (type === IdentityType.COMPANY && !specialty) {
      throw new BadRequestException('التخصص مطلوب');
    }
    await lockKeys(
      tx,
      `persona:${userId}:${type}`,
      ...(licenseNumber ? [`license:${licenseNumber}`] : []),
    );
    await assertNoPersonaOfType(tx, userId, type);
    if (licenseNumber) await assertLicenseAvailable(tx, licenseNumber);

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
                  specialty,
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
          : {
              officeData: {
                // Checked above: an office always has one
                create: { ...common, licenseNumber: licenseNumber! },
              },
            }),
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

    // The body is a union of three DTOs, which the global ValidationPipe
    // can't check, so the bio's length is checked here
    const about = (dto as UpdateCompanyIdentityDto | UpdateOfficeIdentityDto)
      .about;
    if (typeof about === 'string' && about.length > ABOUT_MAX_LENGTH) {
      throw new BadRequestException(
        `النبذة يجب ألا تتجاوز ${ABOUT_MAX_LENGTH} حرف`,
      );
    }
    assertCleanContent(dto.name, about);

    // مواعيد العمل, when sent: checked and normalised (400 if malformed)
    const rawHours = (dto as UpdateCompanyIdentityDto | UpdateOfficeIdentityDto)
      .workingHours;
    const parsedHours =
      rawHours === undefined ? undefined : parseWorkingHours(rawHours);
    const workingHours =
      parsedHours === undefined
        ? undefined
        : parsedHours === null
          ? Prisma.DbNull
          : (parsedHours as unknown as Prisma.InputJsonValue);

    // A company's licence changes only through «طلب التوثيق» (reviewed
    // before the «موثق» badge); edit profile can't touch it. An office
    // keeps editing its own here.
    const editsLicence = identity.type === IdentityType.OFFICE;
    // A changed licence number must still be free platform-wide
    const nextLicense = editsLicence
      ? (dto as UpdateOfficeIdentityDto).licenseNumber
      : undefined;
    const licenseNumber = nextLicense
      ? normalizeLicenseNumber(nextLicense)
      : undefined;
    if (licenseNumber) {
      await assertLicenseAvailable(this.prisma, licenseNumber, identityId);
    }

    const licenceUpload = editsLicence ? licenseFile : undefined;
    const hasFiles =
      identity.type !== IdentityType.INDIVIDUAL &&
      !!(logoFile || licenceUpload);
    const uploaded = hasFiles
      ? await this.uploadProviderFiles(
          identity.type as ProviderType,
          logoFile,
          licenceUpload,
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
        // Multipart forms send "" for untouched fields: never clear it
        const specialty = companyDto.specialty?.trim() || undefined;
        await assertSpecialtyChangeAllowed(
          this.prisma,
          identityId,
          (
            await this.prisma.companyIdentityData.findUnique({
              where: { identityId },
              select: { specialty: true },
            })
          )?.specialty,
          specialty,
        );
        await this.prisma.companyIdentityData.update({
          where: { identityId },
          data: {
            name: companyDto.name,
            services: companyDto.services,
            hqLocation: companyDto.hqLocation,
            serviceAreas: companyDto.serviceAreas,
            about: companyDto.about,
            logoUrl: companyDto.logoUrl,
            // Multipart bodies carry the map point as text
            latitude: toCoordinate(companyDto.latitude),
            longitude: toCoordinate(companyDto.longitude),
            specialty,
            workingHours,
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
            workingHours,
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
