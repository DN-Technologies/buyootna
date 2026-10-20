/**
 * Load check for the stories feed against a REAL Postgres with production-
 * like volume: 3 000 approved providers, 20 000 viewers, ~1 800 live stories
 * among ~23 000 rows (expired and deleted ones the cleanup hasn't purged
 * yet), ~145 000 views and 100 000 follows. It pages through the feed as one
 * viewer, checks every page is fast and correctly ordered, and prints the
 * ordering query's plan (EXPLAIN ANALYZE) to confirm the indexes are used.
 *
 * Gated behind VERIFY_STORIES_LOAD. Point it at a THROWAWAY database with
 * all migrations applied, never a shared or production one; it refuses any
 * host but localhost:
 *
 *   VERIFY_STORIES_LOAD=1 \
 *     DATABASE_URL=postgresql://postgres:test@127.0.0.1:55434/stories_load \
 *     pnpm --filter api test -- --runTestsByPath src/features/stories/scripts/load-stories-feed.spec.ts
 */
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../core/prisma/prisma.service';
import { StoriesFeedService, rankQuery } from '../stories-feed.service';
import { StoriesMediaService } from '../stories-media.service';

const describeIfLoad = process.env.VERIFY_STORIES_LOAD
  ? describe
  : describe.skip;

const PROVIDERS = 3000;
const VIEWERS = 20000;
// Every page, all four queries, on a laptop's Docker Postgres
const PAGE_BUDGET_MS = 250;

