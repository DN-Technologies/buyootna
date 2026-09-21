import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminReportsService } from './admin-reports.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { ReportStatus, ReportTargetType } from '@prisma/client';

describe('AdminReportsService', () => {
  let service: AdminReportsService;
  let prisma: {
    report: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    propertyDeletionLog: { create: jest.Mock };
    property: { delete: jest.Mock };
  };
  let notifications: { create: jest.Mock };

  const mockRow = {
    id: 'rep-1',
    reportNumber: 1025,
    targetType: ReportTargetType.USER,
    status: ReportStatus.PENDING,
    priority: 'MEDIUM',
    reason: 'معلومات غير صحيحة',
    description: null,
    reporterUserId: 'user-1',
    reporterIdentityId: 'ident-1',
    reporterUser: {
      id: 'user-1',
      name: 'محمد المالك',
      email: 'mohamed@example.com',
      phone: null,
      avatarUrl: null,
    },
    reporterIdentity: {
      individualData: null,
      companyData: null,
      officeData: null,
    },
    targetUserId: 'user-2',
    targetIdentityId: 'ident-2',
    targetUser: {
      id: 'user-2',
      name: 'علي البالي',
      email: 'ali@example.com',
      phone: null,
      avatarUrl: null,
    },
    targetIdentity: {
      individualData: null,
      companyData: { name: 'شركة النور', logoUrl: null },
      officeData: null,
    },
    resolvedAt: null,
    resolvedByAdminId: null,
    createdAt: new Date('2026-09-01T10:00:00Z'),
    updatedAt: new Date('2026-09-01T10:00:00Z'),
  };

  beforeEach(async () => {
    prisma = {
      report: {
        findMany: jest.fn().mockResolvedValue([mockRow]),
        count: jest.fn().mockResolvedValue(0),
        findUnique: jest.fn().mockResolvedValue(mockRow),
        update: jest.fn().mockResolvedValue(mockRow),
      },
      propertyDeletionLog: { create: jest.fn() },
      property: { delete: jest.fn() },
    };
    notifications = { create: jest.fn().mockResolvedValue({ id: 'notif-1' }) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminReportsService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notifications },
      ],
    }).compile();

    service = module.get<AdminReportsService>(AdminReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getReports', () => {
    it('maps rows to the response shape with a formatted report number', async () => {
      const result = await service.getReports({});

      expect(result.data[0].reportNumber).toBe('RP-1025');
      expect(result.data[0].submittedBy?.name).toBe('محمد المالك');
      expect(result.data[0].against?.name).toBe('شركة النور');
    });

    it('filters by status when not ALL', async () => {
      await service.getReports({ status: 'RESOLVED' });

      expect(prisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'RESOLVED' }),
        }),
      );
    });

    it('computes stats from real counts, not a fudge factor', async () => {
      prisma.report.count
        .mockResolvedValueOnce(5) // total (where clause)
        .mockResolvedValueOnce(2) // pending
        .mockResolvedValueOnce(2) // resolved
        .mockResolvedValueOnce(1); // dismissed

      const result = await service.getReports({});

      expect(result.stats).toEqual({
        total: 5,
        pending: 2,
        resolved: 2,
        dismissed: 1,
      });
    });
  });

  describe('getReportById', () => {
    it('throws NotFoundException when the report does not exist', async () => {
      prisma.report.findUnique.mockResolvedValue(null);
      await expect(service.getReportById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateReport', () => {
    it('sets resolvedAt/resolvedByAdmin and notifies the reporter on status change', async () => {
      prisma.report.update.mockResolvedValue({
        ...mockRow,
        status: ReportStatus.RESOLVED,
      });

      await service.updateReport('rep-1', { status: 'RESOLVED' }, 'admin-1');

      expect(prisma.report.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'rep-1' },
          data: expect.objectContaining({
            status: 'RESOLVED',
            resolvedAt: expect.any(Date),
            resolvedByAdmin: { connect: { id: 'admin-1' } },
          }),
        }),
      );
      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', type: 'REPORT_RESOLVED' }),
      );
    });

    it('does not notify when only priority changes', async () => {
      await service.updateReport('rep-1', { priority: 'URGENT' }, 'admin-1');
      expect(notifications.create).not.toHaveBeenCalled();
    });

    it('does not fail the request when the notification send throws', async () => {
      prisma.report.update.mockResolvedValue({
        ...mockRow,
        status: ReportStatus.DISMISSED,
      });
      notifications.create.mockRejectedValue(new Error('delivery failed'));

      await expect(
        service.updateReport('rep-1', { status: 'DISMISSED' }, 'admin-1'),
      ).resolves.toBeDefined();
    });
  });

  describe('resolveReports / dismissReports (bulk)', () => {
    it('updates each id and reports failures without throwing', async () => {
      prisma.report.update
        .mockResolvedValueOnce({ ...mockRow, status: ReportStatus.RESOLVED })
        .mockRejectedValueOnce(new Error('not found'));

      const result = await service.resolveReports(
        ['rep-1', 'rep-2'],
        'admin-1',
      );

      expect(result.updatedCount).toBe(1);
      expect(result.failedIds).toEqual(['rep-2']);
    });
  });

  describe('removeReportedProperty', () => {
    it('logs a PropertyDeletionLog row and deletes the property', async () => {
      await service.removeReportedProperty('prop-1', 'مخالفة');

      expect(prisma.propertyDeletionLog.create).toHaveBeenCalledWith({
        data: { propertyId: 'prop-1', reason: 'مخالفة' },
      });
      expect(prisma.property.delete).toHaveBeenCalledWith({
        where: { id: 'prop-1' },
      });
    });
  });

  describe('getDashboardReportStats', () => {
    it('returns the count of pending reports created today', async () => {
      prisma.report.count.mockResolvedValue(4);
      const result = await service.getDashboardReportStats();
      expect(result).toEqual({ newReportsCount: 4 });
    });
  });
});
