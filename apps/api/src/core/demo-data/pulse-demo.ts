/**
 * The «النبض» demo data (GET /pulse/me cases, the company/office profiles
 * and the studio), shared by the pulse:demo script and the testing
 * portal's «بيانات تجريبية» tool. Every row it adds has an id starting with
 * b0b0b0b0- (or pulse-demo-), so `clear` removes exactly what it added.
 */
import { PrismaClient } from '@prisma/client';

export const CASES = ['offers', 'expiring', 'matches', 'story'] as const;
type Case = (typeof CASES)[number];
export const PROFILES = ['company', 'office', 'studio'] as const;
type Profile = (typeof PROFILES)[number];
export const DEMO_COMMANDS: string[] = [...CASES, 'all', ...PROFILES, 'clear'];

// Every row it adds has a UUID starting with this (the app's routes check
// ids are UUIDs), so clear finds them all. P names its non-id values (and
// rows from before, which clear still removes)
const U = 'b0b0b0b0-';
const uuid = (n: number) => `${U}0000-4000-8000-${String(n).padStart(12, '0')}`;
const P = 'pulse-demo-';
const DAY_MS = 24 * 60 * 60 * 1000;

const ids = {
  user: uuid(1001),
  company: uuid(1002),
  companyData: uuid(1003),
  request: uuid(1004),
  offer: uuid(1005),
  ad: uuid(1006),
  matchAd: uuid(1007),
  alert: uuid(1008),
  match: uuid(1009),
  favorite: uuid(1010),
  story: uuid(1011),
  // My own demo company and office (profiles on my account)
  myCompany: uuid(1012),
  myCompanyData: uuid(1013),
  invoice: uuid(1014),
  privateRequest: uuid(1015),
  acceptedRequest: uuid(1016),
  acceptedOffer: uuid(1017),
  publicRequest: uuid(1018),
  myCompanyStory: uuid(1019),
  myOffice: uuid(1020),
  myOfficeData: uuid(1021),
  officeAd: uuid(1022),
  myOfficeStory: uuid(1023),
};
const HOUR_MS = 60 * 60 * 1000;
const LOGO = (letter: string) =>
  `https://placehold.co/96x96/15304D/C5A36D/png?text=${letter}`;

export type DemoCommand = Case | Profile | 'all' | 'clear';

export interface DemoOptions {
  // The account to fill: by email, or by user id (the testing portal)
  email?: string;
  userId?: string;
  // expiring: whole days left on the ad (0-2)
  days?: number;
}

// What a case prints; the script writes it to the console, the portal
// returns it to the tester
let log: (line: string) => void = () => undefined;
let opts: DemoOptions = {};

/**
 * Runs one demo command against `prisma` and returns what it did, line by
 * line. Throws (with a readable message) when the account can't be found.
 */
export async function runPulseDemo(
  prisma: PrismaClient,
  what: DemoCommand,
  options: DemoOptions = {},
): Promise<string[]> {
  const lines: string[] = [];
  log = (line) => lines.push(line);
  opts = options;
  try {
    if (what === 'clear') {
      await clear(prisma);
      log('✓ Removed all pulse demo data');
      return lines;
    }
    const me = await findMe(prisma, options);
    await ensureCompany(prisma);
    if ((PROFILES as readonly string[]).includes(what)) {
      await profiles[what as Profile](prisma, me);
      log(
        `On ${me.label}: double-tap your photo, switch to the new profile, and look at its home.`,
      );
      return lines;
    }
    const cases: Case[] = what === 'all' ? [...CASES] : [what as Case];
    for (const c of cases) {
      await seed[c](prisma, me);
    }
    log(
      `For ${me.label}. Pull to refresh the home (nothing unread, so the notch shows).`,
    );
    return lines;
  } finally {
    log = () => undefined;
    opts = {};
  }
}