describeIfLoad('Stories feed under load (real Postgres)', () => {
  let prisma: PrismaService;
  let feed: StoriesFeedService;
  // Identities are UUIDs, as in production (feed cursors require them)
  const viewer = {
    identityId: '7c1e3b5a-0000-4000-8000-000000000001',
    userId: 'load-viewer-user-1',
  };
  const media = {
    linksFor: (s: { expiresAt: Date }) =>
      Promise.resolve({
        mediaUrl: 'https://test/get',
        posterUrl: null,
        urlExpiresAt: s.expiresAt,
      }),
  } as unknown as StoriesMediaService;

  beforeAll(async () => {
    const host = new URL(process.env.DATABASE_URL ?? 'x://none').hostname;
    if (host !== '127.0.0.1' && host !== 'localhost') {
      throw new Error('Refusing to seed load data outside a local database');
    }
    prisma = new PrismaService();
    await prisma.$connect();
    feed = new StoriesFeedService(prisma, media);

    const seeded = await prisma.user.count({
      where: { id: { startsWith: 'load-' } },
    });
    if (seeded > 0) return;

    // Providers: two in three companies, the rest offices, all approved
    await prisma.$executeRawUnsafe(`
      INSERT INTO "User" (id, password, "updatedAt")
      SELECT 'load-prov-user-' || g, 'x', now() FROM generate_series(1, ${PROVIDERS}) g;
      INSERT INTO "Identity" (id, "userId", type, "isActive", "updatedAt")
      SELECT md5('load-prov-' || g)::uuid::text, 'load-prov-user-' || g,
             (CASE WHEN g % 3 = 0 THEN 'OFFICE' ELSE 'COMPANY' END)::"IdentityType", true, now()
      FROM generate_series(1, ${PROVIDERS}) g;
      INSERT INTO "CompanyIdentityData" (id, "identityId", name, "licenseNumber", status, "updatedAt")
      SELECT 'load-cd-' || g, md5('load-prov-' || g)::uuid::text, 'شركة ' || g, 'L' || g, 'APPROVED', now()
      FROM generate_series(1, ${PROVIDERS}) g WHERE g % 3 <> 0;
      INSERT INTO "OfficeIdentityData" (id, "identityId", name, "licenseNumber", status, "updatedAt")
      SELECT 'load-od-' || g, md5('load-prov-' || g)::uuid::text, 'مكتب ' || g, 'L' || g, 'APPROVED', now()
      FROM generate_series(1, ${PROVIDERS}) g WHERE g % 3 = 0;
    `);
    // Viewers (individuals); viewer 1 is the one paging
    await prisma.$executeRawUnsafe(`
      INSERT INTO "User" (id, password, "updatedAt")
      SELECT 'load-viewer-user-' || g, 'x', now() FROM generate_series(1, ${VIEWERS}) g;
      INSERT INTO "Identity" (id, "userId", type, "isActive", "updatedAt")
      SELECT CASE WHEN g = 1 THEN '${viewer.identityId}' ELSE md5('load-viewer-' || g)::uuid::text END,
             'load-viewer-user-' || g, 'INDIVIDUAL', true, now()
      FROM generate_series(1, ${VIEWERS}) g;
    `);
    // Stories: 30% of providers have 1–5 live ones; every provider also has
    // expired and deleted rows waiting for the cleanup
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Story" (id, "identityId", status, "mediaType", "mediaKey", "mediaContentType",
                           "mediaSizeBytes", width, height, "publishedAt", "expiresAt")
      SELECT md5('live' || p || '-' || n)::uuid::text, md5('load-prov-' || p)::uuid::text, 'ACTIVE', 'IMAGE',
             'stories/load-' || p || '/' || n || '/media.jpg', 'image/jpeg', 1000, 1080, 1920,
             now() - make_interval(mins => (p * 7 + n * 13) % 1380),
             now() - make_interval(mins => (p * 7 + n * 13) % 1380) + interval '24 hours'
      FROM generate_series(1, ${PROVIDERS}) p, generate_series(1, 5) n
      WHERE p % 10 < 3 AND n <= 1 + p % 5;
      INSERT INTO "Story" (id, "identityId", status, "mediaType", "mediaKey", "mediaContentType",
                           "mediaSizeBytes", "publishedAt", "expiresAt", "deletedAt")
      SELECT md5('old' || p || '-' || n)::uuid::text, md5('load-prov-' || p)::uuid::text,
             (CASE WHEN n = 1 THEN 'DELETED' ELSE 'ACTIVE' END)::"StoryStatus", 'IMAGE',
             'stories/load-' || p || '/old' || n || '/media.jpg', 'image/jpeg', 1000,
             now() - interval '30 hours', now() - make_interval(hours => n),
             CASE WHEN n = 1 THEN now() - interval '20 hours' END
      FROM generate_series(1, ${PROVIDERS}) p, generate_series(1, 7) n;
    `);
    // Views: other viewers saw the live stories; viewer 1 a third of them
    await prisma.$executeRawUnsafe(`
      INSERT INTO "StoryView" ("storyId", "viewerIdentityId")
      SELECT s.id, md5('load-viewer-' || (2 + (abs(hashtext(s.id || v)) % (${VIEWERS} - 1))))::uuid::text
      FROM "Story" s, generate_series(1, 80) v
      WHERE s.status = 'ACTIVE' AND s."expiresAt" > now()
      ON CONFLICT DO NOTHING;
      INSERT INTO "StoryView" ("storyId", "viewerIdentityId")
      SELECT s.id, '${viewer.identityId}' FROM "Story" s
      WHERE s.status = 'ACTIVE' AND s."expiresAt" > now() AND abs(hashtext(s.id)) % 3 = 0
      ON CONFLICT DO NOTHING;
    `);
    // Follows: 5 per viewer; viewer 1 follows 60 providers
    await prisma.$executeRawUnsafe(`
      INSERT INTO "ProviderFavorite" (id, "identityId", "providerId")
      SELECT 'load-fav-' || v || '-' || k, md5('load-viewer-' || v)::uuid::text,
             md5('load-prov-' || (1 + (v * 31 + k * 977) % ${PROVIDERS}))::uuid::text
      FROM generate_series(2, ${VIEWERS}) v, generate_series(1, 5) k
      ON CONFLICT DO NOTHING;
      INSERT INTO "ProviderFavorite" (id, "identityId", "providerId")
      SELECT 'load-fav-1-' || k, '${viewer.identityId}', md5('load-prov-' || (k * 50))::uuid::text
      FROM generate_series(1, 60) k
      ON CONFLICT DO NOTHING;
    `);
    await prisma.$executeRawUnsafe('ANALYZE');
  }, 600_000);

  afterAll(() => prisma?.$disconnect());

  it('the seeded volume is as described', async () => {
    const [live, rows, views, follows] = await Promise.all([
      prisma.story.count({
        where: { status: 'ACTIVE', expiresAt: { gt: new Date() } },
      }),
      prisma.story.count(),
      prisma.storyView.count(),
      prisma.providerFavorite.count(),
    ]);

    console.log({ live, rows, views, follows });
    expect(live).toBeGreaterThan(1500);
    expect(rows).toBeGreaterThan(20000);
    expect(views).toBeGreaterThan(100000);
    expect(follows).toBeGreaterThan(90000);
  });

  it('pages through the whole feed quickly, in tier order, no author twice', async () => {
    const seen = new Set<string>();
    const timings: number[] = [];
    let lastTier = 0;
    let cursor: string | undefined;
    let pages = 0;
    // Warm up once (connection, plan cache), as a running server would be
    await feed.feed(viewer, { limit: 20 });
    do {
      const started = performance.now();
      const page = await feed.feed(viewer, { limit: 20, cursor });
      timings.push(performance.now() - started);
      for (const a of page.authors) {
        expect(seen.has(a.author.identityId)).toBe(false);
        seen.add(a.author.identityId);
        const tier = (a.hasUnseen ? 0 : 2) + (a.followed ? 1 : 2);
        expect(tier).toBeGreaterThanOrEqual(lastTier);
        lastTier = tier;
      }
      cursor = page.nextCursor ?? undefined;
      pages += 1;
    } while (cursor && pages < 60);

    timings.sort((a, b) => a - b);
    const p95 = timings[Math.floor(timings.length * 0.95)];

    console.log({
      pages,
      authors: seen.size,
      medianMs: timings[Math.floor(timings.length / 2)],
      p95Ms: p95,
    });
    // Every provider with live stories (30% of them)
    expect(seen.size).toBe(PROVIDERS * 0.3);
    expect(p95).toBeLessThan(PAGE_BUDGET_MS);
  }, 120_000);

  it('the ordering query reaches stories through an index, never a full scan', async () => {
    const now = new Date();
    const plan = await prisma.$queryRaw<{ 'QUERY PLAN': string }[]>(
      Prisma.sql`EXPLAIN (ANALYZE, BUFFERS) ${rankQuery(viewer, now, now, null, 21)}`,
    );
    const text = plan.map((r) => r['QUERY PLAN']).join('\n');

    console.log(text);
    expect(text).toMatch(
      // Either Story index, depending on the data's shape: from the live
      // stories (status, expiresAt) or per author (identityId, status, …)
      /Scan (using|on) "?Story_(status_expiresAt|identityId_status_expiresAt)_idx"?/,
    );
    expect(text).not.toMatch(/Seq Scan on "Story"/);
  });
});
