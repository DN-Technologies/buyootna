import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminExhibitionService } from './admin-exhibition.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AdminAuditLogService } from '../audit/admin-audit-log.service';

describe('AdminExhibitionService', () => {
  let service: AdminExhibitionService;
  let prisma: {
    identity: { findFirst: jest.Mock };
    companyService: { findMany: jest.Mock };
    companyIdentityData: { findUnique: jest.Mock };
    officeIdentityData: { findUnique: jest.Mock };
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
      companyService: { findMany: jest.fn().mockResolvedValue([]) },
      companyIdentityData: { findUnique: jest.fn() },
      officeIdentityData: { findUnique: jest.fn() },
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

  describe('getServicesForUser', () => {
    it("lists a company's services by their profile name", async () => {
      prisma.identity.findFirst.mockResolvedValue({
        id: 'co-1',
        type: 'COMPANY',
      });
      prisma.companyIdentityData.findUnique.mockResolvedValue({
        specialty: 'تشطيب',
        servicesHidden: false,
      });
      prisma.companyService.findMany.mockResolvedValue([
        {
          id: 's-1',
          type: 'اخرى',
          title: 'تنسيق حدائق',
          specialty: 'تشطيب',
          description: null,
          isHidden: true,
          createdAt: new Date('2026-10-01T00:00:00Z'),
        },
      ]);

      const result = await service.getServicesForUser('user-1', 'co-1');

      expect(result.specialty).toBe('تشطيب');
      expect(result.services).toEqual([
        {
          id: 's-1',
          name: 'تنسيق حدائق',
          specialty: 'تشطيب',
          description: null,
          isHidden: true,
          createdAt: '2026-10-01T00:00:00.000Z',
        },
      ]);
    });

    it("lists an office's typed services as names", async () => {
      prisma.identity.findFirst.mockResolvedValue({
        id: 'of-1',
        type: 'OFFICE',
      });
      prisma.officeIdentityData.findUnique.mockResolvedValue({
        services: 'بيع، تأجير,تقييم',
        updatedAt: new Date('2026-10-01T00:00:00Z'),
      });

      const result = await service.getServicesForUser('user-1', 'of-1');

      expect(result.services.map((s) => s.name)).toEqual([
        'بيع',
        'تأجير',
        'تقييم',
      ]);
      expect(prisma.companyService.findMany).not.toHaveBeenCalled();
    });

    it("refuses another account's identity", async () => {
      prisma.identity.findFirst.mockResolvedValue(null);
      await expect(
        service.getServicesForUser('user-1', 'someone-elses'),
      ).rejects.toThrow(NotFoundException);
    });
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
