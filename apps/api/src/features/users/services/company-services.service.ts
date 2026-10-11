import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import {
  CreateCompanyServiceDto,
  OTHER_SERVICE_TYPE,
} from '../../company/dto/create-company-service.dto';

// What a service is called on the profile: its own title for "اخرى"
const displayName = (service: { type: string; title: string | null }) =>
  service.type === OTHER_SERVICE_TYPE && service.title
    ? service.title
    : service.type;

// The legacy `services` text is a "،"-separated list (see formatServiceList)
const splitLegacy = (raw: string | null) =>
  (raw ?? '')
    .split(/[,،\n]/)
    .map((part) => part.trim())
    .filter(Boolean);

/**
 * A company's services (اضافة خدمة). Each chosen type is a CompanyService
 * row. The company's `specialty` is set by its first service and fixed
 * after that, and the legacy `services` text is kept in step so search,
 * the directory and company cards keep reading it unchanged.
 */
@Injectable()
export class CompanyServicesService {
  constructor(private readonly prisma: PrismaService) {}

  private async findCompany(userId: string) {
    const identity = await this.prisma.identity.findFirst({
      where: { userId, type: 'COMPANY' },
      include: { companyData: true },
    });
    if (!identity || !identity.companyData) {
      throw new NotFoundException('الملف الشخصي للشركة غير موجود');
    }
    return { identity, companyData: identity.companyData };
  }

  async create(userId: string, dto: CreateCompanyServiceDto) {
    const { identity, companyData } = await this.findCompany(userId);

    if (companyData.specialty && companyData.specialty !== dto.specialty) {
      throw new BadRequestException('لا يمكن تغيير تخصص الشركة');
    }
    const hasOther = dto.types.includes(OTHER_SERVICE_TYPE);
    if (hasOther && !dto.title) {
      throw new BadRequestException('عنوان الخدمة مطلوب عند اختيار اخرى');
    }

    const existing = await this.prisma.companyService.findMany({
      where: { identityId: identity.id },
    });
    const taken = new Set(existing.map(displayName));

    // A type the company already offers is skipped, not duplicated
    const rows = dto.types
      .map((type) => ({
        identityId: identity.id,
        specialty: dto.specialty,
        type,
        title: type === OTHER_SERVICE_TYPE ? (dto.title ?? null) : null,
        description: dto.description || null,
      }))
      .filter((row) => !taken.has(displayName(row)));

    if (rows.length === 0) {
      throw new BadRequestException('هذه الخدمات مضافة مسبقاً');
    }

    const legacy = splitLegacy(companyData.services);
    const merged = [
      ...legacy,
      ...rows.map(displayName).filter((name) => !legacy.includes(name)),
    ];

    const [, , services] = await this.prisma.$transaction([
      this.prisma.companyService.createMany({ data: rows }),
      this.prisma.companyIdentityData.update({
        where: { identityId: identity.id },
        data: { specialty: dto.specialty, services: merged.join('، ') },
      }),
      this.prisma.companyService.findMany({
        where: { identityId: identity.id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { success: true, created: rows.length, services };
  }

  async listMine(userId: string) {
    const { identity, companyData } = await this.findCompany(userId);
    const services = await this.prisma.companyService.findMany({
      where: { identityId: identity.id },
      orderBy: { createdAt: 'desc' },
    });
    return { specialty: companyData.specialty, services };
  }

  async deleteMine(userId: string, serviceId: string) {
    const { identity, companyData } = await this.findCompany(userId);
    const service = await this.prisma.companyService.findUnique({
      where: { id: serviceId },
    });
    if (!service || service.identityId !== identity.id) {
      throw new NotFoundException('الخدمة غير موجودة');
    }

    const name = displayName(service);
    const remaining = splitLegacy(companyData.services).filter(
      (part) => part !== name,
    );

    await this.prisma.$transaction([
      this.prisma.companyService.delete({ where: { id: serviceId } }),
      this.prisma.companyIdentityData.update({
        where: { identityId: identity.id },
        data: { services: remaining.length ? remaining.join('، ') : null },
      }),
    ]);

    return { success: true };
  }
}
