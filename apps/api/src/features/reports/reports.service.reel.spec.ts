import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../core/prisma/prisma.service';
import { ModerationAlertService } from './moderation-alert.service';
import { ReportsService } from './reports.service';

const alerts = { reportCreated: jest.fn().mockResolvedValue(undefined) };

const REEL = '22222222-2222-4222-8222-222222222222';
const reporter = { userId: 'reporter-user', identityId: 'reporter-ident' };
const dto = { reason: 'محتوى مسيء', description: 'تفاصيل' };
const linksFor = () => ({
  mediaUrl: 'https://s3.example/media.mp4',
  posterUrl: 'https://s3.example/poster.jpg',
});

const liveReel = (over: Record<string, unknown> = {}) => ({
  id: REEL,
  identityId: 'author-ident',
  status: 'ACTIVE',
  caption: 'عرض جديد',
  mediaKey: 'reels/a/b/media.mp4',
  posterKey: 'reels/a/b/poster.jpg',
  publishedAt: new Date('2026-10-30T10:00:00.000Z'),
  identity: { userId: 'author-user' },
  ...over,
});

describe('ReportsService.createForReel', () => {
  let service: ReportsService;
  const prisma = {
    reel: { findUnique: jest.fn() },
    report: { findUnique: jest.fn(), create: jest.fn() },
  };
  // The report-number lookup and the per-reel lookup share findUnique: tell
  // them apart by their where clause
  const reelReportLookup = (where: Record<string, unknown>) =>
    'reporterIdentityId_targetReelId' in where;

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.reel.findUnique.mockResolvedValue(liveReel());
    prisma.report.findUnique.mockResolvedValue(null);
    prisma.report.create.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: 'report-1', ...data }),
    );
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ModerationAlertService, useValue: alerts },
      ],
    }).compile();
    service = module.get(ReportsService);
  });

  it('files a USER report against the author, with links the admin can watch', async () => {
    await service.createForReel(reporter, REEL, dto, linksFor);

    expect(prisma.report.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        targetType: 'USER',
        targetUserId: 'author-user',
        targetIdentityId: 'author-ident',
        targetReelId: REEL,
        targetReelSnapshot: {
          reelId: REEL,
          authorIdentityId: 'author-ident',
          caption: 'عرض جديد',
          publishedAt: '2026-10-30T10:00:00.000Z',
          mediaUrl: 'https://s3.example/media.mp4',
          posterUrl: 'https://s3.example/poster.jpg',
        },
      }) as unknown,
    });
  });

  it('emails the moderators', async () => {
    await service.createForReel(reporter, REEL, dto, linksFor);
    expect(alerts.reportCreated).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'فيديو', reason: dto.reason }),
    );
  });

  it.each([['DELETED'], ['PENDING'], ['FAILED']])(
    'answers 404 for a %s reel',
    async (status) => {
      prisma.reel.findUnique.mockResolvedValue(liveReel({ status }));
      await expect(
        service.createForReel(reporter, REEL, dto, linksFor),
      ).rejects.toThrow(NotFoundException);
    },
  );

  it("refuses a report on the reporter's own account", async () => {
    prisma.reel.findUnique.mockResolvedValue(
      liveReel({ identity: { userId: reporter.userId } }),
    );
    await expect(
      service.createForReel(reporter, REEL, dto, linksFor),
    ).rejects.toThrow(BadRequestException);
  });

  it('repeating returns the first report, without another email', async () => {
    prisma.report.findUnique.mockImplementation(
      ({ where }: { where: Record<string, unknown> }) =>
        Promise.resolve(reelReportLookup(where) ? { id: 'first' } : null),
    );
    await expect(
      service.createForReel(reporter, REEL, dto, linksFor),
    ).resolves.toMatchObject({ data: { id: 'first' } });
    expect(prisma.report.create).not.toHaveBeenCalled();
    expect(alerts.reportCreated).not.toHaveBeenCalled();
  });

  it('a simultaneous report that won the unique key is returned', async () => {
    let lookups = 0;
    prisma.report.findUnique.mockImplementation(
      ({ where }: { where: Record<string, unknown> }) => {
        if (!reelReportLookup(where)) return Promise.resolve(null);
        lookups += 1;
        return Promise.resolve(lookups === 1 ? null : { id: 'winner' });
      },
    );
    prisma.report.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('unique', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );
    await expect(
      service.createForReel(reporter, REEL, dto, linksFor),
    ).resolves.toMatchObject({ data: { id: 'winner' } });
  });
});
