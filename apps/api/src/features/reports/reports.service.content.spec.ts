import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReportTargetType } from '@prisma/client';

import { PrismaService } from '../../core/prisma/prisma.service';
import { ModerationAlertService } from './moderation-alert.service';
import { BLOCK_REPORT_REASON, ReportsService } from './reports.service';

/** Reports made from a listing, a review and a block (Guideline 1.2). */
describe('ReportsService: listings, reviews and blocks', () => {
  let service: ReportsService;
  const alerts = { reportCreated: jest.fn().mockResolvedValue(undefined) };
  let prisma: {
    property: { findUnique: jest.Mock };
    review: { findUnique: jest.Mock };
    report: { findUnique: jest.Mock; findFirst: jest.Mock; create: jest.Mock };
  };
  const reporter = { userId: 'user-1', identityId: 'ident-1' };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma = {
      property: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'prop-1',
          identityId: 'owner-ident',
          identity: { userId: 'owner-user' },
        }),
      },
      review: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'rev-1',
          rating: 1,
          comment: 'تعليق مسيء',
          createdAt: new Date('2026-10-01T00:00:00.000Z'),
          reviewerId: 'author-user',
          reviewerIdentityId: 'author-ident',
          reviewerIdentity: { userId: 'author-user' },
        }),
      },
      report: {
        // No report number is taken yet; nothing pending
        findUnique: jest.fn().mockResolvedValue(null),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest
          .fn()
          .mockImplementation(({ data }) =>
            Promise.resolve({ id: 'rep-1', ...data }),
          ),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ModerationAlertService, useValue: alerts },
      ],
    }).compile();
    service = module.get(ReportsService);
  });

  describe('a listing (إبلاغ عن الإعلان)', () => {
    it('files a PROPERTY report against the listing and its owner, and alerts the moderators', async () => {
      const result = await service.createForProperty(reporter, 'prop-1', {
        reason: 'محتوى مسيء',
      });
      expect(prisma.report.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          targetType: ReportTargetType.PROPERTY,
          reason: 'محتوى مسيء',
          reporterUserId: 'user-1',
          reporterIdentityId: 'ident-1',
          targetUserId: 'owner-user',
          targetIdentityId: 'owner-ident',
          targetPropertyId: 'prop-1',
        }) as unknown,
      });
      expect(result.message).toContain('تم إرسال البلاغ');
      expect(alerts.reportCreated).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'إعلان', reason: 'محتوى مسيء' }),
      );
    });

    it('returns the pending report instead of filing a second one', async () => {
      prisma.report.findFirst.mockResolvedValue({ id: 'rep-old' });
      const result = await service.createForProperty(reporter, 'prop-1', {
        reason: 'x',
      });
      expect(result.data).toEqual({ id: 'rep-old' });
      expect(prisma.report.create).not.toHaveBeenCalled();
      expect(alerts.reportCreated).not.toHaveBeenCalled();
    });

    it("refuses a missing listing and the reporter's own", async () => {
      prisma.property.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.createForProperty(reporter, 'gone', { reason: 'x' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      await expect(
        service.createForProperty(
          { userId: 'owner-user', identityId: 'owner-ident' },
          'prop-1',
          { reason: 'x' },
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('a review', () => {
    it('files a report against its author, linked to it, with its text kept', async () => {
      await service.createForReview(reporter, 'rev-1', { reason: 'إساءة' });
      expect(prisma.report.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          targetType: ReportTargetType.USER,
          targetUserId: 'author-user',
          targetIdentityId: 'author-ident',
          targetReviewId: 'rev-1',
          targetReviewSnapshot: {
            reviewId: 'rev-1',
            rating: 1,
            comment: 'تعليق مسيء',
            createdAt: '2026-10-01T00:00:00.000Z',
          },
        }) as unknown,
      });
      expect(alerts.reportCreated).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'تقييم' }),
      );
    });

    it("refuses a missing review and the reporter's own", async () => {
      prisma.review.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.createForReview(reporter, 'gone', { reason: 'x' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      await expect(
        service.createForReview({ userId: 'author-user' }, 'rev-1', {
          reason: 'x',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  it('a block is filed as a report against the blocked account, with the reason', async () => {
    await service.createForBlock(
      reporter,
      { userId: 'bad-user', identityId: 'bad-ident' },
      '  رسائل مزعجة ',
    );
    expect(prisma.report.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        targetType: ReportTargetType.USER,
        reason: BLOCK_REPORT_REASON,
        description: 'رسائل مزعجة',
        reporterUserId: 'user-1',
        targetUserId: 'bad-user',
        targetIdentityId: 'bad-ident',
      }) as unknown,
    });
    expect(alerts.reportCreated).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'حظر مستخدم' }),
    );
  });
});
