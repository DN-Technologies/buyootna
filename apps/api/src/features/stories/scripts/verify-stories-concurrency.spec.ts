/**
 * Concurrency checks for Stories against a REAL Postgres: the per-profile
 * advisory lock (lockKeys) must keep simultaneous requests within the rules.
 *  - many upload-slot requests at once leave exactly one pending slot;
 *  - many publishes at once never exceed 20 live stories, nor 30 published
 *    in 24 hours (deleted stories included);
 *  - the same view or the same report sent many times at once is stored
 *    once (primary key / unique key).
 * An in-memory database can't run these (no concurrent sessions or
 * advisory locks), so they need a real one. S3 is stubbed: this checks the
 * database logic only.
 *
 * Gated behind VERIFY_STORIES_DB so ordinary `pnpm test` runs skip it. Point
 * it at a THROWAWAY database with all migrations applied, never a shared or
 * production one:
 *
 *   VERIFY_STORIES_DB=1 \
 *     DATABASE_URL=postgresql://postgres:test@localhost:55432/buyootna_test \
 *     pnpm --filter api test -- --runTestsByPath src/features/stories/scripts/verify-stories-concurrency.spec.ts
 */
import { randomUUID } from 'crypto';

import { HttpException } from '@nestjs/common';

import { PrismaService } from '../../../core/prisma/prisma.service';
import { StorageService } from '../../../core/storage/storage.service';
import { ReportsService } from '../../reports/reports.service';
import { StoriesMediaService } from '../stories-media.service';
import { StoriesService } from '../stories.service';

const describeIfDb = process.env.VERIFY_STORIES_DB ? describe : describe.skip;

const CONCURRENT = 8;
const HOUR = 60 * 60 * 1000;

