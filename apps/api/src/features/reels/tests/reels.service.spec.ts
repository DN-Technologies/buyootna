import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  HttpException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { PrismaService } from '../../../core/prisma/prisma.service';
import { StorageService } from '../../../core/storage/storage.service';
import { assertActiveCompanySubscription } from '../../company-subscriptions/company-subscription.rules';
import { assertApprovedProvider } from '../../identities/persona-rules';
import { ReelsMediaService } from '../reels-media.service';
import { ReelsService } from '../reels.service';

// The real lockKeys runs (against the mocked $executeRaw); only the
// approval check is stubbed
jest.mock('../../identities/persona-rules', () => ({
  ...jest.requireActual<Record<string, unknown>>(
    '../../identities/persona-rules',
  ),
  assertApprovedProvider: jest.fn(),
}));
jest.mock('../../company-subscriptions/company-subscription.rules', () => ({
  assertActiveCompanySubscription: jest.fn(),
}));

const NOW = new Date('2026-10-30T12:00:00.000Z');
const AUTHOR = '11111111-1111-4111-8111-111111111111';
const REEL = '22222222-2222-4222-8222-222222222222';
const PROPERTY = '33333333-3333-4333-8333-333333333333';

const pending = (over: Record<string, unknown> = {}) => ({
  id: REEL,
  identityId: AUTHOR,
  status: 'PENDING',
  mediaKey: `reels/${AUTHOR}/${REEL}/media.mp4`,
  posterKey: `reels/${AUTHOR}/${REEL}/poster.jpg`,
  posterSizeBytes: 1000,
  mediaContentType: 'video/mp4',
  mediaSizeBytes: 2048,
  uploadExpiresAt: new Date(NOW.getTime() + 10 * 60 * 1000),
  failureReason: null,
  ...over,
});

const published = (over: Record<string, unknown> = {}) => ({
  id: REEL,
  identityId: AUTHOR,
  mediaKey: `reels/${AUTHOR}/${REEL}/media.mp4`,
  posterKey: `reels/${AUTHOR}/${REEL}/poster.jpg`,
  width: 720,
  height: 1280,
  durationMs: 45_000,
  caption: 'عرض جديد',
  publishedAt: NOW,
  createdAt: NOW,
  viewCount: 0,
  likeCount: 0,
  property: null,
  ...over,
});

const UPLOAD = {
  contentType: 'video/mp4' as const,
  sizeBytes: 2048,
  poster: { contentType: 'image/jpeg' as const, sizeBytes: 1000 },
};

