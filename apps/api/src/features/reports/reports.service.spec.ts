import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ReportTargetType } from '@prisma/client';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: {
    identity: { findFirst: jest.Mock };
    report: { findUnique: jest.Mock; create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      identity: { findFirst: jest.fn() },
      report: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('resolves an identity-id target and creates a USER report', async () => {
      prisma.identity.findFirst.mockResolvedValue({
        id: 'ident-2',
        userId: 'user-2',
      });
      prisma.report.create.mockResolvedValue({
        id: 'rep-1',
        reportNumber: 1234,
      });

      const result = await service.create('user-1', 'ident-1', 'ident-2', {
        reason: 'احتيال ونصب مالي',
      });

      expect(prisma.report.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          targetType: ReportTargetType.USER,
          reason: 'احتيال ونصب مالي',
          reporterUserId: 'user-1',
          reporterIdentityId: 'ident-1',
          targetUserId: 'user-2',
          targetIdentityId: 'ident-2',
        }),
      });
      expect(result.message).toContain('تم إرسال البلاغ');
    });

    it('falls back to treating the target id as a raw user id when no identity resolves', async () => {
      prisma.identity.findFirst.mockResolvedValue(null);
      prisma.report.create.mockResolvedValue({ id: 'rep-2' });

      await service.create('user-1', 'ident-1', 'user-2', {
        reason: 'سلوك مسيء',
      });

      expect(prisma.report.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          targetUserId: 'user-2',
          targetIdentityId: undefined,
        }),
      });
    });

    it('rejects a self-report', async () => {
      prisma.identity.findFirst.mockResolvedValue({
        id: 'ident-1',
        userId: 'user-1',
      });

      await expect(
        service.create('user-1', 'ident-1', 'user-1', {
          reason: 'test',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.report.create).not.toHaveBeenCalled();
    });

    it('retries report number generation on collision', async () => {
      prisma.identity.findFirst.mockResolvedValue({
        id: 'ident-2',
        userId: 'user-2',
      });
      prisma.report.findUnique
        .mockResolvedValueOnce({ id: 'existing' })
        .mockResolvedValueOnce(null);
      prisma.report.create.mockResolvedValue({ id: 'rep-3' });

      await service.create('user-1', 'ident-1', 'ident-2', {
        reason: 'test',
      });

      expect(prisma.report.findUnique).toHaveBeenCalledTimes(2);
      expect(prisma.report.create).toHaveBeenCalledTimes(1);
    });
  });
});
