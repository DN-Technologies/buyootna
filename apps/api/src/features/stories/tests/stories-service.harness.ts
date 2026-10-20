/**
 * Shared setup for the StoriesService specs (publishing, reads, views):
 * the mocked database, S3 media and storage, fixtures, and a fresh service
 * before each test. Each spec still declares its own jest.mock() calls
 * (they're hoisted per file):
 *
 *   jest.mock('../../identities/persona-rules', …assertApprovedProvider…)
 *   jest.mock('../../company-subscriptions/company-subscription.rules', …)
 */
import { Test } from '@nestjs/testing';

import { PrismaService } from '../../../core/prisma/prisma.service';
import { StorageService } from '../../../core/storage/storage.service';
import { assertActiveCompanySubscription } from '../../company-subscriptions/company-subscription.rules';
import { assertApprovedProvider } from '../../identities/persona-rules';
import { StoriesMediaService } from '../stories-media.service';
import { StoriesService } from '../stories.service';

export const NOW = new Date('2026-10-20T12:00:00.000Z');
export const AUTHOR = '11111111-1111-4111-8111-111111111111';
export const STORY = '22222222-2222-4222-8222-222222222222';
export const VIEWER = { identityId: 'viewer', userId: 'viewer-user' };

/** A published story as the reads select it. */
export const storyRow = (over: Record<string, unknown> = {}) => ({
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

/** A slot waiting for its upload, as publish selects it. */
export const pending = (over: Record<string, unknown> = {}) => ({
  id: STORY,
  identityId: AUTHOR,
  status: 'PENDING',
  mediaType: 'IMAGE',
  mediaKey: `stories/${AUTHOR}/${STORY}/media.jpg`,
  posterKey: null,
  posterSizeBytes: null,
  mediaContentType: 'image/jpeg',
  mediaSizeBytes: 2048,
  expiresAt: new Date(NOW.getTime() + 10 * 60 * 1000),
  failureReason: null,
  ...over,
});

/**
 * Call inside a describe: registers the beforeEach that resets every mock
 * and builds a new StoriesService; read `service` from the result in tests.
 */
export function setupStoriesService() {
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
    storyView: {
      count: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
      createMany: jest.fn(),
    },
    providerFavorite: { findUnique: jest.fn() },
    property: { findFirst: jest.fn() },
  };
  const media = {
    mediaKeyFor: jest.fn(
      (identityId: string, storyId: string, type: string) =>
        `stories/${identityId}/${storyId}/media.${type === 'video/mp4' ? 'mp4' : 'jpg'}`,
    ),
    posterKeyFor: jest.fn(
      (identityId: string, storyId: string) =>
        `stories/${identityId}/${storyId}/poster.jpg`,
    ),
    presignUpload: jest.fn().mockResolvedValue({
      url: 'https://s3.example/put',
      headers: { 'Content-Type': 'image/jpeg', 'Content-Length': '2048' },
    }),
    checkImage: jest.fn(),
    checkVideo: jest.fn(),
    linksFor: jest.fn().mockResolvedValue({
      mediaUrl: 'https://s3.example/get',
      posterUrl: null,
      urlExpiresAt: new Date(NOW.getTime() + 3600 * 1000),
    }),
    keysOf: jest.fn((s: { mediaKey: string; posterKey: string | null }) =>
      s.posterKey ? [s.mediaKey, s.posterKey] : [s.mediaKey],
    ),
  };
  const storage = {
    deleteKeysReporting: jest.fn().mockResolvedValue({ failed: [] }),
  };
  const harness = {
    prisma,
    media,
    storage,
    service: undefined as unknown as StoriesService,
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
    harness.service = module.get(StoriesService);
  });

  return harness;
}
