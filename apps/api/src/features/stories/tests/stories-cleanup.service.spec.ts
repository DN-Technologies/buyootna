import { PrismaService } from '../../../core/prisma/prisma.service';
import { StorageService } from '../../../core/storage/storage.service';
import {
  FILES_TO_CLEAR,
  StoriesCleanupService,
  dueForPurge,
} from '../stories-cleanup.service';
import { StoriesMediaService } from '../stories-media.service';
import { callArg } from './test-utils';

const NOW = new Date('2026-10-20T12:00:00.000Z');
const id = (n: number) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const AUTHOR = id(999);
const row = (n: number, mediaDeletedAt: Date | null = null) => ({
  id: id(n),
  mediaKey: `stories/${AUTHOR}/${id(n)}/media.jpg`,
  posterKey: null,
  mediaDeletedAt,
});

describe('StoriesCleanupService', () => {
  const prisma = {
    story: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
      updateMany: jest.fn(),
    },
  };
  const storage = {
    deleteKeysReporting: jest.fn(),
    listKeys: jest.fn(),
  };
  const media = new StoriesMediaService(storage as unknown as StorageService);
  let service: StoriesCleanupService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StoriesCleanupService(
      prisma as unknown as PrismaService,
      storage as unknown as StorageService,
      media,
    );
    prisma.story.findMany.mockReset();
    prisma.story.updateMany.mockImplementation(
      ({ where }: { where: { id: { in: string[] } } }) =>
        Promise.resolve({ count: where.id.in.length }),
    );
    prisma.story.deleteMany.mockImplementation(
      ({ where }: { where: { id: { in: string[] } } }) =>
        Promise.resolve({ count: where.id.in.length }),
    );
  });

  it('what is due: out of the 30-day archive and in no highlight, abandoned uploads, deleted and failed', () => {
    expect(dueForPurge(NOW)).toEqual({
      OR: [
        {
          status: 'ACTIVE',
          expiresAt: { lt: new Date('2026-09-20T12:00:00.000Z') },
          highlightItems: { none: {} },
        },
        {
          status: 'PENDING',
          expiresAt: { lt: new Date('2026-10-20T11:55:00.000Z') },
        },
        { status: { in: ['DELETED', 'FAILED'] }, expiresAt: { lte: NOW } },
      ],
    });
  });

  /** findMany answers: first the files step, then the due-rows step. */
  const steps = (filesStep: unknown[], dueStep: unknown[]) =>
    prisma.story.findMany
      .mockResolvedValueOnce(filesStep)
      .mockResolvedValueOnce(dueStep);

  describe('purge', () => {
    it('first clears the files of deleted / failed stories, then due rows', async () => {
      steps([row(1)], []);
      storage.deleteKeysReporting.mockResolvedValue({ failed: [] });

      await expect(service.purge(NOW)).resolves.toEqual({
        filesCleared: 1,
        purged: 0,
        kept: 0,
      });
      expect(callArg<{ where: unknown }>(prisma.story.findMany).where).toEqual(
        FILES_TO_CLEAR,
      );
      expect(prisma.story.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [id(1)] }, mediaDeletedAt: null },
        data: { mediaDeletedAt: NOW },
      });
      // Its row isn't due yet (still counting toward the publish limit)
      expect(prisma.story.deleteMany).not.toHaveBeenCalled();
    });

    it('a file S3 could not delete stays unrecorded, so the next run retries it', async () => {
      steps([row(1), row(2)], []);
      storage.deleteKeysReporting.mockResolvedValueOnce({
        failed: [row(2).mediaKey],
      });
      await expect(service.purge(NOW)).resolves.toMatchObject({
        filesCleared: 1,
      });
      expect(prisma.story.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [id(1)] }, mediaDeletedAt: null },
        data: { mediaDeletedAt: NOW },
      });

      // Next run: S3 works again; story 2 is picked up and cleared
      steps([row(2)], []);
      storage.deleteKeysReporting.mockResolvedValueOnce({ failed: [] });
      await expect(service.purge(NOW)).resolves.toMatchObject({
        filesCleared: 1,
      });
      expect(storage.deleteKeysReporting).toHaveBeenLastCalledWith([
        row(2).mediaKey,
      ]);
    });

    it('due rows: deletes files first, then only the rows whose files are gone', async () => {
      steps([], [row(1), row(2)]);
      storage.deleteKeysReporting.mockResolvedValue({
        failed: [row(2).mediaKey],
      });

      await expect(service.purge(NOW)).resolves.toEqual({
        filesCleared: 0,
        purged: 1,
        kept: 1,
      });
      expect(prisma.story.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [id(1)] }, ...dueForPurge(NOW) },
      });
      const fileCall = storage.deleteKeysReporting.mock.invocationCallOrder[0];
      const rowCall = prisma.story.deleteMany.mock.invocationCallOrder[0];
      expect(fileCall).toBeLessThan(rowCall);
    });

    it('a due row whose files were already cleared goes without another S3 call', async () => {
      steps([], [row(1, NOW)]);
      await expect(service.purge(NOW)).resolves.toMatchObject({ purged: 1 });
      expect(storage.deleteKeysReporting).not.toHaveBeenCalled();
    });

    it('if S3 fails entirely, no row is deleted', async () => {
      steps([], [row(1)]);
      storage.deleteKeysReporting.mockResolvedValue({
        failed: [row(1).mediaKey],
      });
      await expect(service.purge(NOW)).resolves.toEqual({
        filesCleared: 0,
        purged: 0,
        kept: 1,
      });
      expect(prisma.story.deleteMany).not.toHaveBeenCalled();
    });

    it('walks forward by id, so a kept story is not retried in the same run', async () => {
      const full = Array.from({ length: 200 }, (_, i) => row(i + 1));
      prisma.story.findMany
        .mockResolvedValueOnce([]) // files step
        .mockResolvedValueOnce(full) // due rows, page 1
        .mockResolvedValueOnce([]); // page 2
      storage.deleteKeysReporting.mockResolvedValue({ failed: [] });

      await expect(service.purge(NOW)).resolves.toMatchObject({ purged: 200 });
      expect(
        callArg<{ where: { id: unknown } }>(prisma.story.findMany, 2).where.id,
      ).toEqual({ gt: id(200) });
    });

    it('running it again with nothing to do changes nothing', async () => {
      prisma.story.findMany.mockResolvedValue([]);
      await expect(service.purge(NOW)).resolves.toEqual({
        filesCleared: 0,
        purged: 0,
        kept: 0,
      });
      expect(storage.deleteKeysReporting).not.toHaveBeenCalled();
    });

    it('a database error is logged, not thrown', async () => {
      prisma.story.findMany.mockRejectedValue(new Error('db down'));
      await expect(service.purge(NOW)).resolves.toEqual({
        filesCleared: 0,
        purged: 0,
        kept: 0,
      });
    });
  });

  describe('deleted story and the 24-hour publish limit', () => {
    const publishedAt = new Date('2026-10-20T10:00:00.000Z');
    // remove() keeps a deleted published story until publishedAt + 24h
    const keptUntil = new Date('2026-10-21T10:00:00.000Z');
    const deletedRow = { status: 'DELETED', expiresAt: keptUntil };
    const matchesDeleted = (now: Date) =>
      (dueForPurge(now).OR as { status: unknown; expiresAt: { lte?: Date } }[])
        .filter((c) => JSON.stringify(c.status).includes('DELETED'))
        .some((c) => (c.expiresAt.lte ?? new Date(0)) >= deletedRow.expiresAt);

    it('its row is not purged while it still counts (a repost stays limited)', () => {
      // Two hours after deleting, the purge leaves the row in place
      expect(matchesDeleted(new Date('2026-10-20T14:00:00.000Z'))).toBe(false);
      expect(publishedAt.getTime() + 24 * 3600 * 1000).toBe(
        keptUntil.getTime(),
      );
    });

    it('it is purged once it no longer counts', () => {
      expect(matchesDeleted(keptUntil)).toBe(true);
    });
  });

  describe('reconcile', () => {
    const old = new Date('2026-10-20T09:00:00.000Z');
    const savedEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });
    afterAll(() => {
      process.env.NODE_ENV = savedEnv;
    });

    it('does nothing outside production, so it cannot delete real files', async () => {
      process.env.NODE_ENV = 'development';
      await expect(service.reconcile(NOW)).resolves.toEqual({
        scanned: 0,
        deleted: 0,
        failed: 0,
      });
      expect(storage.listKeys).not.toHaveBeenCalled();
      expect(storage.deleteKeysReporting).not.toHaveBeenCalled();
    });

    it('does nothing when NODE_ENV is unset (a local API)', async () => {
      delete process.env.NODE_ENV;
      await service.reconcile(NOW);
      expect(storage.listKeys).not.toHaveBeenCalled();
    });

    it('deletes old files no row accounts for, and nothing else', async () => {
      storage.listKeys.mockResolvedValueOnce({
        objects: [
          // Row still exists: the purge's job
          { key: row(1).mediaKey, lastModified: old },
          // Profile deleted: orphan
          { key: row(2).mediaKey, lastModified: old },
          // Too new to judge
          {
            key: row(3).mediaKey,
            lastModified: new Date('2026-10-20T11:30:00Z'),
          },
          // Not a key we make
          { key: 'stories/notes.txt', lastModified: old },
        ],
        nextToken: null,
      });
      prisma.story.findMany.mockResolvedValue([{ id: id(1) }]);
      storage.deleteKeysReporting.mockResolvedValue({ failed: [] });

      await expect(service.reconcile(NOW)).resolves.toEqual({
        scanned: 4,
        deleted: 1,
        failed: 0,
      });
      expect(prisma.story.findMany).toHaveBeenCalledWith({
        where: { id: { in: [id(1), id(2)] } },
        select: { id: true },
      });
      expect(storage.deleteKeysReporting).toHaveBeenCalledWith([
        row(2).mediaKey,
      ]);
    });

    it('follows every page', async () => {
      storage.listKeys
        .mockResolvedValueOnce({ objects: [], nextToken: 't2' })
        .mockResolvedValueOnce({ objects: [], nextToken: null });
      await service.reconcile(NOW);
      expect(storage.listKeys).toHaveBeenNthCalledWith(2, 'stories/', 't2');
    });

    it('reports files it could not delete', async () => {
      storage.listKeys.mockResolvedValueOnce({
        objects: [{ key: row(2).mediaKey, lastModified: old }],
        nextToken: null,
      });
      prisma.story.findMany.mockResolvedValue([]);
      storage.deleteKeysReporting.mockResolvedValue({
        failed: [row(2).mediaKey],
      });
      await expect(service.reconcile(NOW)).resolves.toEqual({
        scanned: 1,
        deleted: 0,
        failed: 1,
      });
    });
  });
});