async function findMe(prisma: PrismaClient, { email, userId }: DemoOptions) {
  const identities = await prisma.identity.findMany({
    where: {
      type: 'INDIVIDUAL',
      AND: [
        { id: { not: { startsWith: P } } },
        { id: { not: { startsWith: U } } },
      ],
      ...(email ? { user: { email } } : {}),
      ...(userId ? { userId } : {}),
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
        ? `No individual profile${email ? ` for ${email}` : userId ? ' on this account' : ''} in this database.`
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
    log('✓ offers    — an offer waiting on your open request (tag +1)');
  },

  async expiring(prisma, me) {
    // The pulse looks 3 days ahead, so at most 2 whole days are left
    const days = Math.min(2, Math.max(0, Number(opts.days ?? 1)));
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
    log(
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
    log('✓ matches   — a new listing matching your alert (house +1)');
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
    log(
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

/** A past story of `identityId` that ended `daysAgo` days ago. */
async function pastStory(
  prisma: PrismaClient,
  n: number,
  identityId: string,
  daysAgo: number,
) {
  const expiresAt = new Date(Date.now() - daysAgo * DAY_MS);
  await prisma.story.create({
    data: {
      id: uuid(n),
      identityId,
      status: 'ACTIVE',
      mediaType: 'IMAGE',
      mediaKey: `${P}studio/${n}/media.jpg`,
      mediaContentType: 'image/jpeg',
      mediaSizeBytes: 1,
      caption: `قصة تجريبية قبل ${daysAgo} يوماً`,
      publishedAt: new Date(expiresAt.getTime() - DAY_MS),
      expiresAt,
    },
  });
  return uuid(n);
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
    log(`✓ company   — «${co.name}»: an overdue invoice, a private request,`);
    log(
      '              an accepted offer, a new public request, a live story (1 view)',
    );
  },

  async studio(prisma, me) {
    const mine = await prisma.identity.findFirst({
      where: { userId: me.userId, type: { in: ['COMPANY', 'OFFICE'] } },
      orderBy: { type: 'asc' },
      select: { id: true },
    });
    const owner = mine
      ? await myProfile(
          prisma,
          me,
          (
            await prisma.identity.findUniqueOrThrow({
              where: { id: mine.id },
              select: { type: true },
            })
          ).type as 'COMPANY' | 'OFFICE',
        )
      : await myProfile(prisma, me, 'COMPANY');
    await clearStudio(prisma);
    const [, threeDays, eightDays] = [
      await pastStory(prisma, 1, owner.id, 1),
      await pastStory(prisma, 2, owner.id, 3),
      await pastStory(prisma, 3, owner.id, 8),
    ];
    await pastStory(prisma, 4, owner.id, 20);
    // Past its 30 days: only kept because it is highlighted
    const fortyDays = await pastStory(prisma, 5, owner.id, 40);
    await prisma.storyHighlight.create({
      data: {
        id: uuid(101),
        identityId: owner.id,
        title: 'مشاريعنا',
        position: 0,
        items: {
          create: [
            { storyId: fortyDays, position: 0 },
            { storyId: eightDays, position: 1 },
          ],
        },
      },
    });
    await prisma.storyHighlight.create({
      data: {
        id: uuid(102),
        identityId: owner.id,
        title: 'عروض',
        position: 1,
        items: { create: [{ storyId: threeDays, position: 0 }] },
      },
    });
    log(
      `✓ studio    — «${owner.name}»: 5 past stories (1, 3, 8, 20, 40 days ago; the 40-day one only`,
    );
    log('              kept by «مشاريعنا»), highlights «مشاريعنا» and «عروض»');
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
    log(
      `✓ office    — «${of.name}»: an ad expiring tomorrow, a live story (1 view),`,
    );
    log('              and no ad credits, unless it has a package');
  },
};

// Children first; everything the demo added, whichever cases ran
// The studio's own rows (stories 1–5, highlights 101–102), not the other cases'
const STUDIO_STORIES = [1, 2, 3, 4, 5].map(uuid);
const STUDIO_HIGHLIGHTS = [101, 102].map(uuid);

async function clearStudio(prisma: PrismaClient) {
  await prisma.storyHighlight.deleteMany({
    where: { id: { in: STUDIO_HIGHLIGHTS } },
  });
  await prisma.storyView.deleteMany({
    where: { storyId: { in: STUDIO_STORIES } },
  });
  await prisma.story.deleteMany({ where: { id: { in: STUDIO_STORIES } } });
}

async function clear(prisma: PrismaClient) {
  await clearStudio(prisma);
  // Children first; this run's UUIDs and rows from before them
  for (const prefix of [U, P]) {
    const mine = { startsWith: prefix };
    await prisma.storyHighlight.deleteMany({ where: { id: mine } });
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
}
