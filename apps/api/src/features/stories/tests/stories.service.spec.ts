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
import { StoriesMediaService } from '../stories-media.service';
import { StoriesService, deletedRowKeptUntil } from '../stories.service';
import { callArg } from './test-utils';

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

const NOW = new Date('2026-10-20T12:00:00.000Z');
const AUTHOR = '11111111-1111-4111-8111-111111111111';
const STORY = '22222222-2222-4222-8222-222222222222';

const storyRow = (over: Record<string, unknown> = {}) => ({
  id: STORY,
  identityId: AUTHOR,
  mediaType: 'IMAGE',
  mediaKey: `stories/${AUTHOR}/${STORY}/media.jpg`,
  posterKey: null,
  width: 1080,
  height: 1920,
  durationMs: null,
  caption: 'عرض جديد',
  publishedAt: NOW,
  expiresAt: new Date(NOW.getTime() + 24 * 3600 * 1000),
  property: null,
  ...over,
});

const pending = (over: Record<string, unknown> = {}) => ({
  id: STORY,
  identityId: AUTHOR,
  status: 'PENDING',
  mediaKey: `stories/${AUTHOR}/${STORY}/media.jpg`,
  posterKey: null,
  mediaContentType: 'image/jpeg',
  mediaSizeBytes: 2048,
  expiresAt: new Date(NOW.getTime() + 10 * 60 * 1000),
  failureReason: null,
  ...over,
});