describe('ReelsService', () => {
  const prisma = {
    $transaction: jest.fn(),
    // lockKeys runs SELECT pg_advisory_xact_lock(...) through this
    $executeRaw: jest.fn(),
    identity: { findUnique: jest.fn() },
    property: { findFirst: jest.fn() },
    reel: {
      count: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
  };
  const media = {
    mediaKeyFor: jest.fn(
      (identityId: string, id: string) => `reels/${identityId}/${id}/media.mp4`,
    ),
    posterKeyFor: jest.fn(
      (identityId: string, id: string) =>
        `reels/${identityId}/${id}/poster.jpg`,
    ),
    presignUpload: jest.fn().mockResolvedValue({
      url: 'https://s3.example/put',
      headers: { 'Content-Type': 'video/mp4' },
    }),
    checkVideo: jest.fn(),
    linksFor: jest.fn().mockReturnValue({
      mediaUrl: 'https://s3.example/media.mp4',
      posterUrl: 'https://s3.example/poster.jpg',
    }),
    keysOf: jest.fn((r: { mediaKey: string; posterKey: string }) => [
      r.mediaKey,
      r.posterKey,
    ]),
  };
  const storage = {
    deleteKeysReporting: jest.fn().mockResolvedValue({ failed: [] }),
  };
  let service: ReelsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.identity.findUnique.mockResolvedValue({ type: 'COMPANY' });
    prisma.reel.count.mockResolvedValue(0);
    prisma.reel.updateMany.mockResolvedValue({ count: 1 });
    prisma.reel.findUnique.mockReset();
    prisma.reel.findUniqueOrThrow.mockResolvedValue(published());
    prisma.$transaction.mockImplementation(
      (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma),
    );
    prisma.$executeRaw.mockResolvedValue(1);
    media.checkVideo.mockResolvedValue({
      ok: true,
      width: 720,
      height: 1280,
      durationMs: 45_000,
    });
    storage.deleteKeysReporting.mockResolvedValue({ failed: [] });
    (assertApprovedProvider as jest.Mock).mockResolvedValue(undefined);
    (assertActiveCompanySubscription as jest.Mock).mockResolvedValue(undefined);

    const module = await Test.createTestingModule({
      providers: [
        ReelsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ReelsMediaService, useValue: media },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();
    service = module.get(ReelsService);
  });

  describe('createUpload', () => {
    it('replaces the older pending slot and signs both files', async () => {
      const slot = await service.createUpload(AUTHOR, UPLOAD, NOW);

      expect(prisma.reel.updateMany).toHaveBeenCalledWith({
        where: { identityId: AUTHOR, status: 'PENDING' },
        data: { status: 'FAILED', failureReason: 'replaced' },
      });
      expect(prisma.reel.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: slot.reelId,
          identityId: AUTHOR,
          status: 'PENDING',
          mediaSizeBytes: 2048,
          posterSizeBytes: 1000,
        }) as unknown,
      });
      expect(media.presignUpload).toHaveBeenCalledTimes(2);
      expect(slot.publishBefore).toBe('2026-10-30T12:30:00.000Z');
      expect(slot.uploadUrlExpiresAt).toBe('2026-10-30T12:10:00.000Z');
      expect(slot.poster.method).toBe('PUT');
    });

    it('takes the profile lock before changing anything', async () => {
      await service.createUpload(AUTHOR, UPLOAD, NOW);
      expect(prisma.$executeRaw.mock.invocationCallOrder[0]).toBeLessThan(
        prisma.reel.create.mock.invocationCallOrder[0],
      );
    });

    it('refuses anyone but a company or office', async () => {
      prisma.identity.findUnique.mockResolvedValue({ type: 'INDIVIDUAL' });
      await expect(service.createUpload(AUTHOR, UPLOAD, NOW)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.reel.create).not.toHaveBeenCalled();
    });

    it('refuses at the limit of 10 in 24 hours', async () => {
      prisma.reel.count.mockResolvedValue(10);
      await expect(
        service.createUpload(AUTHOR, UPLOAD, NOW),
      ).rejects.toMatchObject({
        response: { code: 'REEL_LIMIT' },
      });
      await expect(service.createUpload(AUTHOR, UPLOAD, NOW)).rejects.toThrow(
        HttpException,
      );
    });

    it('counts deleted reels toward the limit (no status filter)', async () => {
      await service.createUpload(AUTHOR, UPLOAD, NOW);
      expect(prisma.reel.count).toHaveBeenCalledWith({
        where: {
          identityId: AUTHOR,
          publishedAt: { gt: new Date('2026-10-29T12:00:00.000Z') },
        },
      });
    });
  });

  describe('publish', () => {
    it('activates a checked reel with the server-measured values', async () => {
      prisma.reel.findUnique.mockResolvedValue(pending());
      await service.publish(REEL, AUTHOR, { caption: '  عرض  ' }, NOW);

      expect(prisma.reel.updateMany).toHaveBeenCalledWith({
        where: {
          id: REEL,
          status: 'PENDING',
          uploadExpiresAt: { gt: NOW },
        },
        data: {
          status: 'ACTIVE',
          publishedAt: NOW,
          width: 720,
          height: 1280,
          durationMs: 45_000,
          caption: 'عرض',
          propertyId: null,
          hadListing: false,
        },
      });
    });

    it('remembers the reel was linked to a listing', async () => {
      prisma.reel.findUnique.mockResolvedValue(pending());
      prisma.property.findFirst.mockResolvedValue({ id: PROPERTY });
      await service.publish(REEL, AUTHOR, { propertyId: PROPERTY }, NOW);
      expect(prisma.reel.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            propertyId: PROPERTY,
            hadListing: true,
          }) as unknown,
        }),
      );
    });

    it("refuses a listing that isn't the author's own active one", async () => {
      prisma.reel.findUnique.mockResolvedValue(pending());
      prisma.property.findFirst.mockResolvedValue(null);
      await expect(
        service.publish(REEL, AUTHOR, { propertyId: PROPERTY }, NOW),
      ).rejects.toThrow(BadRequestException);
      expect(media.checkVideo).not.toHaveBeenCalled();
    });

    it('repeating it returns the published reel without checking again', async () => {
      prisma.reel.findUnique.mockResolvedValue(pending({ status: 'ACTIVE' }));
      await expect(
        service.publish(REEL, AUTHOR, {}, NOW),
      ).resolves.toMatchObject({
        id: REEL,
        mediaUrl: 'https://s3.example/media.mp4',
      });
      expect(media.checkVideo).not.toHaveBeenCalled();
    });

    it("answers 404 for someone else's or a deleted reel", async () => {
      prisma.reel.findUnique.mockResolvedValue(
        pending({ identityId: 'someone-else' }),
      );
      await expect(service.publish(REEL, AUTHOR, {}, NOW)).rejects.toThrow(
        NotFoundException,
      );
      prisma.reel.findUnique.mockResolvedValue(pending({ status: 'DELETED' }));
      await expect(service.publish(REEL, AUTHOR, {}, NOW)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('refuses after the upload window', async () => {
      prisma.reel.findUnique.mockResolvedValue(
        pending({ uploadExpiresAt: NOW }),
      );
      await expect(service.publish(REEL, AUTHOR, {}, NOW)).rejects.toThrow(
        GoneException,
      );
    });

    it('stays pending while the files are not there yet', async () => {
      prisma.reel.findUnique.mockResolvedValue(pending());
      media.checkVideo.mockResolvedValue({ ok: false, missing: true });
      await expect(service.publish(REEL, AUTHOR, {}, NOW)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.reel.updateMany).not.toHaveBeenCalled();
      expect(storage.deleteKeysReporting).not.toHaveBeenCalled();
    });

    it('fails a refused file and deletes it at once, because it is public', async () => {
      prisma.reel.findUnique.mockResolvedValue(pending());
      media.checkVideo.mockResolvedValue({
        ok: false,
        missing: false,
        reason: 'too_long',
      });
      await expect(service.publish(REEL, AUTHOR, {}, NOW)).rejects.toThrow(
        UnprocessableEntityException,
      );
      expect(prisma.reel.updateMany).toHaveBeenCalledWith({
        where: { id: REEL, status: 'PENDING' },
        data: { status: 'FAILED', failureReason: 'too_long' },
      });
      expect(storage.deleteKeysReporting).toHaveBeenCalledWith([
        `reels/${AUTHOR}/${REEL}/media.mp4`,
        `reels/${AUTHOR}/${REEL}/poster.jpg`,
      ]);
      expect(prisma.reel.updateMany).toHaveBeenCalledWith({
        where: { id: REEL, mediaDeletedAt: null },
        data: { mediaDeletedAt: NOW },
      });
    });

    it('says why a failed reel failed when it is published again', async () => {
      prisma.reel.findUnique.mockResolvedValue(
        pending({ status: 'FAILED', failureReason: 'too_long' }),
      );
      await expect(
        service.publish(REEL, AUTHOR, {}, NOW),
      ).rejects.toMatchObject({
        response: { code: 'REEL_MEDIA_INVALID', reason: 'too_long' },
      });
    });

    it('returns the reel when a parallel publish won', async () => {
      prisma.reel.findUnique
        .mockResolvedValueOnce(pending())
        .mockResolvedValueOnce({
          status: 'ACTIVE',
          uploadExpiresAt: pending().uploadExpiresAt,
        });
      prisma.reel.updateMany.mockResolvedValue({ count: 0 });
      await expect(
        service.publish(REEL, AUTHOR, {}, NOW),
      ).resolves.toMatchObject({ id: REEL });
    });
  });

  describe('remove', () => {
    it('leaves every read at once and deletes the files now', async () => {
      prisma.reel.findUnique.mockResolvedValue(pending({ status: 'ACTIVE' }));
      await service.remove(REEL, AUTHOR, NOW);
      expect(prisma.reel.updateMany).toHaveBeenCalledWith({
        where: { id: REEL, status: { in: ['PENDING', 'ACTIVE'] } },
        data: { status: 'DELETED', deletedAt: NOW },
      });
      expect(storage.deleteKeysReporting).toHaveBeenCalled();
    });

    it('leaves the files to the cleanup if S3 fails', async () => {
      prisma.reel.findUnique.mockResolvedValue(pending({ status: 'ACTIVE' }));
      storage.deleteKeysReporting.mockResolvedValue({ failed: ['x'] });
      await service.remove(REEL, AUTHOR, NOW);
      expect(prisma.reel.updateMany).toHaveBeenCalledTimes(1);
    });

    it('is harmless to repeat', async () => {
      prisma.reel.findUnique.mockResolvedValue(pending({ status: 'DELETED' }));
      await service.remove(REEL, AUTHOR, NOW);
      expect(prisma.reel.updateMany).not.toHaveBeenCalled();
    });

    it("answers 404 for someone else's", async () => {
      prisma.reel.findUnique.mockResolvedValue(
        pending({ identityId: 'someone-else' }),
      );
      await expect(service.remove(REEL, AUTHOR, NOW)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
