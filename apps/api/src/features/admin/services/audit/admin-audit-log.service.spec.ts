import { Test, TestingModule } from '@nestjs/testing';
import { AdminAuditLogService } from './admin-audit-log.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';

describe('AdminAuditLogService', () => {
  let service: AdminAuditLogService;
  let prisma: {
    adminActionLog: {
      create: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      adminActionLog: {
        create: jest.fn().mockResolvedValue({ id: 'log-1' }),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAuditLogService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AdminAuditLogService>(AdminAuditLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('creates an AdminActionLog row with the given params', async () => {
      await service.log({
        actorAdminId: 'admin-1',
        action: 'PROPERTY_DELETED',
        targetType: 'PROPERTY',
        targetId: 'prop-1',
        targetUserId: 'user-1',
        metadata: { reason: 'test' },
      });

      expect(prisma.adminActionLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          actorAdminId: 'admin-1',
          action: 'PROPERTY_DELETED',
          targetType: 'PROPERTY',
          targetId: 'prop-1',
          targetUserId: 'user-1',
          metadata: { reason: 'test' },
        }),
      });
    });

    it('swallows errors instead of throwing (fire-and-forget)', async () => {
      prisma.adminActionLog.create.mockRejectedValue(new Error('db down'));

      await expect(
        service.log({ action: 'USER_STATUS_CHANGED', targetType: 'USER' }),
      ).resolves.toBeUndefined();
    });
  });

  describe('getLogsForUser', () => {
    it('maps rows and paginates', async () => {
      prisma.adminActionLog.findMany.mockResolvedValue([
        {
          id: 'log-1',
          action: 'USER_STATUS_CHANGED',
          targetType: 'USER',
          targetId: 'user-2',
          actorType: 'ADMIN',
          actorAdmin: { id: 'admin-1', name: 'أحمد' },
          metadata: { from: 'active', to: 'blocked' },
          createdAt: new Date('2026-09-22T10:00:00Z'),
        },
      ]);
      prisma.adminActionLog.count.mockResolvedValue(1);

      const result = await service.getLogsForUser('user-2', 1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].actorAdmin).toEqual({
        id: 'admin-1',
        name: 'أحمد',
      });
      expect(result.meta).toEqual({
        total: 1,
        currentPage: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('falls back to a generic name when actorAdmin has no name', async () => {
      prisma.adminActionLog.findMany.mockResolvedValue([
        {
          id: 'log-1',
          action: 'USER_STATUS_CHANGED',
          targetType: 'USER',
          targetId: null,
          actorType: 'ADMIN',
          actorAdmin: { id: 'admin-1', name: null },
          metadata: null,
          createdAt: new Date('2026-09-22T10:00:00Z'),
        },
      ]);

      const result = await service.getLogsForUser('user-2');
      expect(result.data[0].actorAdmin).toEqual({
        id: 'admin-1',
        name: 'مشرف',
      });
    });
  });
});
