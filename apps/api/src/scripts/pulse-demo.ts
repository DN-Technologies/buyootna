/**
 * Puts each «النبض» (GET /pulse/me) case on a local account, to see the
 * home pill's notch and quick view in the simulator. Local databases only.
 *
 *   pnpm --filter api pulse:demo all                 every case at once
 *   pnpm --filter api pulse:demo offers              an offer on my open request
 *   pnpm --filter api pulse:demo expiring [--days N] my ad with N whole days left (0-2, default 1)
 *   pnpm --filter api pulse:demo matches             a new listing matching my alert
 *   pnpm --filter api pulse:demo story               a saved company's unwatched story
 *   pnpm --filter api pulse:demo company             my company profile (a demo one if I have none):
 *                                                    an overdue invoice, a private request, an
 *                                                    accepted offer, a new public request, a live story
 *   pnpm --filter api pulse:demo office              my office profile (a demo one if I have none):
 *                                                    an ad expiring tomorrow, a live story, and no
 *                                                    ad credits unless it has a package
 *   pnpm --filter api pulse:demo clear               removes everything it added
 *
 * The account: --email <email>, or the only individual profile in the
 * database. Each case replaces its own earlier rows, so it can be re-run;
 * pull to refresh (or leave and come back to) the home to see it. For the
 * company and office, double-tap your photo and switch to the new profile.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const CASES = ['offers', 'expiring', 'matches', 'story'] as const;
type Case = (typeof CASES)[number];
const PROFILES = ['company', 'office'] as const;
type Profile = (typeof PROFILES)[number];
const COMMANDS: string[] = [...CASES, 'all', ...PROFILES, 'clear'];

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
  // My own demo company and office (profiles on my account)
  myCompany: `${P}my-company`,
  myCompanyData: `${P}my-company-data`,
  invoice: `${P}invoice`,
  privateRequest: `${P}private-request`,
  acceptedRequest: `${P}accepted-request`,
  acceptedOffer: `${P}accepted-offer`,
  publicRequest: `${P}public-request`,
  myCompanyStory: `${P}my-company-story`,
  myOffice: `${P}my-office`,
  myOfficeData: `${P}my-office-data`,
  officeAd: `${P}my-office-ad`,
  myOfficeStory: `${P}my-office-story`,
};
const HOUR_MS = 60 * 60 * 1000;
const LOGO = (letter: string) =>
  `https://placehold.co/96x96/15304D/C5A36D/png?text=${letter}`;

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
  if (!what || !COMMANDS.includes(what)) {
    console.log(
      `Usage: pnpm --filter api pulse:demo <${COMMANDS.join(' | ')}> [--email <email>] [--days N]`,
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
    if ((PROFILES as readonly string[]).includes(what)) {
      await profiles[what as Profile](prisma, me);
      console.log(
        `\nOn ${me.label}: double-tap your photo, switch to the new profile, and look at its home.`,
      );
      console.log('Undo: pnpm --filter api pulse:demo clear');
      return;
    }
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
    select: {
      id: true,
      userId: true,
      user: { select: { email: true, phone: true } },
    },
  });
  if (identities.length !== 1) {
    throw new Error(
      identities.length === 0
        ? `No individual profile${email ? ` for ${email}` : ''} in this database.`
        : `${identities.length} individual profiles: pick one with --email <email>.`,
    );
  }
  const [me] = identities;
  return {
    id: me.id,
    userId: me.userId,
    label: me.user.email ?? me.user.phone ?? me.id,
  };
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
      logoUrl: LOGO('B'),
    },
  });
}

async function nextReference(prisma: PrismaClient) {
  const { _max } = await prisma.property.aggregate({
    _max: { referenceNumber: true },
  });
  return (_max.referenceNumber ?? 0) + 1;
}

type Me = { id: string; userId: string; label: string };

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

// A live story by `identityId` that the demo company has viewed
async function liveStory(
  prisma: PrismaClient,
  id: string,
  identityId: string,
  hoursLeft: number,
) {
  await prisma.storyView.deleteMany({ where: { storyId: id } });
  await prisma.story.deleteMany({ where: { id } });
  await prisma.story.create({
    data: {
      id,
      identityId,
      status: 'ACTIVE',
      mediaType: 'IMAGE',
      mediaKey: `${id}/media.jpg`,
      mediaContentType: 'image/jpeg',
      mediaSizeBytes: 1,
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + hoursLeft * HOUR_MS + 10 * 60 * 1000),
    },
  });
  await prisma.storyView.create({
    data: { storyId: id, viewerIdentityId: ids.company },
  });
}

/**
 * My company or office: the one already on my account (its own data is left
 * alone), else a demo one, approved, that clear removes.
 */
