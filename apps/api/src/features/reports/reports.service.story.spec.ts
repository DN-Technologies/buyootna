import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../core/prisma/prisma.service';
import { ReportsService } from './reports.service';
import { ModerationAlertService } from './moderation-alert.service';

const alerts = { reportCreated: jest.fn().mockResolvedValue(undefined) };

const NOW = new Date('2026-10-20T12:00:00.000Z');
const STORY = '22222222-2222-4222-8222-222222222222';
const reporter = { userId: 'reporter-user', identityId: 'reporter-ident' };
const dto = { reason: 'محتوى مسيء', description: 'تفاصيل' };

const liveStory = (over: Record<string, unknown> = {}) => ({
  id: STORY,
  identityId: 'author-ident',
  status: 'ACTIVE',
  caption: 'عرض جديد',
  mediaType: 'IMAGE',
  publishedAt: new Date('2026-10-20T10:00:00.000Z'),
  expiresAt: new Date('2026-10-21T10:00:00.000Z'),
  identity: { userId: 'author-user' },
  _count: { highlightItems: 0 },
  ...over,
});

describe('ReportsService.createForStory', () => {
  let service: ReportsService;
  const prisma = {
    story: { findUnique: jest.fn() },
    report: { findUnique: jest.fn(), create: jest.fn() },
  };
  // The report-number lookup and the per-story lookup share findUnique:
  // tell them apart by their where clause
  const storyReportLookup = (where: Record<string, unknown>) =>
    'reporterIdentityId_targetStoryId' in where;

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.story.findUnique.mockResolvedValue(liveStory());
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

  it('files a USER report against the author, linked to the story with a snapshot', async () => {
    const result = await service.createForStory(reporter, STORY, dto, NOW);

    expect(prisma.report.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        targetType: 'USER',
        reason: 'محتوى مسيء',
        description: 'تفاصيل',
        reporterUserId: 'reporter-user',
        reporterIdentityId: 'reporter-ident',
        targetUserId: 'author-user',
        targetIdentityId: 'author-ident',
        targetStoryId: STORY,
        targetStorySnapshot: {
          storyId: STORY,
          authorIdentityId: 'author-ident',
          mediaType: 'IMAGE',
          caption: 'عرض جديد',
          publishedAt: '2026-10-20T10:00:00.000Z',
        },
      }) as Record<string, unknown>,
    });
    expect(result.message).toBe(
      'تم إرسال البلاغ بنجاح وسيقوم فريق الدعم بمراجعته',
    );
  });

  it('a second report by the same profile returns the first', async () => {
    const first = { id: 'report-1', targetStoryId: STORY };
    prisma.report.findUnique.mockImplementation(
      ({ where }: { where: Record<string, unknown> }) =>
        Promise.resolve(storyReportLookup(where) ? first : null),
    );
    await expect(
      service.createForStory(reporter, STORY, dto, NOW),
    ).resolves.toEqual({ message: expect.any(String) as string, data: first });
    expect(prisma.report.create).not.toHaveBeenCalled();
  });

  it('a simultaneous duplicate that hits the unique key returns the winner', async () => {
    const winner = { id: 'report-w', targetStoryId: STORY };
    let lookups = 0;
    prisma.report.findUnique.mockImplementation(
      ({ where }: { where: Record<string, unknown> }) => {
        if (!storyReportLookup(where)) return Promise.resolve(null);
        lookups += 1;
        // Not there on the first check, there after the conflict
        return Promise.resolve(lookups === 1 ? null : winner);
      },
    );
    prisma.report.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );
    await expect(
      service.createForStory(reporter, STORY, dto, NOW),
    ).resolves.toMatchObject({ data: winner });
  });

  it('other database errors are not swallowed', async () => {
    prisma.report.create.mockRejectedValue(new Error('db down'));
    await expect(
      service.createForStory(reporter, STORY, dto, NOW),
    ).rejects.toThrow('db down');
  });

  it("the author's own account cannot report it", async () => {
    prisma.story.findUnique.mockResolvedValue(
      liveStory({ identity: { userId: 'reporter-user' } }),
    );
    await expect(
      service.createForStory(reporter, STORY, dto, NOW),
    ).rejects.toThrow(BadRequestException);
  });

  it.each([
    ['missing', null],
    ['deleted', liveStory({ status: 'DELETED' })],
    ['pending', liveStory({ status: 'PENDING' })],
    ['expired', liveStory({ expiresAt: NOW })],
    [
      'deleted, even in a highlight',
      liveStory({ status: 'DELETED', _count: { highlightItems: 1 } }),
    ],
  ])('a %s story cannot be reported (404)', async (_label, row) => {
    prisma.story.findUnique.mockResolvedValue(row);
    await expect(
      service.createForStory(reporter, STORY, dto, NOW),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.report.create).not.toHaveBeenCalled();
  });

  it('an expired story kept in a highlight can be reported (it is on the profile)', async () => {
    prisma.story.findUnique.mockResolvedValue(
      liveStory({ expiresAt: NOW, _count: { highlightItems: 1 } }),
    );
    await expect(
      service.createForStory(reporter, STORY, dto, NOW),
    ).resolves.toBeDefined();
    expect(prisma.report.create).toHaveBeenCalled();
  });
});
