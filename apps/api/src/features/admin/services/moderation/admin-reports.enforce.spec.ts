import { NotFoundException } from '@nestjs/common';

import type { PrismaService } from '../../../../core/prisma/prisma.service';
import type { NotificationsService } from '../../../notifications/notifications.service';
import type { AdminAuditLogService } from '../audit/admin-audit-log.service';
import { AdminReportsService } from './admin-reports.service';

/** «حذف المحتوى وإيقاف الحساب»: removing what a report is about. */
describe('AdminReportsService.removeReportedContent', () => {
  const now = new Date('2026-10-23T10:00:00.000Z');
  const prisma = {
    report: { findUnique: jest.fn() },
    property: { findUnique: jest.fn(), delete: jest.fn() },
    propertyDeletionLog: { create: jest.fn() },
    review: { deleteMany: jest.fn() },
    story: { findUnique: jest.fn(), updateMany: jest.fn() },
    reel: { updateMany: jest.fn() },
  };
  const auditLog = { log: jest.fn() };
  const service = new AdminReportsService(
    prisma as unknown as PrismaService,
    {} as NotificationsService,
    auditLog as unknown as AdminAuditLogService,
  );
  const report = (over: Record<string, unknown>) => ({
    id: 'rep-1',
    reportNumber: 4821,
    targetUserId: 'user-2',
    targetPropertyId: null,
    targetReviewId: null,
    targetStoryId: null,
    targetReelId: null,
    ...over,
  });

  beforeEach(() => jest.clearAllMocks());

  it('deletes a reported listing, logging the report number', async () => {
    prisma.report.findUnique.mockResolvedValue(
      report({ targetPropertyId: 'prop-1' }),
    );
    prisma.property.findUnique.mockResolvedValue({ id: 'prop-1' });

    await expect(
      service.removeReportedContent('rep-1', 'admin-1', now),
    ).resolves.toEqual({ targetUserId: 'user-2', removed: 'PROPERTY' });
    expect(prisma.property.delete).toHaveBeenCalledWith({
      where: { id: 'prop-1' },
    });
    expect(prisma.propertyDeletionLog.create).toHaveBeenCalledWith({
      data: { propertyId: 'prop-1', reason: 'حذف بسبب البلاغ RP-4821' },
    });
  });

  it('deletes a reported review', async () => {
    prisma.report.findUnique.mockResolvedValue(
      report({ targetReviewId: 'rev-1' }),
    );
    prisma.review.deleteMany.mockResolvedValue({ count: 1 });

    await expect(
      service.removeReportedContent('rep-1', 'admin-1', now),
    ).resolves.toEqual({ targetUserId: 'user-2', removed: 'REVIEW' });
    expect(prisma.review.deleteMany).toHaveBeenCalledWith({
      where: { id: 'rev-1' },
    });
    expect(auditLog.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'REVIEW_DELETED', targetId: 'rev-1' }),
    );
  });

  it('takes a reported story down at once', async () => {
    prisma.report.findUnique.mockResolvedValue(
      report({ targetStoryId: 'story-1' }),
    );
    prisma.story.findUnique.mockResolvedValue({
      status: 'ACTIVE',
      publishedAt: new Date('2026-10-23T08:00:00.000Z'),
    });

    await expect(
      service.removeReportedContent('rep-1', 'admin-1', now),
    ).resolves.toEqual({ targetUserId: 'user-2', removed: 'STORY' });
    expect(prisma.story.updateMany).toHaveBeenCalledWith({
      where: { id: 'story-1', status: { in: ['PENDING', 'ACTIVE'] } },
      data: expect.objectContaining({
        status: 'DELETED',
        deletedAt: now,
      }) as unknown,
    });
  });

  it('takes a reported reel down at once and logs it', async () => {
    prisma.report.findUnique.mockResolvedValue(
      report({ targetReelId: 'reel-1' }),
    );
    prisma.reel.updateMany.mockResolvedValue({ count: 1 });

    await expect(
      service.removeReportedContent('rep-1', 'admin-1', now),
    ).resolves.toEqual({ targetUserId: 'user-2', removed: 'REEL' });
    expect(prisma.reel.updateMany).toHaveBeenCalledWith({
      where: { id: 'reel-1', status: { in: ['PENDING', 'ACTIVE'] } },
      data: { status: 'DELETED', deletedAt: now },
    });
    expect(auditLog.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'REEL_REMOVED',
        targetType: 'REEL',
        targetId: 'reel-1',
        targetUserId: 'user-2',
      }),
    );
  });

  it('skips a reel already gone', async () => {
    prisma.report.findUnique.mockResolvedValue(
      report({ targetReelId: 'reel-1' }),
    );
    prisma.reel.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.removeReportedContent('rep-1', 'admin-1', now),
    ).resolves.toEqual({ targetUserId: 'user-2', removed: null });
    expect(auditLog.log).not.toHaveBeenCalled();
  });

  it('skips content already gone, and a report on an account alone', async () => {
    prisma.report.findUnique.mockResolvedValue(
      report({ targetPropertyId: 'prop-1' }),
    );
    prisma.property.findUnique.mockResolvedValue(null);
    await expect(
      service.removeReportedContent('rep-1', 'admin-1', now),
    ).resolves.toEqual({ targetUserId: 'user-2', removed: null });
    expect(prisma.property.delete).not.toHaveBeenCalled();

    prisma.report.findUnique.mockResolvedValue(report({}));
    await expect(
      service.removeReportedContent('rep-1', 'admin-1', now),
    ).resolves.toEqual({ targetUserId: 'user-2', removed: null });
  });

  it('404s for an unknown report', async () => {
    prisma.report.findUnique.mockResolvedValue(null);
    await expect(
      service.removeReportedContent('nope', 'admin-1', now),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
