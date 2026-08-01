import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { IdentityType } from '@prisma/client';
import {
  CreateIndividualIdentityDto,
  CreateCompanyIdentityDto,
  CreateOfficeIdentityDto,
  UpdateIndividualIdentityDto,
  UpdateCompanyIdentityDto,
  UpdateOfficeIdentityDto,
} from './dto';

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
  constructor(private readonly prisma: PrismaService) {}

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
    // Check if user already has an individual identity
    const existingIndividual = await this.prisma.identity.findFirst({
      where: {
        userId,
        type: IdentityType.INDIVIDUAL,
      },
    });

    if (existingIndividual) {
      throw new BadRequestException('لديك بالفعل هوية فردية');
    }

    // Check if this is the first identity
    const identityCount = await this.prisma.identity.count({
      where: { userId },
    });
    const isFirstIdentity = identityCount === 0;

    return this.prisma.identity.create({
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
  }

  // Create company identity
  async createCompany(userId: string, dto: CreateCompanyIdentityDto) {
    // Check if this is the first identity
    const identityCount = await this.prisma.identity.count({
      where: { userId },
    });
    const isFirstIdentity = identityCount === 0;

    return this.prisma.identity.create({
      data: {
        userId,
        type: IdentityType.COMPANY,
        isActive: isFirstIdentity,
        companyData: {
          create: {
            name: dto.name,
            licenseNumber: dto.licenseNumber,
            services: dto.services,
            hqLocation: dto.hqLocation,
            serviceAreas: dto.serviceAreas,
            about: dto.about,
            licenseActivity: dto.licenseActivity,
            licenseExpiry: dto.licenseExpiry,
            logoUrl: dto.logoUrl,
            licenseFileUrl: dto.licenseFileUrl,
            latitude: dto.latitude,
            longitude: dto.longitude,
            specialty: dto.specialty,
          },
        },
      },
      include: IDENTITY_INCLUDE,
    });
  }

  // Create office identity
  async createOffice(userId: string, dto: CreateOfficeIdentityDto) {
    // Check if this is the first identity
    const identityCount = await this.prisma.identity.count({
      where: { userId },
    });
    const isFirstIdentity = identityCount === 0;

    return this.prisma.identity.create({
      data: {
        userId,
        type: IdentityType.OFFICE,
        isActive: isFirstIdentity,
        officeData: {
          create: {
            name: dto.name,
            licenseNumber: dto.licenseNumber,
            services: dto.services,
            hqLocation: dto.hqLocation,
            about: dto.about,
            licenseActivity: dto.licenseActivity,
            licenseExpiry: dto.licenseExpiry,
            logoUrl: dto.logoUrl,
            licenseFileUrl: dto.licenseFileUrl,
          },
        },
      },
      include: IDENTITY_INCLUDE,
    });
  }

  // Update identity
  async update(
    userId: string,
    identityId: string,
    dto:
      | UpdateIndividualIdentityDto
      | UpdateCompanyIdentityDto
      | UpdateOfficeIdentityDto,
  ) {
    const identity = await this.findOne(userId, identityId);

    if (identity.type === IdentityType.INDIVIDUAL) {
      const individualDto = dto as UpdateIndividualIdentityDto;
      await this.prisma.individualIdentityData.update({
        where: { identityId },
        data: {
          name: individualDto.name,
          whatsapp: individualDto.whatsapp,
          avatarUrl: individualDto.avatarUrl,
        },
      });
    } else if (identity.type === IdentityType.COMPANY) {
      const companyDto = dto as UpdateCompanyIdentityDto;
      await this.prisma.companyIdentityData.update({
        where: { identityId },
        data: {
          name: companyDto.name,
          licenseNumber: companyDto.licenseNumber,
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
      const officeDto = dto as UpdateOfficeIdentityDto;
      await this.prisma.officeIdentityData.update({
        where: { identityId },
        data: {
          name: officeDto.name,
          licenseNumber: officeDto.licenseNumber,
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