describe('StoriesService', () => {
  let service: StoriesService;
  const prisma = {
    $transaction: jest.fn(),
    // lockKeys runs SELECT pg_advisory_xact_lock(...) through this
    $executeRaw: jest.fn(),
    identity: { findUnique: jest.fn(), findFirst: jest.fn() },
    story: {
      count: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      findMany: jest.fn(),
    },
    storyView: { count: jest.fn(), groupBy: jest.fn(), findMany: jest.fn() },
    providerFavorite: { findUnique: jest.fn() },
    property: { findFirst: jest.fn() },
  };
  const media = {
    mediaKeyFor: jest.fn(
      (identityId: string, storyId: string) =>
        `stories/${identityId}/${storyId}/media.jpg`,
    ),
    presignUpload: jest.fn().mockResolvedValue({
      url: 'https://s3.example/put',
      headers: { 'Content-Type': 'image/jpeg', 'Content-Length': '2048' },
    }),
    checkImage: jest.fn(),
    linksFor: jest.fn().mockResolvedValue({
      mediaUrl: 'https://s3.example/get',
      posterUrl: null,
      urlExpiresAt: new Date(NOW.getTime() + 3600 * 1000),
    }),
    keysOf: jest.fn((s: { mediaKey: string }) => [s.mediaKey]),
  };
  const storage = {
    deleteKeysReporting: jest.fn().mockResolvedValue({ failed: [] }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.identity.findUnique.mockResolvedValue({ type: 'COMPANY' });
    prisma.story.count.mockResolvedValue(0);
    prisma.story.updateMany.mockResolvedValue({ count: 1 });
    prisma.story.findUniqueOrThrow.mockResolvedValue(storyRow());
    prisma.storyView.count.mockResolvedValue(0);
    // Interactive transactions run their callback with the client itself
    prisma.$transaction.mockImplementation(
      (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma),
    );
    prisma.$executeRaw.mockResolvedValue(1);
    // Drop any queued one-off results left by a previous test
    prisma.story.findUnique.mockReset();
    (assertApprovedProvider as jest.Mock).mockResolvedValue(undefined);
    (assertActiveCompanySubscription as jest.Mock).mockResolvedValue(undefined);

    const module = await Test.createTestingModule({
      providers: [
        StoriesService,
        { provide: PrismaService, useValue: prisma },
        { provide: StoriesMediaService, useValue: media },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();
    service = module.get(StoriesService);
  });

  describe('createUpload', () => {
    const dto = {
      mediaType: 'IMAGE' as const,
      contentType: 'image/jpeg' as const,
      sizeBytes: 2048,
    };

    it('issues a pending story with a server-chosen key and a presigned PUT', async () => {
      const slot = await service.createUpload(AUTHOR, dto, NOW);

      expect(prisma.story.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: slot.storyId,
          identityId: AUTHOR,
          status: 'PENDING',
          mediaKey: `stories/${AUTHOR}/${slot.storyId}/media.jpg`,
          mediaContentType: 'image/jpeg',
          mediaSizeBytes: 2048,
          expiresAt: new Date(NOW.getTime() + 30 * 60 * 1000),
        }) as Record<string, unknown>,
      });
      expect(media.presignUpload).toHaveBeenCalledWith(
        slot.storyId,
        `stories/${AUTHOR}/${slot.storyId}/media.jpg`,
        'image/jpeg',
        2048,
      );
      expect(slot.media).toEqual({
        method: 'PUT',
        url: 'https://s3.example/put',
        headers: { 'Content-Type': 'image/jpeg', 'Content-Length': '2048' },
      });
      expect(slot.uploadUrlExpiresAt).toBe('2026-10-20T12:10:00.000Z');
    });

    it("replaces the profile's older pending slot under the profile's lock", async () => {
      await service.createUpload(AUTHOR, dto, NOW);
      expect(prisma.story.updateMany).toHaveBeenCalledWith({
        where: { identityId: AUTHOR, status: 'PENDING' },
        data: { status: 'FAILED', failureReason: 'replaced', expiresAt: NOW },
      });
      // lockKeys: SELECT pg_advisory_xact_lock(hashtext('story:<id>'))
      expect(prisma.$executeRaw).toHaveBeenCalledWith(
        expect.anything(),
        `story:${AUTHOR}`,
      );
      const lock = prisma.$executeRaw.mock.invocationCallOrder[0];
      const replace = prisma.story.updateMany.mock.invocationCallOrder[0];
      const create = prisma.story.create.mock.invocationCallOrder[0];
      expect(lock).toBeLessThan(replace);
      expect(replace).toBeLessThan(create);
    });

    it('the limits are counted again under the lock', async () => {
      // Early check passes; another request filled the limit meanwhile
      prisma.story.count
        .mockResolvedValueOnce(19)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(0);
      const error: unknown = await service
        .createUpload(AUTHOR, dto, NOW)
        .catch((e: unknown) => e);
      expect((error as HttpException).getStatus()).toBe(429);
      const lock = prisma.$executeRaw.mock.invocationCallOrder[0];
      const recount = prisma.story.count.mock.invocationCallOrder[2];
      expect(lock).toBeLessThan(recount);
      expect(prisma.story.create).not.toHaveBeenCalled();
    });

    it('individuals cannot post', async () => {
      prisma.identity.findUnique.mockResolvedValue({ type: 'INDIVIDUAL' });
      await expect(service.createUpload(AUTHOR, dto, NOW)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.story.create).not.toHaveBeenCalled();
    });

    it('offices can post (approval checked, subscription rule passes them)', async () => {
      prisma.identity.findUnique.mockResolvedValue({ type: 'OFFICE' });
      await service.createUpload(AUTHOR, dto, NOW);
      expect(assertApprovedProvider).toHaveBeenCalledWith(prisma, AUTHOR);
      expect(assertActiveCompanySubscription).toHaveBeenCalledWith(
        prisma,
        AUTHOR,
      );
    });

    it('an unapproved provider is refused', async () => {
      (assertApprovedProvider as jest.Mock).mockRejectedValue(
        new ForbiddenException('حسابك قيد المراجعة'),
      );
      await expect(service.createUpload(AUTHOR, dto, NOW)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.story.create).not.toHaveBeenCalled();
    });

    it('a company without a subscription gets SUBSCRIPTION_REQUIRED', async () => {
      (assertActiveCompanySubscription as jest.Mock).mockRejectedValue(
        new ForbiddenException({ code: 'SUBSCRIPTION_REQUIRED' }),
      );
      await expect(service.createUpload(AUTHOR, dto, NOW)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it.each([
      ['20 live stories', 20, 0],
      ['30 published in 24h', 0, 30],
    ])('refuses at %s', async (_label, live, today) => {
      prisma.story.count
        .mockResolvedValueOnce(live)
        .mockResolvedValueOnce(today);
      const error = await service
        .createUpload(AUTHOR, dto, NOW)
        .catch((e: unknown) => e);
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(429);
      expect((error as HttpException).getResponse()).toMatchObject({
        code: 'STORY_LIMIT',
      });
    });
  });

  describe('publish', () => {
    beforeEach(() => {
      prisma.story.findUnique.mockResolvedValue(pending());
      media.checkImage.mockResolvedValue({
        ok: true,
        width: 1080,
        height: 1920,
      });
    });

    it('publishes with sizes from the server check, for 24 hours', async () => {
      const result = await service.publish(
        STORY,
        AUTHOR,
        { caption: '  عرض جديد  ' },
        NOW,
      );
      expect(prisma.story.updateMany).toHaveBeenCalledWith({
        // Still pending and not past its upload deadline
        where: { id: STORY, status: 'PENDING', expiresAt: { gt: NOW } },
        data: {
          status: 'ACTIVE',
          publishedAt: NOW,
          expiresAt: new Date(NOW.getTime() + 24 * 3600 * 1000),
          width: 1080,
          height: 1920,
          caption: 'عرض جديد',
          propertyId: null,
        },
      });
      expect(result).toMatchObject({ id: STORY, viewCount: 0, viewed: true });
    });

    it('an empty caption is stored as none', async () => {
      await service.publish(STORY, AUTHOR, { caption: '   ' }, NOW);
      expect(
        callArg<{
          where: Record<string, unknown>;
          data: Record<string, unknown>;
        }>(prisma.story.updateMany).data.caption,
      ).toBeNull();
    });

    it('publishing again returns the story without checking again', async () => {
      prisma.story.findUnique.mockResolvedValue(pending({ status: 'ACTIVE' }));
      await expect(
        service.publish(STORY, AUTHOR, {}, NOW),
      ).resolves.toMatchObject({ id: STORY });
      expect(media.checkImage).not.toHaveBeenCalled();
      expect(prisma.story.updateMany).not.toHaveBeenCalled();
    });

    it("someone else's story is 404", async () => {
      prisma.story.findUnique.mockResolvedValue(
        pending({ identityId: '99999999-9999-4999-8999-999999999999' }),
      );
      await expect(service.publish(STORY, AUTHOR, {}, NOW)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('a deleted story is 404', async () => {
      prisma.story.findUnique.mockResolvedValue(pending({ status: 'DELETED' }));
      await expect(service.publish(STORY, AUTHOR, {}, NOW)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('past the upload deadline is 410', async () => {
      prisma.story.findUnique.mockResolvedValue(pending({ expiresAt: NOW }));
      await expect(service.publish(STORY, AUTHOR, {}, NOW)).rejects.toThrow(
        GoneException,
      );
      expect(media.checkImage).not.toHaveBeenCalled();
    });

    it('a file not uploaded yet is 409 and the story stays pending', async () => {
      media.checkImage.mockResolvedValue({ ok: false, missing: true });
      await expect(service.publish(STORY, AUTHOR, {}, NOW)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.story.updateMany).not.toHaveBeenCalled();
      expect(storage.deleteKeysReporting).not.toHaveBeenCalled();
    });

    it('a file that fails the check fails the story and its file is deleted', async () => {
      media.checkImage.mockResolvedValue({
        ok: false,
        missing: false,
        reason: 'content_mismatch',
      });
      const error = await service
        .publish(STORY, AUTHOR, {}, NOW)
        .catch((e: unknown) => e);
      expect(error).toBeInstanceOf(UnprocessableEntityException);
      expect((error as HttpException).getResponse()).toMatchObject({
        code: 'STORY_MEDIA_INVALID',
        reason: 'content_mismatch',
      });
      expect(prisma.story.updateMany).toHaveBeenCalledWith({
        where: { id: STORY, status: 'PENDING' },
        data: {
          status: 'FAILED',
          failureReason: 'content_mismatch',
          expiresAt: NOW,
        },
      });
      expect(storage.deleteKeysReporting).toHaveBeenCalledWith([
        `stories/${AUTHOR}/${STORY}/media.jpg`,
      ]);
    });

    it('a failed story keeps answering 422', async () => {
      prisma.story.findUnique.mockResolvedValue(
        pending({ status: 'FAILED', failureReason: 'too_large' }),
      );
      await expect(service.publish(STORY, AUTHOR, {}, NOW)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it("a listing must be the author's own and active", async () => {
      prisma.property.findFirst.mockResolvedValue(null);
      await expect(
        service.publish(
          STORY,
          AUTHOR,
          { propertyId: '33333333-3333-4333-8333-333333333333' },
          NOW,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.property.findFirst).toHaveBeenCalledWith({
        where: {
          id: '33333333-3333-4333-8333-333333333333',
          identityId: AUTHOR,
          status: 'ACTIVE',
        },
        select: { id: true },
      });
      expect(media.checkImage).not.toHaveBeenCalled();
    });

    it('gating is checked again at publish', async () => {
      (assertActiveCompanySubscription as jest.Mock).mockRejectedValue(
        new ForbiddenException({ code: 'SUBSCRIPTION_REQUIRED' }),
      );
      await expect(service.publish(STORY, AUTHOR, {}, NOW)).rejects.toThrow(
        ForbiddenException,
      );
      expect(media.checkImage).not.toHaveBeenCalled();
    });

    it('a parallel publish that already won returns the story', async () => {
      prisma.story.updateMany.mockResolvedValue({ count: 0 });
      prisma.story.findUnique
        .mockResolvedValueOnce(pending())
        .mockResolvedValueOnce({ status: 'ACTIVE' });
      await expect(
        service.publish(STORY, AUTHOR, {}, NOW),
      ).resolves.toMatchObject({ id: STORY });
    });

    it('a state change in between is 409', async () => {
      prisma.story.updateMany.mockResolvedValue({ count: 0 });
      prisma.story.findUnique
        .mockResolvedValueOnce(pending())
        .mockResolvedValueOnce({ status: 'DELETED', expiresAt: NOW });
      await expect(service.publish(STORY, AUTHOR, {}, NOW)).rejects.toThrow(
        ConflictException,
      );
    });

    it('a slot that expired while its file was checked is 410', async () => {
      prisma.story.updateMany.mockResolvedValue({ count: 0 });
      prisma.story.findUnique
        .mockResolvedValueOnce(pending())
        .mockResolvedValueOnce({ status: 'PENDING', expiresAt: NOW });
      await expect(service.publish(STORY, AUTHOR, {}, NOW)).rejects.toThrow(
        GoneException,
      );
    });

    it('checks S3 first, then locks, counts again and activates', async () => {
      await service.publish(STORY, AUTHOR, {}, NOW);
      const s3 = media.checkImage.mock.invocationCallOrder[0];
      const lock = prisma.$executeRaw.mock.invocationCallOrder[0];
      // count calls: 0-1 early check, 2-3 under the lock
      const recount = prisma.story.count.mock.invocationCallOrder[2];
      const activate = prisma.story.updateMany.mock.invocationCallOrder[0];
      expect(s3).toBeLessThan(lock);
      expect(lock).toBeLessThan(recount);
      expect(recount).toBeLessThan(activate);
    });

    it('a limit filled while the file was checked stops the publish', async () => {
      prisma.story.count
        .mockResolvedValueOnce(19)
        .mockResolvedValueOnce(29)
        .mockResolvedValueOnce(19)
        .mockResolvedValueOnce(30);
      const error: unknown = await service
        .publish(STORY, AUTHOR, {}, NOW)
        .catch((e: unknown) => e);
      expect((error as HttpException).getStatus()).toBe(429);
      expect(prisma.story.updateMany).not.toHaveBeenCalled();
    });

    it('a failed file that S3 deleted is recorded as cleared', async () => {
      media.checkImage.mockResolvedValue({
        ok: false,
        missing: false,
        reason: 'too_large',
      });
      await service.publish(STORY, AUTHOR, {}, NOW).catch(() => undefined);
      expect(prisma.story.updateMany).toHaveBeenLastCalledWith({
        where: { id: STORY, mediaDeletedAt: null },
        data: { mediaDeletedAt: NOW },
      });
    });
  });

  describe('remove', () => {
    const publishedAt = new Date('2026-10-20T10:00:00.000Z');

    it('deletes the files at once but keeps the row counting for 24 hours', async () => {
      prisma.story.findUnique.mockResolvedValue(
        pending({ status: 'ACTIVE', publishedAt }),
      );
      await service.remove(STORY, AUTHOR, NOW);
      expect(prisma.story.updateMany).toHaveBeenNthCalledWith(1, {
        where: { id: STORY, status: { in: ['PENDING', 'ACTIVE'] } },
        data: {
          status: 'DELETED',
          deletedAt: NOW,
          // publishedAt + 24h: still inside the rolling publish count
          expiresAt: new Date('2026-10-21T10:00:00.000Z'),
        },
      });
      expect(storage.deleteKeysReporting).toHaveBeenCalledWith([
        `stories/${AUTHOR}/${STORY}/media.jpg`,
      ]);
      expect(prisma.story.updateMany).toHaveBeenNthCalledWith(2, {
        where: { id: STORY, mediaDeletedAt: null },
        data: { mediaDeletedAt: NOW },
      });
    });

    it('if S3 fails, the files are left for the cleanup to retry', async () => {
      prisma.story.findUnique.mockResolvedValue(
        pending({ status: 'ACTIVE', publishedAt }),
      );
      storage.deleteKeysReporting.mockResolvedValueOnce({
        failed: [`stories/${AUTHOR}/${STORY}/media.jpg`],
      });
      await service.remove(STORY, AUTHOR, NOW);
      // Marked deleted, but not recorded as cleared
      expect(prisma.story.updateMany).toHaveBeenCalledTimes(1);
    });

    it('a story never published goes at once', async () => {
      prisma.story.findUnique.mockResolvedValue(pending({ publishedAt: null }));
      await service.remove(STORY, AUTHOR, NOW);
      expect(prisma.story.updateMany).toHaveBeenNthCalledWith(1, {
        where: { id: STORY, status: { in: ['PENDING', 'ACTIVE'] } },
        data: { status: 'DELETED', deletedAt: NOW, expiresAt: NOW },
      });
    });

    it('deleting then posting again still meets the 24-hour publish limit', async () => {
      // The publish count has no status filter, so the kept deleted rows
      // are counted; 30 of them refuse the next upload
      prisma.story.count.mockResolvedValueOnce(0).mockResolvedValueOnce(30);
      const error: unknown = await service
        .createUpload(
          AUTHOR,
          { mediaType: 'IMAGE', contentType: 'image/jpeg', sizeBytes: 1 },
          NOW,
        )
        .catch((e: unknown) => e);
      expect((error as HttpException).getStatus()).toBe(429);
      const publishCount = callArg<{ where: Record<string, unknown> }>(
        prisma.story.count,
        1,
      ).where;
      expect(publishCount).toEqual({
        identityId: AUTHOR,
        publishedAt: { gt: new Date(NOW.getTime() - 24 * 3600 * 1000) },
      });
      expect(publishCount).not.toHaveProperty('status');
    });

    it('deleting again does nothing', async () => {
      prisma.story.findUnique.mockResolvedValue(pending({ status: 'DELETED' }));
      await service.remove(STORY, AUTHOR, NOW);
      expect(prisma.story.updateMany).not.toHaveBeenCalled();
    });

    it("someone else's story is 404", async () => {
      prisma.story.findUnique.mockResolvedValue(
        pending({ identityId: '99999999-9999-4999-8999-999999999999' }),
      );
      await expect(service.remove(STORY, AUTHOR, NOW)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findMine', () => {
    it('only live stories, with their view counts', async () => {
      prisma.story.findMany.mockResolvedValue([storyRow()]);
      prisma.storyView.groupBy.mockResolvedValue([
        { storyId: STORY, _count: { _all: 3 } },
      ]);
      const result = await service.findMine(AUTHOR, NOW);
      expect(
        callArg<{
          where: Record<string, unknown>;
          data: Record<string, unknown>;
        }>(prisma.story.findMany).where,
      ).toEqual({
        identityId: AUTHOR,
        status: 'ACTIVE',
        expiresAt: { gt: NOW },
      });
      expect(result.stories[0]).toMatchObject({ id: STORY, viewCount: 3 });
    });
  });

  describe('findByAuthor', () => {
    const author = {
      id: AUTHOR,
      type: 'COMPANY',
      companyData: { name: 'شركة البنيان', logoUrl: null, isVerified: true },
      officeData: null,
    };

    it('marks seen stories and opens at the first unseen one', async () => {
      prisma.identity.findFirst.mockResolvedValue(author);
      const second = '44444444-4444-4444-8444-444444444444';
      prisma.story.findMany.mockResolvedValue([
        storyRow(),
        storyRow({ id: second }),
      ]);
      prisma.storyView.findMany.mockResolvedValue([{ storyId: STORY }]);
      prisma.providerFavorite.findUnique.mockResolvedValue({ id: 'f' });

      const result = await service.findByAuthor('viewer', AUTHOR, NOW);
      expect(result).toMatchObject({
        author: { identityId: AUTHOR, type: 'COMPANY', name: 'شركة البنيان' },
        followed: true,
        hasUnseen: true,
        firstUnseenIndex: 1,
      });
      expect(result.stories.map((s) => s.viewed)).toEqual([true, false]);
    });

    it('an author who may not appear is 404', async () => {
      prisma.identity.findFirst.mockResolvedValue(null);
      await expect(service.findByAuthor('viewer', AUTHOR, NOW)).rejects.toThrow(
        NotFoundException,
      );
      expect(
        callArg<{
          where: Record<string, unknown>;
          data: Record<string, unknown>;
        }>(prisma.identity.findFirst).where,
      ).toMatchObject({
        id: AUTHOR,
        user: { isDisabled: false, isBlocked: false },
      });
    });
  });

  describe('deletedRowKeptUntil', () => {
    it('a published story: publishedAt + 24h', () => {
      expect(
        deletedRowKeptUntil(new Date('2026-10-20T10:00:00.000Z'), NOW),
      ).toEqual(new Date('2026-10-21T10:00:00.000Z'));
    });
    it('never earlier than now', () => {
      expect(
        deletedRowKeptUntil(new Date('2026-10-18T10:00:00.000Z'), NOW),
      ).toEqual(NOW);
    });
    it('never published: now', () => {
      expect(deletedRowKeptUntil(null, NOW)).toEqual(NOW);
    });
  });
});
