import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminExhibitionService } from './admin-exhibition.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AdminAuditLogService } from './admin-audit-log.service';

describe('AdminExhibitionService', () => {
  let service: AdminExhibitionService;
  let prisma: {
    identity: { findFirst: jest.Mock };
    companyProject: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      delete: jest.Mock;
    };
  };
  let auditLog: { log: jest.Mock };

  beforeEach(async () => {
    prisma = {
      identity: {
        findFirst: jest.fn().mockResolvedValue({ id: 'identity-1' }),
      },
      companyProject: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue({
          id: 'project-1',
          identityId: 'identity-1',
          identity: { userId: 'owner-1' },
        }),
        delete: jest.fn(),
      },
    };
    auditLog = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminExhibitionService,
        { provide: PrismaService, useValue: prisma },
        { provide: AdminAuditLogService, useValue: auditLog },
      ],
    }).compile();

    service = module.get<AdminExhibitionService>(AdminExhibitionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProjectsForUser', () => {
    it('returns an empty array when the user has no company identity', async () => {
      prisma.identity.findFirst.mockResolvedValue(null);
      const result = await service.getProjectsForUser('user-1');
      expect(result).toEqual([]);
      expect(prisma.companyProject.findMany).not.toHaveBeenCalled();
    });

    it('scopes to the company identity id', async () => {
      await service.getProjectsForUser('user-1');
      expect(prisma.companyProject.findMany).toHaveBeenCalledWith({
        where: { identityId: 'identity-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('deleteProject', () => {
    it('throws NotFoundException when the project does not exist', async () => {
      prisma.companyProject.findUnique.mockResolvedValue(null);
      await expect(service.deleteProject('missing', 'admin-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deletes the project and logs COMPANY_PROJECT_DELETED against the owner', async () => {
      await service.deleteProject('project-1', 'admin-1');

      expect(prisma.companyProject.delete).toHaveBeenCalledWith({
        where: { id: 'project-1' },
      });
      expect(auditLog.log).toHaveBeenCalledWith({
        actorAdminId: 'admin-1',
        action: 'COMPANY_PROJECT_DELETED',
        targetType: 'COMPANY_PROJECT',
        targetId: 'project-1',
        targetUserId: 'owner-1',
      });
    });
  });
});
