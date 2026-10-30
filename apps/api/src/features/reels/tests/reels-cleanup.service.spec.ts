import { PrismaService } from '../../../core/prisma/prisma.service';
import { StorageService } from '../../../core/storage/storage.service';
import { dueForPurge, ReelsCleanupService } from '../reels-cleanup.service';
import { ReelsMediaService } from '../reels-media.service';

const NOW = new Date('2026-10-30T12:00:00.000Z');
const AUTHOR = '11111111-1111-4111-8111-111111111111';
const REEL = '22222222-2222-4222-8222-222222222222';
const OTHER = '44444444-4444-4444-8444-444444444444';
const OLD = new Date(NOW.getTime() - 2 * 3600 * 1000);

const row = (over: Record<string, unknown> = {}) => ({
  id: REEL,
  mediaKey: `reels/${AUTHOR}/${REEL}/media.mp4`,
  posterKey: `reels/${AUTHOR}/${REEL}/poster.jpg`,
  mediaDeletedAt: null,
  ...over,
});

describe('ReelsCleanupService', () => {
  const prisma = {
    reel: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };
  const storage = {
    deleteKeysReporting: jest.fn(),
    listKeys: jest.fn(),
  };
  const media = new ReelsMediaService(
    { publicUrl: jest.fn() } as unknown as StorageService,
    {} as never,
  );
  const service = new ReelsCleanupService(
    prisma as unknown as PrismaService,
    storage as unknown as StorageService,
    media,
  );
  const savedEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.resetAllMocks();
    delete process.env.REELS_S3_PREFIX;
    prisma.reel.findMany.mockResolvedValue([]);
    prisma.reel.updateMany.mockResolvedValue({ count: 1 });
    prisma.reel.deleteMany.mockResolvedValue({ count: 1 });
    storage.deleteKeysReporting.mockResolvedValue({ failed: [] });
  });
  afterAll(() => {
    process.env.NODE_ENV = savedEnv;
  });

  describe('dueForPurge', () => {
    it('never includes an active reel', () => {
      const statuses = (dueForPurge(NOW).OR ?? []).map((c) => c.status);
      expect(statuses).toEqual(['PENDING', 'FAILED', 'DELETED', 'DELETED']);
    });

    it('keeps a deleted reel while it counts toward the limit', () => {
      expect(dueForPurge(NOW).OR?.[3]).toEqual({
        status: 'DELETED',
        publishedAt: { lte: new Date('2026-10-29T12:00:00.000Z') },
      });
    });
  });

  describe('purge', () => {
    it("clears a deleted reel's files, and records it", async () => {
      prisma.reel.findMany.mockResolvedValueOnce([row()]).mockResolvedValue([]);
      await expect(service.purge(NOW)).resolves.toEqual({
        filesCleared: 1,
        purged: 0,
        kept: 0,
      });
      expect(storage.deleteKeysReporting).toHaveBeenCalledWith([
        row().mediaKey,
        row().posterKey,
      ]);
    });

    it('keeps the row when a file could not be deleted', async () => {
      prisma.reel.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([row()]);
      storage.deleteKeysReporting.mockResolvedValue({
        failed: [row().posterKey],
      });
      await expect(service.purge(NOW)).resolves.toEqual({
        filesCleared: 0,
        purged: 0,
        kept: 1,
      });
      expect(prisma.reel.deleteMany).not.toHaveBeenCalled();
    });

    it('deletes a due row only under the same rule', async () => {
      prisma.reel.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([row({ mediaDeletedAt: NOW })]);
      await service.purge(NOW);
      expect(storage.deleteKeysReporting).not.toHaveBeenCalled();
      expect(prisma.reel.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [REEL] }, ...dueForPurge(NOW) },
      });
    });
  });

  describe('reconcile', () => {
    const page = {
      objects: [
        { key: row().mediaKey, lastModified: OLD },
        { key: `reels/${AUTHOR}/${OTHER}/media.mp4`, lastModified: OLD },
        // Young: an upload may be on its way
        { key: `reels/${AUTHOR}/${OTHER}/poster.jpg`, lastModified: NOW },
        // Not ours
        { key: 'reels/readme.txt', lastModified: OLD },
      ],
      nextToken: null,
    };

    it('does nothing outside production, so it cannot delete real files', async () => {
      process.env.NODE_ENV = 'development';
      await expect(service.reconcile(NOW)).resolves.toEqual({
        scanned: 0,
        deleted: 0,
        failed: 0,
      });
      expect(storage.listKeys).not.toHaveBeenCalled();
    });

    it('in production deletes only old files with no row', async () => {
      process.env.NODE_ENV = 'production';
      storage.listKeys.mockResolvedValue(page);
      prisma.reel.findMany.mockResolvedValue([{ id: REEL }]);
      await expect(service.reconcile(NOW)).resolves.toEqual({
        scanned: 4,
        deleted: 1,
        failed: 0,
      });
      expect(storage.listKeys).toHaveBeenCalledWith('reels/', undefined);
      expect(storage.deleteKeysReporting).toHaveBeenCalledWith([
        `reels/${AUTHOR}/${OTHER}/media.mp4`,
      ]);
    });
  });
});
