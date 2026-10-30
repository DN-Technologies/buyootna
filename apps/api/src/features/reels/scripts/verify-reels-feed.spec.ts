/**
 * The feed's rules against a REAL Postgres: its ordering query is raw SQL, so
 * mocks can't show what it returns. Also the view and like counters under
 * concurrency, and a load check with production-like volume (about 50 000
 * reels and 1 million views) that prints the query plan.
 *
 * Gated behind VERIFY_REELS_DB so ordinary `pnpm test` runs skip it. Point it
 * at a THROWAWAY database with all migrations applied, never a shared or
 * production one:
 *
 *   VERIFY_REELS_DB=1 \
 *     DATABASE_URL=postgresql://postgres:test@localhost:55432/buyootna_test \
 *     pnpm --filter api test -- --runTestsByPath src/features/reels/scripts/verify-reels-feed.spec.ts
 */
import { randomUUID } from 'crypto';

import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../core/prisma/prisma.service';
import { ReelsEngagementService } from '../reels-engagement.service';
import {
  feedQuery,
  ReelsFeedService,
  type ReelViewer,
} from '../reels-feed.service';
import { ReelsMediaService } from '../reels-media.service';

const describeIfDb = process.env.VERIFY_REELS_DB ? describe : describe.skip;

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

describeIfDb('Reels feed (real Postgres)', () => {
  let prisma: PrismaService;
  let feed: ReelsFeedService;
  let engagement: ReelsEngagementService;
  const userIds: string[] = [];

  const media = {
    linksFor: (r: { mediaKey: string; posterKey: string }) => ({
      mediaUrl: `https://test/${r.mediaKey}`,
      posterUrl: `https://test/${r.posterKey}`,
    }),
  } as unknown as ReelsMediaService;

  const makeUser = async () => {
    const user = await prisma.user.create({
      data: { password: 'x', email: `reels-${randomUUID()}@test.local` },
    });
    userIds.push(user.id);
    return user.id;
  };

  const makeOffice = async () => {
    const userId = await makeUser();
    const office = await prisma.identity.create({
      data: {
        userId,
        type: 'OFFICE',
        officeData: {
          create: {
            name: 'مكتب اختبار',
            licenseNumber: `T-${randomUUID()}`,
            status: 'APPROVED',
          },
        },
      },
    });
    return { userId, identityId: office.id };
  };

  const makeCompany = async (subscribedUntil: Date | null) => {
    const userId = await makeUser();
    const company = await prisma.identity.create({
      data: {
        userId,
        type: 'COMPANY',
        companyData: {
          create: {
            name: 'شركة اختبار',
            licenseNumber: `T-${randomUUID()}`,
            status: 'APPROVED',
          },
        },
      },
    });
    if (subscribedUntil) {
      await prisma.companySubscription.create({
        data: {
          identityId: company.id,
          kind: 'TRIAL',
          startsAt: new Date(Date.now() - DAY),
          endsAt: subscribedUntil,
        },
      });
    }
    return { userId, identityId: company.id };
  };

  const makeViewer = async (): Promise<ReelViewer> => {
    const userId = await makeUser();
    const viewer = await prisma.identity.create({
      data: {
        userId,
        type: 'INDIVIDUAL',
        individualData: { create: { name: 'مشاهد' } },
      },
    });
    return { userId, identityId: viewer.id };
  };

  const makeReel = async (
    identityId: string,
    minutesAgo: number,
    data: Record<string, unknown> = {},
  ) => {
    const id: string = randomUUID();
    await prisma.reel.create({
      data: {
        id,
        identityId,
        status: 'ACTIVE',
        mediaKey: `reels/${identityId}/${id}/media.mp4`,
        mediaContentType: 'video/mp4',
        mediaSizeBytes: 1,
        posterKey: `reels/${identityId}/${id}/poster.jpg`,
        posterSizeBytes: 1,
        uploadExpiresAt: new Date(),
        publishedAt: new Date(Date.now() - minutesAgo * MINUTE),
        ...data,
      },
    });
    return id;
  };

  const makeListing = (
    identityId: string,
    data: Record<string, unknown> = {},
  ) =>
    prisma.property.create({
      data: {
        referenceNumber: Math.floor(Math.random() * 1_000_000_000),
        type: 'SALE',
        category: 'APARTMENT',
        location: 'الكويت',
        description: 'اختبار',
        status: 'ACTIVE',
        identityId,
        ...data,
      } as never,
    });

  /** The whole feed, page by page, kept to this test's own reels. */
  const allIds = async (viewer: ReelViewer | null, own: string[]) => {
    const ids: string[] = [];
    let cursor: string | undefined;
    do {
      const page = await feed.feed(viewer, { cursor, limit: 20 });
      ids.push(...page.reels.map((r) => r.id));
      cursor = page.nextCursor ?? undefined;
    } while (cursor);
    return ids.filter((id) => own.includes(id));
  };

  beforeAll(() => {
    prisma = new PrismaService();
    feed = new ReelsFeedService(prisma, media);
    engagement = new ReelsEngagementService(prisma);
  });

  afterAll(async () => {
    await prisma.property.deleteMany({
      where: { identity: { userId: { in: userIds } } },
    });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.$disconnect();
  }, 120_000);

  it('a guest gets newest first, a profile gets unseen before seen', async () => {
    const office = await makeOffice();
    const viewer = await makeViewer();
    const oldest = await makeReel(office.identityId, 30);
    const middle = await makeReel(office.identityId, 20);
    const newest = await makeReel(office.identityId, 10);
    const own = [oldest, middle, newest];

    expect(await allIds(null, own)).toEqual([newest, middle, oldest]);

    await engagement.recordViews(viewer, { reelIds: [newest] });
    expect(await allIds(viewer, own)).toEqual([middle, oldest, newest]);

    const page = await feed.feed(viewer, { limit: 20 });
    const byId = new Map(page.reels.map((r) => [r.id, r]));
    expect(byId.get(newest)?.viewed).toBe(true);
    expect(byId.get(middle)?.viewed).toBe(false);
  });

  it('hides what must not reach the main feed, and keeps it on the profile', async () => {
    const viewer = await makeViewer();
    const paying = await makeCompany(new Date(Date.now() + 30 * DAY));
    const lapsed = await makeCompany(new Date(Date.now() - DAY));
    const never = await makeCompany(null);
    const office = await makeOffice();
    const sold = await makeListing(office.identityId, { status: 'CLOSED' });
    const live = await makeListing(office.identityId);
    const hidden = await makeListing(office.identityId, { isHidden: true });
    const ended = await makeListing(office.identityId, {
      endDate: new Date(Date.now() - DAY),
    });

    const shown = await makeReel(paying.identityId, 10);
    const linkedLive = await makeReel(office.identityId, 11, {
      propertyId: live.id,
      hadListing: true,
    });
    const lapsedReel = await makeReel(lapsed.identityId, 12);
    const neverReel = await makeReel(never.identityId, 13);
    const soldReel = await makeReel(office.identityId, 14, {
      propertyId: sold.id,
      hadListing: true,
    });
    const hiddenReel = await makeReel(office.identityId, 15, {
      propertyId: hidden.id,
      hadListing: true,
    });
    const endedReel = await makeReel(office.identityId, 16, {
      propertyId: ended.id,
      hadListing: true,
    });
    // The listing was deleted: propertyId went null, hadListing stays
    const deletedListingReel = await makeReel(office.identityId, 17, {
      hadListing: true,
    });
    const deletedReel = await makeReel(office.identityId, 18, {
      status: 'DELETED',
    });
    const own = [
      shown,
      linkedLive,
      lapsedReel,
      neverReel,
      soldReel,
      hiddenReel,
      endedReel,
      deletedListingReel,
      deletedReel,
    ];

    expect(await allIds(viewer, own)).toEqual([shown, linkedLive]);

    // The profile keeps them, without the listing button, and never a deleted one
    const profile = await feed.byAuthor(viewer, office.identityId, {
      limit: 20,
    });
    expect(profile.reels.map((r) => r.id)).toEqual([
      linkedLive,
      soldReel,
      hiddenReel,
      endedReel,
      deletedListingReel,
    ]);
    expect(profile.reels[0].property?.id).toBe(live.id);
    expect(profile.reels.slice(1).every((r) => r.property === null)).toBe(true);

    const lapsedProfile = await feed.byAuthor(viewer, lapsed.identityId, {});
    expect(lapsedProfile.reels.map((r) => r.id)).toEqual([lapsedReel]);
  });

  it("leaves out the viewer's own account, and blocks either way", async () => {
    const author = await makeOffice();
    const blockedBy = await makeOffice();
    const blocks = await makeOffice();
    const viewer = await makeViewer();
    const shown = await makeReel(author.identityId, 10);
    const first = await makeReel(blockedBy.identityId, 11);
    const second = await makeReel(blocks.identityId, 12);
    await prisma.userBlock.create({
      data: { blockerUserId: blockedBy.userId, blockedUserId: viewer.userId },
    });
    await prisma.userBlock.create({
      data: { blockerUserId: viewer.userId, blockedUserId: blocks.userId },
    });
    const own = [shown, first, second];

    expect(await allIds(viewer, own)).toEqual([shown]);
    expect(await allIds(null, own)).toEqual([shown, first, second]);
    expect(
      await allIds(
        { userId: author.userId, identityId: author.identityId },
        own,
      ),
    ).not.toContain(shown);
    await expect(feed.findOne(viewer, first)).rejects.toThrow();
    await expect(
      feed.byAuthor(viewer, blockedBy.identityId, {}),
    ).resolves.toMatchObject({ reels: [] });
  });

  it('a suspended account leaves the feed and its links', async () => {
    const office = await makeOffice();
    const reel = await makeReel(office.identityId, 10);
    await prisma.user.update({
      where: { id: office.userId },
      data: { isDisabled: true },
    });
    expect(await allIds(null, [reel])).toEqual([]);
    await expect(feed.findOne(null, reel)).rejects.toThrow();
  });

  it('pages cover every reel once, across unseen and seen, within the snapshot', async () => {
    const office = await makeOffice();
    const viewer = await makeViewer();
    const ids: string[] = [];
    for (let i = 0; i < 25; i += 1) {
      ids.push(await makeReel(office.identityId, 100 + i));
    }
    await engagement.recordViews(viewer, { reelIds: ids.slice(0, 12) });

    const seenIds: string[] = [];
    let cursor: string | undefined;
    let first = true;
    do {
      const page = await feed.feed(viewer, { cursor, limit: 7 });
      seenIds.push(...page.reels.map((r) => r.id));
      cursor = page.nextCursor ?? undefined;
      if (first) {
        // Published after the first page: not part of this scroll
        await makeReel(office.identityId, 0);
        first = false;
      }
    } while (cursor);
    const mine = seenIds.filter((id) => ids.includes(id));

    expect(mine).toHaveLength(25);
    expect(new Set(mine).size).toBe(25);
    // Within this scroll, every unseen one came before every seen one
    expect(mine.slice(13).sort()).toEqual([...ids.slice(0, 12)].sort());
  });

  it('spreads out one author within a page', async () => {
    const a = await makeOffice();
    const b = await makeOffice();
    const a1 = await makeReel(a.identityId, 1);
    const a2 = await makeReel(a.identityId, 2);
    const b1 = await makeReel(b.identityId, 3);
    const page = await feed.feed(null, { limit: 20 });
    const order = page.reels
      .map((r) => r.id)
      .filter((id) => [a1, a2, b1].includes(id));
    expect(order).toEqual([a1, b1, a2]);
  });

  it('a view and a like count once, even sent many times at once', async () => {
    const office = await makeOffice();
    const viewer = await makeViewer();
    const reel = await makeReel(office.identityId, 10);

    await Promise.all(
      Array.from({ length: 8 }, () =>
        engagement.recordViews(viewer, { reelIds: [reel] }),
      ),
    );
    await Promise.all(
      Array.from({ length: 8 }, () => engagement.like(viewer, reel)),
    );
    let row = await prisma.reel.findUniqueOrThrow({ where: { id: reel } });
    expect(row.viewCount).toBe(1);
    expect(row.likeCount).toBe(1);

    await Promise.all(
      Array.from({ length: 8 }, () => engagement.unlike(viewer, reel)),
    );
    row = await prisma.reel.findUniqueOrThrow({ where: { id: reel } });
    expect(row.likeCount).toBe(0);
  });

  it("the author's own view doesn't count", async () => {
    const office = await makeOffice();
    const reel = await makeReel(office.identityId, 10);
    await engagement.recordViews(
      { userId: office.userId, identityId: office.identityId },
      { reelIds: [reel] },
    );
    const row = await prisma.reel.findUniqueOrThrow({ where: { id: reel } });
    expect(row.viewCount).toBe(0);
  });

  it('stays fast with about 50 000 reels and 1 million views', async () => {
    const office = await makeOffice();
    const viewer = await makeViewer();
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "Reel" (id, "identityId", status, "mediaKey", "mediaContentType",
        "mediaSizeBytes", "posterKey", "posterSizeBytes", "uploadExpiresAt", "publishedAt")
      SELECT gen_random_uuid()::text, ${office.identityId}, 'ACTIVE',
        'load/' || n || '/media.mp4', 'video/mp4', 1,
        'load/' || n || '/poster.jpg', 1, now(),
        now() - (n || ' minutes')::interval - interval '1 day'
      FROM generate_series(1, 50000) n
    `);
    // A heavy viewer who has seen 2 000 reels, and many others who watched
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "ReelView" ("reelId", "viewerIdentityId")
      SELECT id, ${viewer.identityId} FROM "Reel"
      WHERE "identityId" = ${office.identityId}
      ORDER BY "publishedAt" DESC LIMIT 2000
    `);
    const others = Array.from({ length: 200 }, () => randomUUID());
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "User" (id, password, email, "updatedAt")
      SELECT id, 'x', 'load-' || id || '@test.local', now()
      FROM unnest(${others}::text[]) AS id
    `);
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "Identity" (id, "userId", type, "updatedAt")
      SELECT id, id, 'INDIVIDUAL', now() FROM unnest(${others}::text[]) AS id
    `);
    userIds.push(...others);
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "ReelView" ("reelId", "viewerIdentityId")
      SELECT r.id, o.id
      FROM unnest(${others}::text[]) AS o(id)
      CROSS JOIN LATERAL (
        SELECT id FROM "Reel" WHERE "identityId" = ${office.identityId}
        ORDER BY random() LIMIT 5000
      ) r
    `);
    await prisma.$executeRaw(Prisma.sql`ANALYZE`);
    const [{ count }] = await prisma.$queryRaw<{ count: bigint }[]>(
      Prisma.sql`SELECT count(*) FROM "ReelView"`,
    );
    console.log(`Load: ${String(count)} views`);

    const timed = async (run: () => Promise<unknown>) => {
      const times: number[] = [];
      for (let i = 0; i < 5; i += 1) {
        const start = Date.now();
        await run();
        times.push(Date.now() - start);
      }
      return Math.max(...times);
    };
    const now = new Date();
    const guest = await timed(() => feed.feed(null, { limit: 10 }));
    const signedIn = await timed(() => feed.feed(viewer, { limit: 10 }));

    // Deep in the list, past everything this viewer has seen
    const deep = await prisma.$queryRaw<{ publishedAt: Date; id: string }[]>(
      Prisma.sql`SELECT "publishedAt", id FROM "Reel"
                 WHERE "identityId" = ${office.identityId}
                 ORDER BY "publishedAt" DESC, id DESC OFFSET 40000 LIMIT 1`,
    );
    const cursor = {
      snapshotAt: now,
      seen: false,
      publishedAt: deep[0].publishedAt,
      id: deep[0].id,
    };
    const plan = await prisma.$queryRaw<{ 'QUERY PLAN': string }[]>(
      Prisma.sql`EXPLAIN ANALYZE ${feedQuery(viewer, now, now, cursor, 11, false)}`,
    );
    const planText = plan.map((p) => p['QUERY PLAN']).join('\n');
    console.log(
      `Load: guest ${guest} ms, signed in ${signedIn} ms\n${planText}`,
    );

    expect(guest).toBeLessThan(500);
    expect(signedIn).toBeLessThan(500);
    expect(planText).toContain('Execution Time');
    const deepStart = Date.now();
    await prisma.$queryRaw(feedQuery(viewer, now, now, cursor, 11, false));
    expect(Date.now() - deepStart).toBeLessThan(500);
  }, 300_000);
});
