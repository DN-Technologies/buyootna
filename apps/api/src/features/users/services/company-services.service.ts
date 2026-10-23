import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { assertCleanContent } from '../../../core/content-filter/content-filter';
import { assertActiveCompanySubscription } from '../../company-subscriptions/company-subscription.rules';
import {
  CreateCompanyServiceDto,
  OTHER_SERVICE_TYPE,
} from '../../company/dto/create-company-service.dto';
import type { UpdateCompanyServicesDto } from '../../company/dto/update-company-services.dto';

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
 * The legacy `services` text once some sub-services are hidden or shown:
 * the parts typed by hand (not any row's name) kept as they are, then the
 * names of the visible rows.
 */
export function legacyServicesText(
  current: string | null,
  rows: { type: string; title: string | null; isHidden: boolean }[],
): string | null {
  const rowNames = new Set(rows.map(displayName));
  const typed = splitLegacy(current).filter((part) => !rowNames.has(part));
  const visible = rows.filter((row) => !row.isHidden).map(displayName);
  const parts = [...new Set([...typed, ...visible])];
  return parts.length ? parts.join('، ') : null;
}

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
    await assertActiveCompanySubscription(this.prisma, identity.id);

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
    const oldest = services[services.length - 1];
    return {
      specialty: companyData.specialty,
      servicesHidden: companyData.servicesHidden,
      // The rows share one description (اضافة خدمة / تعديل الخدمة)
      description: services.find((s) => s.description)?.description ?? null,
      createdAt: oldest?.createdAt ?? null,
      services,
    };
  }

  /** One sub-service hidden from (or shown again on) the profile. */
  async setHidden(userId: string, serviceId: string, isHidden: boolean) {
    const { identity } = await this.findCompany(userId);
    const service = await this.prisma.companyService.findUnique({
      where: { id: serviceId },
    });
    if (!service || service.identityId !== identity.id) {
      throw new NotFoundException('الخدمة غير موجودة');
    }
    await this.prisma.companyService.update({
      where: { id: serviceId },
      data: { isHidden },
    });
    await this.syncLegacy(identity.id);
    return { success: true };
  }

  /**
   * تعديل الخدمة's save: the whole service hidden or shown, the
   * description (on every row), and which sub-services are hidden. Only
   * what is sent changes.
   */
  async updateMine(userId: string, dto: UpdateCompanyServicesDto) {
    const { identity } = await this.findCompany(userId);
    assertCleanContent(dto.description);

    const rows = dto.rows ?? [];
    if (rows.length) {
      const owned = await this.prisma.companyService.count({
        where: { identityId: identity.id, id: { in: rows.map((r) => r.id) } },
      });
      if (owned !== new Set(rows.map((r) => r.id)).size) {
        throw new NotFoundException('الخدمة غير موجودة');
      }
    }

    await this.prisma.$transaction([
      ...rows.map((row) =>
        this.prisma.companyService.update({
          where: { id: row.id },
          data: { isHidden: row.isHidden },
        }),
      ),
      ...(dto.description !== undefined
        ? [
            this.prisma.companyService.updateMany({
              where: { identityId: identity.id },
              data: { description: dto.description || null },
            }),
          ]
        : []),
      ...(dto.servicesHidden !== undefined
        ? [
            this.prisma.companyIdentityData.update({
              where: { identityId: identity.id },
              data: { servicesHidden: dto.servicesHidden },
            }),
          ]
        : []),
    ]);
    if (rows.length) await this.syncLegacy(identity.id);
    return this.listMine(userId);
  }

  /**
   * حذف الخدمة نهائيا: every sub-service goes, and the specialty is
   * cleared so the company can start again under any specialty.
   */
  async deleteAllMine(userId: string) {
    const { identity, companyData } = await this.findCompany(userId);
    const names = new Set(
      (
        await this.prisma.companyService.findMany({
          where: { identityId: identity.id },
        })
      ).map(displayName),
    );
    // The parts typed by hand stay; only the services' names leave
    const typed = splitLegacy(companyData.services).filter(
      (part) => !names.has(part),
    );
    const [{ count }] = await this.prisma.$transaction([
      this.prisma.companyService.deleteMany({
        where: { identityId: identity.id },
      }),
      this.prisma.companyIdentityData.update({
        where: { identityId: identity.id },
        data: {
          specialty: null,
          servicesHidden: false,
          services: typed.length ? typed.join('، ') : null,
        },
      }),
    ]);
    return { success: true, deleted: count };
  }

  // Rebuilds the legacy `services` text from the rows' visibility
  private async syncLegacy(identityId: string) {
    const [rows, data] = await Promise.all([
      this.prisma.companyService.findMany({ where: { identityId } }),
      this.prisma.companyIdentityData.findUnique({
        where: { identityId },
        select: { services: true },
      }),
    ]);
    await this.prisma.companyIdentityData.update({
      where: { identityId },
      data: { services: legacyServicesText(data?.services ?? null, rows) },
    });
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
