import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AdminAuditLogService } from '../audit/admin-audit-log.service';
import { findOwnedIdentity } from '../users/admin-persona.util';
import { OTHER_SERVICE_TYPE } from '../../../company/dto/create-company-service.dto';

@Injectable()
export class AdminExhibitionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AdminAuditLogService,
  ) {}

  // The named persona's projects (only a company has a gallery), else the
  // account's company's
  async getProjectsForUser(userId: string, identityId?: string) {
    const identity = identityId
      ? await findOwnedIdentity(this.prisma, userId, identityId)
      : await this.prisma.identity.findFirst({
          where: { userId, type: 'COMPANY' },
        });
    if (!identity || (identityId && identity.type !== 'COMPANY')) return [];

    return this.prisma.companyProject.findMany({
      where: { identityId: identity.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * The persona's services (الخدمات): a company's CompanyService rows; an
   * office only has its typed `services` list, returned as names. Without
   * identityId, the account's company, else its office.
   */
  async getServicesForUser(userId: string, identityId?: string) {
    const identity = identityId
      ? await findOwnedIdentity(this.prisma, userId, identityId)
      : await this.prisma.identity.findFirst({
          where: { userId, type: { in: ['COMPANY', 'OFFICE'] } },
          orderBy: { type: 'asc' },
        });
    const none = { specialty: null, servicesHidden: false, services: [] };
    if (!identity) return none;

    if (identity.type === 'OFFICE') {
      const office = await this.prisma.officeIdentityData.findUnique({
        where: { identityId: identity.id },
        select: { services: true, updatedAt: true },
      });
      const names = (office?.services ?? '')
        .split(/[,،\n]/)
        .map((part) => part.trim())
        .filter(Boolean);
      return {
        ...none,
        services: names.map((name, idx) => ({
          id: `${identity.id}-${idx}`,
          name,
          specialty: null,
          description: null,
          isHidden: false,
          createdAt: office!.updatedAt.toISOString(),
        })),
      };
    }
    if (identity.type !== 'COMPANY') return none;

    const [company, rows] = await Promise.all([
      this.prisma.companyIdentityData.findUnique({
        where: { identityId: identity.id },
        select: { specialty: true, servicesHidden: true },
      }),
      this.prisma.companyService.findMany({
        where: { identityId: identity.id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return {
      specialty: company?.specialty ?? null,
      servicesHidden: company?.servicesHidden ?? false,
      services: rows.map((row) => ({
        id: row.id,
        // What the profile calls it: its own title for "اخرى"
        name:
          row.type === OTHER_SERVICE_TYPE && row.title ? row.title : row.type,
        specialty: row.specialty,
        description: row.description,
        isHidden: row.isHidden,
        createdAt: row.createdAt.toISOString(),
      })),
    };
  }

  async deleteProject(projectId: string, adminUserId: string) {
    const project = await this.prisma.companyProject.findUnique({
      where: { id: projectId },
      include: { identity: { select: { userId: true } } },
    });
    if (!project) throw new NotFoundException('المشروع غير موجود');

    await this.prisma.companyProject.delete({ where: { id: projectId } });

    await this.auditLog.log({
      actorAdminId: adminUserId,
      action: 'COMPANY_PROJECT_DELETED',
      targetType: 'COMPANY_PROJECT',
      targetId: projectId,
      targetUserId: project.identity.userId,
    });

    return { message: 'تم حذف المشروع بنجاح' };
  }
}
