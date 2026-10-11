import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

/**
 * Demo data for the mobile "نشاطي" screen: ads (اعلاناتي), price-quote
 * requests (عروضي) and alerts (تنبيهاتي) for one account's INDIVIDUAL
 * persona. Re-runnable: demo ads carry a `demo-activity-*` submissionKey and
 * are replaced; alerts and requests are only added when the persona has none.
 *
 *   SEED_EMAIL=dev@youssef.app pnpm --filter api exec ts-node prisma/seeds/seed-activity-demo.ts
 */
const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })),
});

const EMAIL = process.env.SEED_EMAIL ?? 'dev@youssef.app';
const KEY_PREFIX = 'demo-activity-';

const U = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;
const IMG = {
  villa: [U('photo-1613490493576-7fde63acd811'), U('photo-1512917774080-9991f1c4c750'), U('photo-1600596542815-ffad4c1539a9')],
  apartment: [U('photo-1560448204-e02f11c3d0e2'), U('photo-1502672260266-1c1ef2d93688'), U('photo-1522708323590-d24dbb6b0267')],
  house: [U('photo-1564013799919-ab600027ffc6'), U('photo-1570129477492-45c003edd2be')],
  building: [U('photo-1486406146926-c627a92ad1ab'), U('photo-1545324418-cc1a3fa10c00')],
  land: [U('photo-1500382017468-9049fed747ef')],
  chalet: [U('photo-1499793983690-e29da59ef1c2'), U('photo-1506744038136-46273834b3fb')],
};

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);
const daysAhead = (n: number) => new Date(Date.now() + n * 86_400_000);

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: EMAIL },
    include: { identities: true },
  });
  if (!user) throw new Error(`No user with email ${EMAIL}`);
  const identity = user.identities.find((i) => i.type === 'INDIVIDUAL');
  if (!identity) throw new Error(`${EMAIL} has no INDIVIDUAL identity`);
  const identityId = identity.id;
  console.log(`Seeding for ${EMAIL} (individual ${identityId})`);

  // --- Ads ---------------------------------------------------------------
  const removed = await prisma.property.deleteMany({
    where: { identityId, submissionKey: { startsWith: KEY_PREFIX } },
  });
  if (removed.count) console.log(`Replaced ${removed.count} earlier demo ads`);

  const max = await prisma.property.aggregate({ _max: { referenceNumber: true } });
  let ref = (max._max.referenceNumber ?? 9_000_000) + 1;

  type Ad = Omit<Prisma.PropertyUncheckedCreateInput, 'referenceNumber' | 'identityId' | 'submissionKey' | 'location'> & { location: string };
  const ads: Ad[] = [
    {
      type: 'SALE', category: 'VILLA', price: 650000, beds: 6, baths: 5, floors: 2, areaSize: 500,
      location: 'الأحمدي - الفنطاس', governorateId: 'ahmadi', areaId: 'ahmadi_1',
      description: 'فيلا فاخرة بتشطيب حديث، مجلس واسع ومسبح خاص وحديقة، قريبة من الخدمات.',
      images: IMG.villa, status: 'ACTIVE', isFeatured: true, featuredUntil: daysAhead(12),
      publishedAt: daysAgo(3), views: 184,
      features: [{ id: 'pool', label: 'مسبح' }, { id: 'garden', label: 'حديقة' }, { id: 'maid', label: 'غرفة خادمة' }],
    },
    {
      type: 'SALE', category: 'APARTMENT', price: 150000, beds: 3, baths: 2, floors: 4, areaSize: 200,
      location: 'حولي - السلام', governorateId: 'hawally', areaId: 'hawally_1',
      description: 'شقة في الدور الرابع بإطلالة مفتوحة، تشطيب سوبر لوكس وموقف خاص.',
      images: IMG.apartment, status: 'ACTIVE', publishedAt: daysAgo(10), views: 96,
      features: [{ id: 'elevator', label: 'مصعد' }, { id: 'parking', label: 'موقف سيارات' }],
    },
    {
      type: 'RENT', category: 'APARTMENT', price: 450, beds: 2, baths: 2, floors: 2, areaSize: 120,
      location: 'الفروانية - الرابية', governorateId: 'farwaniya', areaId: 'farwaniya_11',
      description: 'شقة للإيجار الشهري، مكيفات مركزية، قريبة من المدارس والمجمعات.',
      images: IMG.apartment, status: 'ACTIVE', isHidden: true, publishedAt: daysAgo(20), views: 41,
      features: [{ id: 'ac', label: 'تكييف مركزي' }],
    },
    {
      type: 'SALE', category: 'BUILDING', price: 1250000, beds: 0, baths: 0, floors: 4, areaSize: 750,
      location: 'مبارك الكبير - المسيلة', governorateId: 'mubarak_alkabeer', areaId: 'mubarak_2',
      description: 'عمارة استثمارية بعائد ممتاز، مؤجرة بالكامل على شارعين.',
      images: IMG.building, status: 'ACTIVE', propertyIncome: 16000, publishedAt: daysAgo(5), views: 230,
      features: [{ id: 'income', label: 'عائد استثماري' }],
    },
    {
      type: 'SALE', category: 'LAND', price: 320000, areaSize: 600,
      location: 'الجهراء - العبدلي', governorateId: 'jahra', areaId: 'jahra_10',
      description: 'أرض سكنية على شارع رئيسي، مناسبة للبناء أو الاستثمار.',
      images: IMG.land, status: 'DRAFT', publishedAt: null, views: 0,
    },
    {
      type: 'RENT', category: 'CHALET', price: 90, beds: 2, baths: 1, areaSize: 150,
      location: 'الأحمدي - الفحيحيل', governorateId: 'ahmadi', areaId: 'ahmadi_10',
      description: 'شالية على البحر للإيجار اليومي، مدخل خاص وجلسة خارجية.',
      images: IMG.chalet, status: 'EXPIRED', publishedAt: daysAgo(70), endDate: daysAgo(5), views: 310,
      features: [{ id: 'sea', label: 'إطلالة بحرية' }],
    },
    {
      type: 'SALE', category: 'HOUSE', price: 410000, beds: 5, baths: 4, floors: 2, areaSize: 400,
      location: 'العاصمة - قرطبة', governorateId: 'capital', areaId: 'capital_10',
      description: 'بيت عربي واسع في موقع هادئ، مناسب لعائلة كبيرة.',
      images: IMG.house, status: 'CLOSED', publishedAt: daysAgo(45), views: 120,
    },
  ];

  for (const [i, ad] of ads.entries()) {
    await prisma.property.create({
      data: {
        ...ad,
        features: (ad.features ?? []) as Prisma.InputJsonValue,
        referenceNumber: ref++,
        identityId,
        submissionKey: `${KEY_PREFIX}${i + 1}`,
        phoneNumber: user.phone ?? undefined,
      },
    });
  }
  console.log(`Created ${ads.length} ads`);

  // --- Alerts (تنبيهاتي) -------------------------------------------------
  if ((await prisma.alert.count({ where: { identityId } })) === 0) {
    await prisma.alert.createMany({
      data: [
        { identityId, type: 'PROPERTIES', operationType: 'SALE', governorateId: 'hawally', areaId: 'hawally_1', categoryId: 'apartment', price: 180000, areaSize: 150, rooms: 3, baths: 2, isActive: true },
        { identityId, type: 'PROPERTIES', operationType: 'RENT', governorateId: 'farwaniya', categoryId: 'apartment', rentValue: 500, rooms: 2, isActive: true },
        { identityId, type: 'PROPERTIES', operationType: 'SALE', governorateId: 'ahmadi', categoryId: 'villa', price: 700000, isActive: false },
        { identityId, type: 'AUCTIONS', governorateId: 'capital', startDate: daysAhead(1), endDate: daysAhead(30), isActive: true },
      ],
    });
    console.log('Created 4 alerts');
  } else console.log('Alerts already exist, skipped');

  // --- Price-quote requests (عروضي): every status the tab filters on ------
  // SEED_RESET_REQUESTS=1 replaces the persona's existing requests
  if (process.env.SEED_RESET_REQUESTS === '1') {
    const gone = await prisma.companyRequest.deleteMany({
      where: { clientIdentityId: identityId },
    });
    if (gone.count) console.log(`Removed ${gone.count} earlier requests`);
  }
  if ((await prisma.companyRequest.count({ where: { clientIdentityId: identityId } })) === 0) {
    const providers = await prisma.identity.findMany({
      where: { type: 'COMPANY', userId: { not: user.id }, companyData: { isNot: null } },
      include: { companyData: true },
      take: 2,
    });
    const [p1, p2 = p1] = providers;
    const base = { clientIdentityId: identityId, category: 'هندسي', priceRange: '150,000 - 200,000 د.ك', location: 'السالمية', offerType: 'عرض سعر', images: [] as string[] };
    const title = 'فحص هندسي لعقار بالسالمية';
    const description = 'أحتاج فحصاً هندسياً شاملاً قبل شراء العقار يشمل:\n- الهيكل الإنشائي\n- الكهرباء\n- السباكة\n- الرطوبة والتشققات';
    const reply = (providerId: string, status: 'SENT' | 'ACCEPTED' | 'REJECTED' = 'SENT', price = 150000) => ({
      providerIdentityId: providerId,
      message: 'مرحبا استاذ علي\nنحن مستعدون لتنفيذ الفحص الهندسي وفقا للمتطلبات المذكورة ويمكننا البدء خلال 3 ايام من تاريخ الموافقة.\nللاستفسار أو أي تواصل إضافي لا تتردد في التواصل معنا؟',
      notes: 'يمكن تحديد موعد المعاينة خلال 24 ساعة',
      price,
      status,
    });
    const make = (status: 'PENDING' | 'RESPONDED' | 'ACCEPTED' | 'REJECTED', extra: Record<string, unknown> = {}, offers: ReturnType<typeof reply>[] = []) =>
      prisma.companyRequest.create({
        data: { ...base, title, description, status, ...extra, ...(offers.length ? { offers: { create: offers } } : {}) } as any,
      });

    // قيد الانتظار (3)
    for (let i = 0; i < 3; i++) await make('PENDING');
    // تم الرد (2): answered by two companies / sent to one company
    await make('RESPONDED', {}, [reply(p1.id), reply(p2.id, 'SENT', 175000)]);
    await make('RESPONDED', { targetIdentityId: p1.id }, [reply(p1.id)]);
    // المقبولة (2)
    for (const p of [p1, p2]) {
      await make('ACCEPTED', { targetIdentityId: p.id, acceptedByIdentityId: p.id }, [reply(p.id, 'ACCEPTED')]);
    }
    // مرفوضة (2)
    await make('REJECTED', {}, [reply(p1.id, 'REJECTED')]);
    await make('REJECTED', { targetIdentityId: p1.id }, [reply(p1.id, 'REJECTED')]);
    console.log('Created 9 quote requests (with offers) across all four statuses');
  } else console.log('Requests already exist, skipped (SEED_RESET_REQUESTS=1 replaces them)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
