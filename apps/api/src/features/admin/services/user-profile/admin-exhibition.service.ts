import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AdminAuditLogService } from '../audit/admin-audit-log.service';
import { findOwnedIdentity } from '../users/admin-persona.util';

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
