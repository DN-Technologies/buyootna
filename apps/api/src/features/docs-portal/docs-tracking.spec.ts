import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { DocsRole } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { StorageService } from '../../core/storage/storage.service';
import { DocsTrackingService } from './docs-tracking.service';

const qa = { role: DocsRole.QA, name: 'Sara' };
const dev = { role: DocsRole.DEVELOPER, name: 'Omar' };
const uiux = { role: DocsRole.UIUX, name: 'Lina' };
const client = { role: DocsRole.CLIENT, name: 'Mona' };

describe('DocsTrackingService', () => {
  let prisma: {
    docsRelease: { findUnique: jest.Mock };
    docsStoryResult: {
      create: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
    };
    docsComment: { create: jest.Mock; findMany: jest.Mock };
  };
  let storage: { uploadFile: jest.Mock };
  let service: DocsTrackingService;

  beforeEach(() => {
    prisma = {
      docsRelease: {
        findUnique: jest.fn().mockResolvedValue({ id: 'r1', status: 'OPEN' }),
      },
      docsStoryResult: {
        create: jest.fn((args: { data: unknown }) =>
          Promise.resolve(args.data),
        ),
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
      },
      docsComment: {
        create: jest.fn((args: { data: unknown }) =>
          Promise.resolve(args.data),
        ),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    storage = { uploadFile: jest.fn().mockResolvedValue('https://s3/x.png') };
    service = new DocsTrackingService(
      prisma as unknown as PrismaService,
      storage as unknown as StorageService,
    );
  });

  describe('recording results', () => {
    it('lets QA record a failure, attributed to them', async () => {
      const row = await service.recordResult(
        'r1',
        'mobile-favorites',
        { status: 'FAIL', note: 'Heart stays empty', bugUrl: 'https://x/1' },
        qa,
      );
      expect(row).toMatchObject({
        storyId: 'mobile-favorites',
        status: 'FAIL',
        authorName: 'Sara',
        authorRole: 'QA',
      });
    });

    it('needs a note to say what failed', async () => {
      await expect(
        service.recordResult('r1', 'mobile-favorites', { status: 'FAIL' }, qa),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('keeps each role to its own statuses', async () => {
      await expect(
        service.recordResult('r1', 'mobile-favorites', { status: 'PASS' }, dev),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        service.recordResult(
          'r1',
          'mobile-favorites',
          { status: 'PASS' },
          uiux,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        service.recordResult(
          'r1',
          'mobile-favorites',
          { status: 'PASS' },
          client,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        service.recordResult(
          'r1',
          'mobile-favorites',
          { status: 'READY_FOR_RETEST' },
          qa,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('lets a developer mark a failed story ready to retest, and only a failed one', async () => {
      prisma.docsStoryResult.findFirst.mockResolvedValueOnce({
        status: 'PASS',
      });
      await expect(
        service.recordResult(
          'r1',
          'mobile-favorites',
          { status: 'READY_FOR_RETEST' },
          dev,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      prisma.docsStoryResult.findFirst.mockResolvedValueOnce({
        status: 'FAIL',
      });
      await expect(
        service.recordResult(
          'r1',
          'mobile-favorites',
          { status: 'READY_FOR_RETEST', note: 'Fixed in #140' },
          dev,
        ),
      ).resolves.toMatchObject({
        status: 'READY_FOR_RETEST',
        authorRole: 'DEVELOPER',
      });
    });

    it('refuses results on a closed release', async () => {
      prisma.docsRelease.findUnique.mockResolvedValue({
        id: 'r1',
        status: 'CLOSED',
      });
      await expect(
        service.recordResult('r1', 'mobile-favorites', { status: 'PASS' }, qa),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects an id that is not a story id', async () => {
      await expect(
        service.recordResult('r1', '../users', { status: 'PASS' }, qa),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  it("shows a client every story's status but none of the team's notes", async () => {
    prisma.docsStoryResult.findMany.mockResolvedValue([
      {
        storyId: 's1',
        status: 'FAIL',
        note: 'internal detail',
        bugUrl: 'https://x/1',
        attachments: ['https://s3/a.png'],
      },
    ]);

    const [forClient] = await service.latestResults('r1', client);
    expect(forClient).toMatchObject({ storyId: 's1', status: 'FAIL' });
    expect(forClient.note).toBeNull();
    expect(forClient.bugUrl).toBeNull();
    expect(forClient.attachments).toEqual([]);

    const [forQa] = await service.latestResults('r1', qa);
    expect(forQa.note).toBe('internal detail');
  });

  it("counts each story's current status once", async () => {
    prisma.docsStoryResult.findMany.mockResolvedValue([
      { storyId: 'a', status: 'PASS' },
      { storyId: 'b', status: 'FAIL' },
      { storyId: 'c', status: 'PASS' },
    ]);
    const { counts } = await service.summary('r1');
    expect(counts).toMatchObject({ PASS: 2, FAIL: 1, BLOCKED: 0 });
    // Newest row per story: ordered newest-first and distinct on the story
    expect(prisma.docsStoryResult.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        distinct: ['storyId'],
        orderBy: [{ storyId: 'asc' }, { createdAt: 'desc' }],
      }),
    );
  });

  it('keeps design-mismatch notes to UI/UX (and admin)', async () => {
    await expect(
      service.addComment(
        'mobile-favorites',
        { kind: 'DESIGN_MISMATCH', body: 'Wrong radius' },
        qa,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.addComment(
        'mobile-favorites',
        { kind: 'DESIGN_MISMATCH', body: 'Wrong radius' },
        uiux,
      ),
    ).resolves.toMatchObject({ kind: 'DESIGN_MISMATCH', authorName: 'Lina' });
  });

  describe('screenshots', () => {
    const file = (mimetype: string, size: number) =>
      ({ mimetype, size, originalname: 'x' }) as Express.Multer.File;

    it('accepts an image up to 5 MB', async () => {
      await expect(
        service.uploadAttachment(file('image/png', 1024)),
      ).resolves.toEqual({ url: 'https://s3/x.png' });
      expect(storage.uploadFile).toHaveBeenCalledWith(
        expect.anything(),
        'docs-portal',
      );
    });

    it('refuses other file types and larger images', async () => {
      await expect(
        service.uploadAttachment(file('application/pdf', 1024)),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        service.uploadAttachment(file('image/png', 6 * 1024 * 1024)),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(storage.uploadFile).not.toHaveBeenCalled();
    });
  });
});
