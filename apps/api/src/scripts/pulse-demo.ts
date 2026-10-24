/**
 * Puts each «النبض» (GET /pulse/me) case on a local account, to see the
 * home pill's notch and quick view in the simulator. Local databases only.
 *
 *   pnpm --filter api pulse:demo all                 every case at once
 *   pnpm --filter api pulse:demo offers              an offer on my open request
 *   pnpm --filter api pulse:demo expiring [--days N] my ad with N whole days left (0-2, default 1)
 *   pnpm --filter api pulse:demo matches             a new listing matching my alert
 *   pnpm --filter api pulse:demo story               a saved company's unwatched story
 *   pnpm --filter api pulse:demo clear               removes everything it added
 *
 * The account: --email <email>, or the only individual profile in the
 * database. Each case replaces its own earlier rows, so it can be re-run;
 * pull to refresh (or leave and come back to) the home to see it.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const CASES = ['offers', 'expiring', 'matches', 'story'] as const;
type Case = (typeof CASES)[number];

// Every row it adds has an id starting with this, so clear finds them all
const P = 'pulse-demo-';
const DAY_MS = 24 * 60 * 60 * 1000;
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1'];

const ids = {
  user: `${P}company-user`,
  company: `${P}company`,
  companyData: `${P}company-data`,
  request: `${P}request`,
  offer: `${P}offer`,
  ad: `${P}my-ad`,
  matchAd: `${P}match-ad`,
  alert: `${P}alert`,
  match: `${P}match`,
  favorite: `${P}favorite`,
  story: `${P}story`,
};

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

function assertLocal(url: string | undefined) {
  if (!url) throw new Error('DATABASE_URL is not set (apps/api/.env).');
  const host = new URL(url).hostname;
  if (!LOCAL_HOSTS.includes(host)) {
    throw new Error(
      `Refusing to write demo data to "${host}": local databases only (${LOCAL_HOSTS.join(', ')}).`,
    );
  }
}

async function main() {
  const what = process.argv[2];
  if (!what || ![...CASES, 'all', 'clear'].includes(what)) {
    console.log(
      `Usage: pnpm --filter api pulse:demo <${[...CASES, 'all', 'clear'].join(' | ')}> [--email <email>] [--days N]`,
    );
    process.exit(1);
  }
  assertLocal(process.env.DATABASE_URL);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  try {
    if (what === 'clear') {
      await clear(prisma);
      console.log('✓ Removed all pulse demo data');
      return;
    }
    const me = await findMe(prisma, arg('email'));
    await ensureCompany(prisma);
    const cases: Case[] = what === 'all' ? [...CASES] : [what as Case];
    for (const c of cases) {
      await seed[c](prisma, me);
    }
    console.log(
      `\nFor ${me.label}. Pull to refresh the home (nothing unread, so the notch shows).`,
    );
    console.log('Undo: pnpm --filter api pulse:demo clear');
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

async function findMe(prisma: PrismaClient, email?: string) {
  const identities = await prisma.identity.findMany({
    where: {
      type: 'INDIVIDUAL',
      id: { not: { startsWith: P } },
      ...(email ? { user: { email } } : {}),
    },
    select: { id: true, user: { select: { email: true, phone: true } } },
  });
  if (identities.length !== 1) {
    throw new Error(
      identities.length === 0
        ? `No individual profile${email ? ` for ${email}` : ''} in this database.`
        : `${identities.length} individual profiles: pick one with --email <email>.`,
    );
  }
  const [me] = identities;
  return { id: me.id, label: me.user.email ?? me.user.phone ?? me.id };
}

// The other side of every case: an approved company with a logo
async function ensureCompany(prisma: PrismaClient) {
  await prisma.user.upsert({
    where: { id: ids.user },
    update: {},
    create: { id: ids.user, password: '!', email: `${P}company@example.com` },
  });
  await prisma.identity.upsert({
    where: { id: ids.company },
    update: {},
    create: { id: ids.company, userId: ids.user, type: 'COMPANY' },
  });
  await prisma.companyIdentityData.upsert({
    where: { id: ids.companyData },
    update: {},
    create: {
      id: ids.companyData,
      identityId: ids.company,
      name: 'شركة النبض التجريبية',
      licenseNumber: 'PULSE-DEMO',
      status: 'APPROVED',
      logoUrl: 'https://placehold.co/96x96/15304D/C5A36D/png?text=B',
    },
  });
}

async function nextReference(prisma: PrismaClient) {
  const { _max } = await prisma.property.aggregate({
    _max: { referenceNumber: true },
  });
  return (_max.referenceNumber ?? 0) + 1;
}

type Me = { id: string; label: string };

const seed: Record<Case, (prisma: PrismaClient, me: Me) => Promise<void>> = {
  async offers(prisma, me) {
    await prisma.requestOffer.deleteMany({ where: { id: ids.offer } });
    await prisma.companyRequest.deleteMany({ where: { id: ids.request } });
    await prisma.companyRequest.create({
      data: {
        id: ids.request,
        clientIdentityId: me.id,
        title: 'تصميم واجهة فيلا (تجريبي)',
        location: 'الكويت',
        description: 'طلب تجريبي لعرض النبض',
      },
    });
    await prisma.requestOffer.create({
      data: {
        id: ids.offer,
        requestId: ids.request,
        providerIdentityId: ids.company,
        message: 'عرض تجريبي',
        price: 3500,
      },
    });
    console.log('✓ offers    — an offer waiting on your open request (tag +1)');
  },

  async expiring(prisma, me) {
    // The pulse looks 3 days ahead, so at most 2 whole days are left
    const days = Math.min(2, Math.max(0, Number(arg('days') ?? 1)));
    await prisma.property.deleteMany({ where: { id: ids.ad } });
    // A little past N whole days, so daysLeft is N
    const endDate = new Date(Date.now() + days * DAY_MS + 60 * 60 * 1000);
    await prisma.property.create({
      data: {
        id: ids.ad,
        referenceNumber: await nextReference(prisma),
        identityId: me.id,
        type: 'SALE',
        category: 'APARTMENT',
        location: 'الكويت',
        description: 'إعلان تجريبي ينتهي قريباً',
        status: 'ACTIVE',
        publishedAt: new Date(),
        endDate,
      },
    });
    console.log(
      `✓ expiring  — your ad expires in ${days} day(s) (clock ${days === 0 ? '!' : days}${days < 2 ? ', amber' : ''})`,
    );
  },

  async matches(prisma, me) {
    await prisma.alertMatch.deleteMany({ where: { id: ids.match } });
    await prisma.alert.deleteMany({ where: { id: ids.alert } });
    await prisma.property.deleteMany({ where: { id: ids.matchAd } });
    await prisma.alert.create({
      data: {
        id: ids.alert,
        identityId: me.id,
        type: 'PROPERTIES',
        operationType: 'SALE',
        governorateId: 'capital',
      },
    });
    await prisma.property.create({
      data: {
        id: ids.matchAd,
        referenceNumber: await nextReference(prisma),
        identityId: ids.company,
        type: 'SALE',
        category: 'APARTMENT',
        location: 'العاصمة',
        description: 'عقار تجريبي يطابق تنبيهك',
        status: 'ACTIVE',
        publishedAt: new Date(),
        endDate: new Date(Date.now() + 30 * DAY_MS),
      },
    });
    await prisma.alertMatch.create({
      data: { id: ids.match, alertId: ids.alert, propertyId: ids.matchAd },
    });
    console.log('✓ matches   — a new listing matching your alert (house +1)');
  },

  async story(prisma, me) {
    await prisma.storyView.deleteMany({ where: { storyId: ids.story } });
    await prisma.story.deleteMany({ where: { id: ids.story } });
    await prisma.providerFavorite.deleteMany({ where: { id: ids.favorite } });
    await prisma.providerFavorite.create({
      data: { id: ids.favorite, identityId: me.id, providerId: ids.company },
    });
    await prisma.story.create({
      data: {
        id: ids.story,
        identityId: ids.company,
        status: 'ACTIVE',
        mediaType: 'IMAGE',
        // No real file: the notch and the row work, the story itself won't load
        mediaKey: `${P}story/media.jpg`,
        mediaContentType: 'image/jpeg',
        mediaSizeBytes: 1,
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + DAY_MS - 60 * 60 * 1000),
      },
    });
    console.log(
      "✓ story     — a saved company's unwatched story (its logo in a gold ring)",
    );
  },
};

// Children first; everything the demo added, whichever cases ran
async function clear(prisma: PrismaClient) {
  const mine = { startsWith: P };
  await prisma.storyView.deleteMany({ where: { storyId: mine } });
  await prisma.story.deleteMany({ where: { id: mine } });
  await prisma.providerFavorite.deleteMany({ where: { id: mine } });
  await prisma.alertMatch.deleteMany({ where: { id: mine } });
  await prisma.alert.deleteMany({ where: { id: mine } });
  await prisma.requestOffer.deleteMany({ where: { id: mine } });
  await prisma.companyRequest.deleteMany({ where: { id: mine } });
  await prisma.property.deleteMany({ where: { id: mine } });
  await prisma.companyIdentityData.deleteMany({ where: { id: mine } });
  await prisma.identity.deleteMany({ where: { id: mine } });
  await prisma.user.deleteMany({ where: { id: mine } });
}

main().catch((e: Error) => {
  console.error(`✗ ${e.message}`);
  process.exit(1);
});