async function myProfile(
  prisma: PrismaClient,
  me: Me,
  type: 'COMPANY' | 'OFFICE',
): Promise<{ id: string; name: string }> {
  const existing = await prisma.identity.findFirst({
    where: { userId: me.userId, type },
    select: {
      id: true,
      companyData: { select: { name: true } },
      officeData: { select: { name: true } },
    },
  });
  if (existing) {
    return {
      id: existing.id,
      name: existing.companyData?.name ?? existing.officeData?.name ?? type,
    };
  }
  const company = type === 'COMPANY';
  const id = company ? ids.myCompany : ids.myOffice;
  const name = company ? 'شركتي التجريبية' : 'مكتبي التجريبي';
  await prisma.identity.create({ data: { id, userId: me.userId, type } });
  const data = {
    identityId: id,
    name,
    licenseNumber: company ? 'PULSE-DEMO-MINE' : 'PULSE-DEMO-OFFICE',
    status: 'APPROVED' as const,
    logoUrl: LOGO(company ? 'C' : 'O'),
  };
  if (company) {
    await prisma.companyIdentityData.create({
      data: { id: ids.myCompanyData, ...data },
    });
  } else {
    await prisma.officeIdentityData.create({
      data: { id: ids.myOfficeData, ...data },
    });
  }
  return { id, name };
}

const profiles: Record<
  Profile,
  (prisma: PrismaClient, me: Me) => Promise<void>
> = {
  async company(prisma, me) {
    const co = await myProfile(prisma, me, 'COMPANY');
    // An overdue invoice: billing in red
    await prisma.invoice.deleteMany({ where: { id: ids.invoice } });
    await prisma.invoice.create({
      data: {
        id: ids.invoice,
        invoiceNo: 'PULSE-DEMO-INVOICE',
        planName: 'باقة تجريبية',
        amount: 50,
        identityId: co.id,
        status: 'OVERDUE',
        dueDate: new Date(Date.now() - 2 * DAY_MS),
      },
    });
    // The requests come from the demo company
    const reqIds = [ids.privateRequest, ids.acceptedRequest, ids.publicRequest];
    await prisma.requestOffer.deleteMany({ where: { id: ids.acceptedOffer } });
    await prisma.companyRequest.deleteMany({ where: { id: { in: reqIds } } });
    const base = {
      clientIdentityId: ids.company,
      location: 'الكويت',
      description: 'طلب تجريبي لعرض النبض',
    };
    await prisma.companyRequest.create({
      data: {
        ...base,
        id: ids.privateRequest,
        targetIdentityId: co.id,
        title: 'تصميم مكتب (طلب خاص تجريبي)',
      },
    });
    await prisma.companyRequest.create({
      data: {
        ...base,
        id: ids.acceptedRequest,
        acceptedByIdentityId: co.id,
        status: 'ACCEPTED',
        title: 'ترميم شقة (عرض مقبول تجريبي)',
      },
    });
    await prisma.requestOffer.create({
      data: {
        id: ids.acceptedOffer,
        requestId: ids.acceptedRequest,
        providerIdentityId: co.id,
        status: 'ACCEPTED',
        price: 4200,
      },
    });
    await prisma.companyRequest.create({
      data: {
        ...base,
        id: ids.publicRequest,
        title: 'صيانة مكيفات (طلب عام تجريبي)',
        createdAt: new Date(Date.now() - 2 * HOUR_MS),
      },
    });
    await liveStory(prisma, ids.myCompanyStory, co.id, 9);
    console.log(
      `✓ company   — «${co.name}»: an overdue invoice, a private request,`,
    );
    console.log(
      '              an accepted offer, a new public request, a live story (1 view)',
    );
  },

  async office(prisma, me) {
    const of = await myProfile(prisma, me, 'OFFICE');
    // No ad package: no credits left
    await prisma.property.deleteMany({ where: { id: ids.officeAd } });
    await prisma.property.create({
      data: {
        id: ids.officeAd,
        referenceNumber: await nextReference(prisma),
        identityId: of.id,
        type: 'RENT',
        category: 'APARTMENT',
        location: 'حولي',
        description: 'إعلان مكتب تجريبي ينتهي غداً',
        status: 'ACTIVE',
        publishedAt: new Date(),
        endDate: new Date(Date.now() + DAY_MS + HOUR_MS),
      },
    });
    await liveStory(prisma, ids.myOfficeStory, of.id, 20);
    console.log(
      `✓ office    — «${of.name}»: an ad expiring tomorrow, a live story (1 view),`,
    );
    console.log('              and no ad credits, unless it has a package');
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
  await prisma.invoice.deleteMany({ where: { id: mine } });
  await prisma.companyIdentityData.deleteMany({ where: { id: mine } });
  await prisma.officeIdentityData.deleteMany({ where: { id: mine } });
  await prisma.identity.deleteMany({ where: { id: mine } });
  await prisma.user.deleteMany({ where: { id: mine } });
}

main().catch((e: Error) => {
  console.error(`✗ ${e.message}`);
  process.exit(1);
});
