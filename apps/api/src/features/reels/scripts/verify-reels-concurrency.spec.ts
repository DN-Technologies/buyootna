/**
 * Concurrency checks for Reels against a REAL Postgres: the per-profile
 * advisory lock (lockKeys) must keep simultaneous requests within the rules.
 *  - many upload-slot requests at once leave exactly one pending slot;
 *  - many publishes at once never exceed 10 published in 24 hours (deleted
 *    reels included).
 * An in-memory database can't run these (no concurrent sessions or advisory
 * locks), so they need a real one. S3 is stubbed: this checks the database
 * logic only.
 *
 * Gated behind VERIFY_REELS_DB so ordinary `pnpm test` runs skip it. Point it
 * at a THROWAWAY database with all migrations applied, never a shared or
 * production one:
 *
 *   VERIFY_REELS_DB=1 \
 *     DATABASE_URL=postgresql://postgres:test@localhost:55432/buyootna_test \
 *     pnpm --filter api test -- --runTestsByPath src/features/reels/scripts/verify-reels-concurrency.spec.ts
 */
import { randomUUID } from 'crypto';

import { HttpException } from '@nestjs/common';

import { PrismaService } from '../../../core/prisma/prisma.service';
import { StorageService } from '../../../core/storage/storage.service';
import { ReelsMediaService } from '../reels-media.service';
import { ReelsService } from '../reels.service';

const describeIfDb = process.env.VERIFY_REELS_DB ? describe : describe.skip;

const CONCURRENT = 8;
const HOUR = 60 * 60 * 1000;

describeIfDb('Reels limits (real Postgres concurrency)', () => {
  let prisma: PrismaService;
  let service: ReelsService;
  let userId: string;
  let officeId: string;

  // No S3: every file "passes" the check and links are placeholders
  const media = {
    mediaKeyFor: (identityId: string, id: string) =>
      `reels/${identityId}/${id}/media.mp4`,
    posterKeyFor: (identityId: string, id: string) =>
      `reels/${identityId}/${id}/poster.jpg`,
    presignUpload: () =>
      Promise.resolve({ url: 'https://test/put', headers: {} }),
    checkVideo: () =>
      Promise.resolve({
        ok: true,
        width: 720,
        height: 1280,
        durationMs: 30_000,
      }),
    linksFor: () => ({
      mediaUrl: 'https://test/media.mp4',
      posterUrl: 'https://test/poster.jpg',
    }),
    keysOf: (r: { mediaKey: string; posterKey: string }) => [
      r.mediaKey,
      r.posterKey,
    ],
  } as unknown as ReelsMediaService;
  const storage = {
    deleteKeysReporting: () => Promise.resolve({ failed: [] }),
  } as unknown as StorageService;

  const reels = (where: Record<string, unknown>) =>
    prisma.reel.count({ where: { identityId: officeId, ...where } });

  /** Rows inserted directly, bypassing the service (setting up a state). */
  const seed = async (n: number, data: Record<string, unknown>) => {
    const ids = Array.from({ length: n }, () => randomUUID());
    await prisma.reel.createMany({
      data: ids.map((id) => ({
        id,
        identityId: officeId,
        mediaKey: `reels/${officeId}/${id}/media.mp4`,
        mediaContentType: 'video/mp4',
        mediaSizeBytes: 1,
        posterKey: `reels/${officeId}/${id}/poster.jpg`,
        posterSizeBytes: 1,
        uploadExpiresAt: new Date(Date.now() + HOUR),
        ...data,
      })),
    });
    return ids;
  };

  const limited = (r: PromiseSettledResult<unknown>) =>
    r.status === 'rejected' &&
    r.reason instanceof HttpException &&
    r.reason.getStatus() === 429;

  beforeAll(() => {
    prisma = new PrismaService();
    service = new ReelsService(prisma, media, storage);
  });

  beforeEach(async () => {
    const suffix = randomUUID();
    const user = await prisma.user.create({
      data: { password: 'x', email: `reels-${suffix}@test.local` },
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
  });

  afterEach(async () => {
    // Cascades to the identity and its reels
    await prisma.user.delete({ where: { id: userId } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it(`${CONCURRENT} upload-slot requests at once leave exactly one pending slot`, async () => {
    const results = await Promise.allSettled(
      Array.from({ length: CONCURRENT }, () =>
        service.createUpload(officeId, {
          contentType: 'video/mp4',
          sizeBytes: 1,
          poster: { contentType: 'image/jpeg', sizeBytes: 1 },
        }),
      ),
    );
    expect(results.every((r) => r.status === 'fulfilled')).toBe(true);
    expect(await reels({ status: 'PENDING' })).toBe(1);
    expect(await reels({ status: 'FAILED' })).toBe(CONCURRENT - 1);
  });

  it('simultaneous publishes never pass 10 in 24 hours', async () => {
    await seed(9, {
      status: 'ACTIVE',
      publishedAt: new Date(Date.now() - 2 * HOUR),
    });
    const pending = await seed(CONCURRENT, { status: 'PENDING' });

    const results = await Promise.allSettled(
      pending.map((id) => service.publish(id, officeId, {})),
    );

    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter(limited)).toHaveLength(CONCURRENT - 1);
    expect(await reels({ status: 'ACTIVE' })).toBe(10);
  });

  it('a deleted reel keeps counting toward the limit', async () => {
    await seed(9, {
      status: 'ACTIVE',
      publishedAt: new Date(Date.now() - 2 * HOUR),
    });
    await seed(1, {
      status: 'DELETED',
      publishedAt: new Date(Date.now() - HOUR),
      deletedAt: new Date(),
    });
    const [pending] = await seed(1, { status: 'PENDING' });

    await expect(service.publish(pending, officeId, {})).rejects.toMatchObject({
      response: { code: 'REEL_LIMIT' },
    });
  });

  it('the same publish sent many times at once publishes once', async () => {
    const [pending] = await seed(1, { status: 'PENDING' });

    const results = await Promise.allSettled(
      Array.from({ length: CONCURRENT }, () =>
        service.publish(pending, officeId, { caption: 'مرة واحدة' }),
      ),
    );

    expect(results.every((r) => r.status === 'fulfilled')).toBe(true);
    expect(await reels({ status: 'ACTIVE' })).toBe(1);
  });
});