describeIfDb('Stories limits (real Postgres concurrency)', () => {
  let prisma: PrismaService;
  let service: StoriesService;
  let userId: string;
  let officeId: string;
  let viewerUserId: string;
  let viewerId: string;
  let reports: ReportsService;

  // No S3: every file "passes" the check and links are placeholders
  const media = {
    mediaKeyFor: (identityId: string, storyId: string) =>
      `stories/${identityId}/${storyId}/media.jpg`,
    presignUpload: () =>
      Promise.resolve({ url: 'https://test/put', headers: {} }),
    checkImage: () => Promise.resolve({ ok: true, width: 10, height: 10 }),
    linksFor: (s: { expiresAt: Date }) =>
      Promise.resolve({
        mediaUrl: 'https://test/get',
        posterUrl: null,
        urlExpiresAt: s.expiresAt,
      }),
    keysOf: (s: { mediaKey: string }) => [s.mediaKey],
  } as unknown as StoriesMediaService;
  const storage = {
    deleteKeysReporting: () => Promise.resolve({ failed: [] }),
  } as unknown as StorageService;

  const stories = (where: Record<string, unknown>) =>
    prisma.story.count({ where: { identityId: officeId, ...where } });

  /** Rows inserted directly, bypassing the service (setting up a state). */
  const seed = (n: number, data: Record<string, unknown>) =>
    prisma.story.createMany({
      data: Array.from({ length: n }, () => {
        const id = randomUUID();
        return {
          id,
          identityId: officeId,
          mediaType: 'IMAGE' as const,
          mediaKey: `stories/${officeId}/${id}/media.jpg`,
          mediaContentType: 'image/jpeg',
          mediaSizeBytes: 1,
          ...data,
        } as never;
      }),
    });

  const settle = <T>(ps: Promise<T>[]) => Promise.allSettled(ps);
  const limited = (r: PromiseSettledResult<unknown>) =>
    r.status === 'rejected' &&
    r.reason instanceof HttpException &&
    r.reason.getStatus() === 429;

  beforeAll(() => {
    prisma = new PrismaService();
    service = new StoriesService(prisma, media, storage);
    reports = new ReportsService(prisma);
  });

  beforeEach(async () => {
    const suffix = randomUUID();
    const user = await prisma.user.create({
      data: { password: 'x', email: `stories-${suffix}@test.local` },
    });
    userId = user.id;
    // An approved office: offices need no subscription
    const office = await prisma.identity.create({
      data: {
        userId,
        type: 'OFFICE',
        officeData: {
          create: {
            name: 'مكتب اختبار',
            licenseNumber: `T-${suffix}`,
            status: 'APPROVED',
          },
        },
      },
    });
    officeId = office.id;
    // A viewer on another account
    const viewerUser = await prisma.user.create({
      data: { password: 'x', email: `viewer-${suffix}@test.local` },
    });
    viewerUserId = viewerUser.id;
    const viewer = await prisma.identity.create({
      data: {
        userId: viewerUserId,
        type: 'INDIVIDUAL',
        individualData: { create: { name: 'مشاهد' } },
      },
    });
    viewerId = viewer.id;
  });

  afterEach(async () => {
    // Cascades to the identity, its stories and views
    // Reports are kept for admins; remove this run's before the users
    await prisma.report.deleteMany({ where: { reporterUserId: viewerUserId } });
    await prisma.user.delete({ where: { id: viewerUserId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it(`${CONCURRENT} upload-slot requests at once leave exactly one pending slot`, async () => {
    const results = await settle(
      Array.from({ length: CONCURRENT }, () =>
        service.createUpload(officeId, {
          mediaType: 'IMAGE',
          contentType: 'image/jpeg',
          sizeBytes: 1,
        }),
      ),
    );
    expect(results.every((r) => r.status === 'fulfilled')).toBe(true);
    expect(await stories({ status: 'PENDING' })).toBe(1);
    expect(await stories({ status: 'FAILED' })).toBe(CONCURRENT - 1);
  });

  it('simultaneous publishes never pass 20 live stories', async () => {
    const now = new Date();
    await seed(19, {
      status: 'ACTIVE',
      publishedAt: new Date(now.getTime() - 2 * HOUR),
      expiresAt: new Date(now.getTime() + 20 * HOUR),
    });
    await seed(CONCURRENT, {
      status: 'PENDING',
      expiresAt: new Date(now.getTime() + HOUR),
    });
    const pending = await prisma.story.findMany({
      where: { identityId: officeId, status: 'PENDING' },
      select: { id: true },
    });

    const results = await settle(
      pending.map((p) => service.publish(p.id, officeId, {})),
    );
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter(limited)).toHaveLength(CONCURRENT - 1);
    expect(await stories({ status: 'ACTIVE' })).toBe(20);
  });

  it('simultaneous publishes never pass 30 in 24 hours, deleted ones included', async () => {
    const now = new Date();
    // 29 published in the last day and since deleted (rows kept, as remove() does)
    await seed(29, {
      status: 'DELETED',
      publishedAt: new Date(now.getTime() - 2 * HOUR),
      deletedAt: new Date(now.getTime() - HOUR),
      expiresAt: new Date(now.getTime() + 22 * HOUR),
      mediaDeletedAt: new Date(now.getTime() - HOUR),
    });
    await seed(CONCURRENT, {
      status: 'PENDING',
      expiresAt: new Date(now.getTime() + HOUR),
    });
    const pending = await prisma.story.findMany({
      where: { identityId: officeId, status: 'PENDING' },
      select: { id: true },
    });

    const results = await settle(
      pending.map((p) => service.publish(p.id, officeId, {})),
    );
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter(limited)).toHaveLength(CONCURRENT - 1);
  });

  it('deleting a story does not let the profile publish more in 24 hours', async () => {
    const now = new Date();
    await seed(30, {
      status: 'ACTIVE',
      publishedAt: new Date(now.getTime() - 2 * HOUR),
      expiresAt: new Date(now.getTime() + 22 * HOUR),
    });
    const live = await prisma.story.findMany({
      where: { identityId: officeId, status: 'ACTIVE' },
      select: { id: true },
    });
    await Promise.all(live.map((s) => service.remove(s.id, officeId)));

    await expect(
      service.createUpload(officeId, {
        mediaType: 'IMAGE',
        contentType: 'image/jpeg',
        sizeBytes: 1,
      }),
    ).rejects.toThrow(HttpException);
  });

  /** One live story by the office, published an hour ago. */
  const liveStory = async () => {
    const now = new Date();
    await seed(1, {
      status: 'ACTIVE',
      publishedAt: new Date(now.getTime() - HOUR),
      expiresAt: new Date(now.getTime() + 23 * HOUR),
    });
    const story = await prisma.story.findFirstOrThrow({
      where: { identityId: officeId, status: 'ACTIVE' },
      select: { id: true },
    });
    return story.id;
  };

  it(`the same view sent ${CONCURRENT} times at once is stored once`, async () => {
    const storyId = await liveStory();
    const results = await settle(
      Array.from({ length: CONCURRENT }, () =>
        service.recordViews(
          { identityId: viewerId, userId: viewerUserId },
          { storyIds: [storyId] },
        ),
      ),
    );
    expect(results.every((r) => r.status === 'fulfilled')).toBe(true);
    expect(await prisma.storyView.count({ where: { storyId } })).toBe(1);
  });

  it(`the same report sent ${CONCURRENT} times at once is filed once`, async () => {
    const storyId = await liveStory();
    const results = await settle(
      Array.from({ length: CONCURRENT }, () =>
        reports.createForStory(
          { userId: viewerUserId, identityId: viewerId },
          storyId,
          { reason: 'محتوى مسيء' },
        ),
      ),
    );
    expect(results.every((r) => r.status === 'fulfilled')).toBe(true);
    expect(
      await prisma.report.count({ where: { targetStoryId: storyId } }),
    ).toBe(1);
    const ids = new Set(
      results.map((r) =>
        r.status === 'fulfilled' ? (r.value.data as { id: string }).id : null,
      ),
    );
    // Every caller got the same report back
    expect(ids.size).toBe(1);
  });

  it('the viewer list and its total leave out disabled accounts', async () => {
    const storyId = await liveStory();
    await service.recordViews(
      { identityId: viewerId, userId: viewerUserId },
      { storyIds: [storyId] },
    );
    let list = await service.viewers(storyId, officeId, {});
    expect(list.total).toBe(1);
    expect(list.viewers.map((v) => v.identityId)).toEqual([viewerId]);

    await prisma.user.update({
      where: { id: viewerUserId },
      data: { isDisabled: true },
    });
    list = await service.viewers(storyId, officeId, {});
    expect(list.total).toBe(0);
    expect(list.viewers).toEqual([]);
  });

  it('a purged story leaves its report in place, unlinked', async () => {
    const storyId = await liveStory();
    await reports.createForStory(
      { userId: viewerUserId, identityId: viewerId },
      storyId,
      { reason: 'محتوى مسيء' },
    );
    await prisma.story.delete({ where: { id: storyId } });
    const report = await prisma.report.findFirstOrThrow({
      where: { reporterUserId: viewerUserId },
      select: { targetStoryId: true, targetStorySnapshot: true },
    });
    expect(report.targetStoryId).toBeNull();
    expect(report.targetStorySnapshot).toMatchObject({ storyId });
  });
});
