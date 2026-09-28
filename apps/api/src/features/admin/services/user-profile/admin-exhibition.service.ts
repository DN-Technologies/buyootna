import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AdminAuditLogService } from '../audit/admin-audit-log.service';

@Injectable()
export class AdminExhibitionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AdminAuditLogService,
  ) {}

  async getProjectsForUser(userId: string) {
    const identity = await this.prisma.identity.findFirst({
      where: { userId, type: 'COMPANY' },
    });
    if (!identity) return [];

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
