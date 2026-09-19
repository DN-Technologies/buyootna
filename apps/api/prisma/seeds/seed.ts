import {
  PrismaClient,
  ListingType,
  PropertyCategory,
  ListingStatus,
  Role,
  ApprovalStatus,
  IdentityType,
  RequestStatus,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { randomCoordinateForArea } from './kuwait-coordinates';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const GOVERNORATES = [
  {
    id: 'capital',
    name: 'العاصمة',
    areas: [
      { id: 'capital_1', name: 'مدينة جابر الأحمد' },
      { id: 'capital_2', name: 'شالهيات الدوحة' },
      { id: 'capital_3', name: 'النهضة' },
      { id: 'capital_4', name: 'الصوابر' },
      { id: 'capital_5', name: 'كيفان' },
      { id: 'capital_6', name: 'السرة' },
      { id: 'capital_7', name: 'الروضة' },
      { id: 'capital_8', name: 'الدسمة' },
      { id: 'capital_9', name: 'الري' },
      { id: 'capital_10', name: 'قرطبة' },
      { id: 'capital_11', name: 'شرق' },
      { id: 'capital_12', name: 'الدعية' },
      { id: 'capital_13', name: 'اليرموك' },
      { id: 'capital_14', name: 'الصليبيخات' },
      { id: 'capital_15', name: 'المرقاب' },
      { id: 'capital_16', name: 'الشويخ' },
      { id: 'capital_17', name: 'العديلية' },
      { id: 'capital_18', name: 'ضاحية عبد الله السالم' },
      { id: 'capital_19', name: 'الخالدية' },
      { id: 'capital_20', name: 'القيروان' },
      { id: 'capital_21', name: 'دسمان' },
      { id: 'capital_22', name: 'الفيحاء' },
      { id: 'capital_23', name: 'غرناطة' },
      { id: 'capital_24', name: 'بنيد القار' },
      { id: 'capital_25', name: 'الشامية' },
      { id: 'capital_26', name: 'الدوحة السكنية' },
      { id: 'capital_27', name: 'القبلة' },
      { id: 'capital_28', name: 'المنصورية' },
      { id: 'capital_29', name: 'النزهة' },
      { id: 'capital_30', name: 'شمال غرب الصليبيخات' },
    ],
  },
  {
    id: 'hawally',
    name: 'حولي',
    areas: [
      { id: 'hawally_1', name: 'السلام' },
      { id: 'hawally_2', name: 'السالمية' },
      { id: 'hawally_3', name: 'الجابرية' },
      { id: 'hawally_4', name: 'الشهداء' },
      { id: 'hawally_5', name: 'الزهراء' },
      { id: 'hawally_6', name: 'بيان' },
      { id: 'hawally_7', name: 'الشعب' },
      { id: 'hawally_8', name: 'البدع' },
      { id: 'hawally_9', name: 'الرميثية' },
      { id: 'hawally_10', name: 'الصديق' },
      { id: 'hawally_11', name: 'النقرة' },
      { id: 'hawally_12', name: 'حطين' },
      { id: 'hawally_13', name: 'حولي' },
      { id: 'hawally_14', name: 'سلوى' },
      { id: 'hawally_15', name: 'مبارك العبدالله' },
      { id: 'hawally_16', name: 'مشرف' },
      { id: 'hawally_17', name: 'ميدان حولي' },
    ],
  },
  {
    id: 'farwaniya',
    name: 'الفروانية',
    areas: [
      { id: 'farwaniya_1', name: 'الفروانية' },
      { id: 'farwaniya_2', name: 'خيطان الجديدة' },
      { id: 'farwaniya_3', name: 'خيطان' },
      { id: 'farwaniya_4', name: 'العمرية' },
      { id: 'farwaniya_5', name: 'جليب الشيوخ' },
      { id: 'farwaniya_6', name: 'العباسية' },
      { id: 'farwaniya_7', name: 'العارضية الصناعية' },
      { id: 'farwaniya_8', name: 'الحساوي' },
      { id: 'farwaniya_9', name: 'الفردوس' },
      { id: 'farwaniya_10', name: 'أبرق خيطان' },
      { id: 'farwaniya_11', name: 'الرابية' },
      { id: 'farwaniya_12', name: 'الضجيج' },
      { id: 'farwaniya_13', name: 'الرقعي' },
      { id: 'farwaniya_14', name: 'أشبيلية' },
      { id: 'farwaniya_15', name: 'الرحاب' },
      { id: 'farwaniya_16', name: 'الصليبية الصناعية 3' },
      { id: 'farwaniya_17', name: 'غرب عبدالله المبارك' },
      { id: 'farwaniya_18', name: 'جنوب عبدالله المبارك' },
      { id: 'farwaniya_19', name: 'الاندلس' },
      { id: 'farwaniya_20', name: 'ضاحية عبد الله المبارك' },
      { id: 'farwaniya_21', name: 'ضاحية صباح الناصر' },
      { id: 'farwaniya_22', name: 'العارضية' },
    ],
  },
  {
    id: 'ahmadi',
    name: 'الأحمدي',
    areas: [
      { id: 'ahmadi_1', name: 'الفنطاس' },
      { id: 'ahmadi_2', name: 'هدية' },
      { id: 'ahmadi_3', name: 'الظهر' },
      { id: 'ahmadi_4', name: 'العقيلة' },
      { id: 'ahmadi_5', name: 'الرقة' },
      { id: 'ahmadi_6', name: 'المهبولة' },
      { id: 'ahmadi_7', name: 'الصباحية' },
      { id: 'ahmadi_8', name: 'أبو حليفة' },
      { id: 'ahmadi_9', name: 'المنقف' },
      { id: 'ahmadi_10', name: 'الفحيحيل' },
      { id: 'ahmadi_11', name: 'المقوع' },
      { id: 'ahmadi_12', name: 'الأحمدي' },
      { id: 'ahmadi_13', name: 'الخيران' },
      { id: 'ahmadi_14', name: 'الخيران السكنية' },
      { id: 'ahmadi_15', name: 'الزور' },
      { id: 'ahmadi_16', name: 'النويصيب' },
      { id: 'ahmadi_17', name: 'الوفرة' },
      { id: 'ahmadi_18', name: 'الوفرة السكنية' },
      { id: 'ahmadi_19', name: 'جابر العلي' },
      { id: 'ahmadi_20', name: 'جنوب صباح الأحمد' },
      { id: 'ahmadi_21', name: 'شاليهات الجليعة' },
      { id: 'ahmadi_22', name: 'شاليهات الزور' },
      { id: 'ahmadi_23', name: 'شاليهات الضباعية' },
      { id: 'ahmadi_24', name: 'شاليهات النويصيب' },
      { id: 'ahmadi_25', name: 'شاليهات بنيدر' },
      { id: 'ahmadi_26', name: 'صباح الأحمد البحرية' },
      { id: 'ahmadi_27', name: 'ضاحية علي صباح السالم' },
      { id: 'ahmadi_28', name: 'ضاحية فهد الأحمد' },
      { id: 'ahmadi_29', name: 'مدينة صباح الأحمد' },
      { id: 'ahmadi_30', name: 'ميناء عبدالله' },
    ],
  },
  {
    id: 'jahra',
    name: 'الجهراء',
    areas: [
      { id: 'jahra_1', name: 'الجهراء القديمة' },
      { id: 'jahra_2', name: 'النسيم' },
      { id: 'jahra_3', name: 'النعيم' },
      { id: 'jahra_4', name: 'الجهراء الجديدة' },
      { id: 'jahra_5', name: 'تيماء' },
      { id: 'jahra_6', name: 'الواحة' },
      { id: 'jahra_7', name: 'القيصرية' },
      { id: 'jahra_8', name: 'العيون' },
      { id: 'jahra_9', name: 'كبد' },
      { id: 'jahra_10', name: 'العبدلي' },
      { id: 'jahra_11', name: 'القصر' },
      { id: 'jahra_12', name: 'الصبية' },
      { id: 'jahra_13', name: 'المطلاع' },
      { id: 'jahra_14', name: 'الصليبية الصناعية' },
      { id: 'jahra_15', name: 'السالمي' },
      { id: 'jahra_16', name: 'أمغرة الصناعية' },
      { id: 'jahra_17', name: 'الروضتين' },
      { id: 'jahra_18', name: 'شاليهات الصبية' },
      { id: 'jahra_19', name: 'شاليهات كاظمة' },
      { id: 'jahra_20', name: 'الصليبية السكنية' },
      { id: 'jahra_21', name: 'النعايم الصناعية' },
      { id: 'jahra_22', name: 'النهضة' },
      { id: 'jahra_23', name: 'المطلاع السكنية' },
      { id: 'jahra_24', name: 'جواخير الجهراء' },
      { id: 'jahra_25', name: 'جنوب أمغرة' },
      { id: 'jahra_26', name: 'القيروان' },
      { id: 'jahra_27', name: 'مدينة سعد العبد الله' },
    ],
  },
  {
    id: 'mubarak_alkabeer',
    name: 'مبارك الكبير',
    areas: [
      { id: 'mubarak_1', name: 'صباح السالم' },
      { id: 'mubarak_2', name: 'المسيلة' },
      { id: 'mubarak_3', name: 'الفنيطيس' },
      { id: 'mubarak_4', name: 'أبو الحصانية' },
      { id: 'mubarak_5', name: 'العدان' },
      { id: 'mubarak_6', name: 'القصور' },
      { id: 'mubarak_7', name: 'القرين' },
    ],
  },
];

const COMPANY_NAMES = [
  'الدار العقارية',
  'بابل للمقاولات',
  'ريماس العقارية',
  'أوتاد الاستثمارية',
  'مجموعة الأوراق',
  'يعقوب عبد العقارية',
  'الكويتية للعقارات',
  'الاحمدي للاستثمار',
  'الغانم للمقاولات',
  'الخرافي الهندسية',
  'بهبهاني للتجارة',
  'الملا للخدمات',
  'الشايع للتصميم',
  'المنار للصيانة',
  'المتحدة العقارية',
  'الصالحية العقارية',
  'التمدين العقارية',
  'المباني للاستثمار',
  'أبيار للتطوير',
  'أعيان العقارية',
];

const SERVICES_LIST = [
  'بيع • إيجار • بدل • إدارة أملاك • تسويق عقاري',
  'مقاولات عامة • بناء عوازل • تشطيبات سوبر ديلوكس',
  'تصميم داخلي • ديكورات خشبية • جبس بورد',
  'صيانة تكييف • تمديدات كهربائية • سباكة وصحي',
];

const PROPERTY_TITLES = [
  'شقة فاخرة تشطيب سوبر ديلوكس',
  'فيلا راقية موقع بطن وظهر',
  'بيت حكومي زاوية مجدد بالكامل',
  'أرض فضاء موقع مميز للبدل',
  'دور كامل للإيجار مساحات واسعة',
  'شقة للاستثمار دخل ممتاز',
  'شاليه مميز على البحر مباشرة',
  'مجمع تجاري استثماري دخل مرتفع',
];

const DESCRIPTIONS = [
  'عقار مميز جداً يتمتع بكافة الخدمات وقريب من المسجد والجمعية. تشطيب راقي سوبر ديلوكس ومساحات واسعة جداً تناسب العائلات الكبيرة.',
  'فرصة ممتازة للاستثمار أو السكن الراقي في موقع استراتيجي سهل المدخل والمخرج. يحتوي على مواقف سيارات مظللة وكافة التجهيزات الحديثة.',
  'جاهز للسكن الفوري، تشطيبات ديلوكس حديثة وتوزيع هندسي رائع للغرف والصالات. إطلالة مميزة وتهوية ممتازة.',
];

const PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
];

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing records in correct order to avoid foreign key conflicts
  console.log('🧹 Cleaning old records...');
  await prisma.propertyDeletionLog.deleteMany();
  await prisma.companyRequest.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.property.deleteMany();
  await prisma.reviewRequest.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.officeProfile.deleteMany();
  await prisma.individualProfile.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.user.deleteMany();
  await prisma.area.deleteMany();
  await prisma.governorate.deleteMany();

  // 2. Seed Governorates and Areas
  console.log('🏗️ Seeding Governorates & Areas...');
  for (const gov of GOVERNORATES) {
    await prisma.governorate.create({
      data: {
        id: gov.id,
        name: gov.name,
        areas: {
          createMany: {
            data: gov.areas.map((a) => ({ id: a.id, name: a.name })),
          },
        },
      },
    });
  }

  // Pre-hash password once to optimize performance (bcrypt is computationally expensive)
  console.log('🔑 Pre-hashing password for users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 3. Generate 500 Company Users and Profiles
  console.log('👤 Seeding 500 Company Users & Profiles...');
  const usersData: any[] = [];
  const companyProfilesData: any[] = [];

  // Always seed youssef@youssef.app as the first company for login convenience
  const developerUserId = randomUUID();
  usersData.push({
    id: developerUserId,
    email: 'youssef@youssef.app',
    phone: '+96590000000',
    password: hashedPassword,
    role: Role.COMPANY,
  });

  // Pick all areas to randomly assign to properties and companies
  const allAreas = GOVERNORATES.flatMap((g) =>
    g.areas.map((a) => ({
      govId: g.id,
      govName: g.name,
      areaId: a.id,
      areaName: a.name,
    })),
  );

  const developerArea = allAreas[0];
  const developerCoords = randomCoordinateForArea(developerArea.areaId);

  companyProfilesData.push({
    id: randomUUID(),
    userId: developerUserId,
    name: 'بيوتنا العقارية التطويرية',
    services: 'إدارة أملاك • وساطة عقارية • تقييم عقاري',
    hqLocation: `${developerArea.areaName}، ${developerArea.govName}`,
    serviceAreas: 'جميع مناطق الكويت',
    about:
      'الشركة الرسمية المطورة لمنصة بيوتنا العقارية في دولة الكويت لتقديم الخدمات العقارية المتكاملة.',
    licenseActivity: 'وساطة وتطوير عقاري',
    licenseExpiry: '15 ابريل 2028',
    logoUrl:
      'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80',
    licenseFileUrl: 'https://example.com/license.pdf',
    licenseNumber: 'LIC-DEV-999',
    isVerified: true,
    status: ApprovalStatus.APPROVED,
    latitude: developerCoords.latitude,
    longitude: developerCoords.longitude,
  });

  // Seed the remaining 499 companies
  for (let i = 1; i <= 499; i++) {
    const userId = randomUUID();
    const name = `${COMPANY_NAMES[i % COMPANY_NAMES.length]} ${i}`;
    const category = SERVICES_LIST[i % SERVICES_LIST.length];

    usersData.push({
      id: userId,
      email: `company_${i}@buyootna.com`,
      phone: `+965551${i.toString().padStart(5, '0')}`,
      password: hashedPassword,
      role: Role.COMPANY,
    });

    const companyArea = allAreas[i % allAreas.length];
    const companyCoords = randomCoordinateForArea(companyArea.areaId);

    companyProfilesData.push({
      id: randomUUID(),
      userId,
      name,
      services: category,
      hqLocation: `${companyArea.areaName}، ${companyArea.govName}`,
      serviceAreas: 'جميع المناطق',
      about: `شركة ${name} الرائدة في تقديم الخدمات العقارية والصيانة بجودة واحترافية متناهية في السوق الكويتي.`,
      licenseActivity: 'خدمات عقارية عامة',
      licenseExpiry: '15 ابريل 2027',
      logoUrl: `https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80`,
      licenseFileUrl: 'https://example.com/license.pdf',
      licenseNumber: `LIC-COMP-${100000 + i}`,
      isVerified: i % 2 === 0, // 50% verified
      status: ApprovalStatus.APPROVED, // Approved so they are visible in queries
      latitude: companyCoords.latitude,
      longitude: companyCoords.longitude,
    });
  }

  // Batch insert users and company profiles
  await prisma.user.createMany({ data: usersData });
  await prisma.companyProfile.createMany({ data: companyProfilesData });
  console.log(`✅ Seeded ${usersData.length} company users and profiles.`);

  // companyProfile above is the legacy, pre-multi-identity model -- login and
  // property ownership now resolve through Identity/CompanyIdentityData
  // instead (see prisma/identity.prisma), so without this a seeded company
  // user has zero Identity rows and silently self-heals into a blank
  // INDIVIDUAL identity on first login. Derive one Identity + CompanyIdentityData
  // per seeded company from the profile data already computed above.
  const identitiesData: {
    id: string;
    userId: string;
    type: IdentityType;
    isActive: boolean;
  }[] = [];
  const companyIdentityDataRows: any[] = [];
  const userIdToIdentityId = new Map<string, string>();

  for (const profile of companyProfilesData) {
    const identityId = randomUUID();
    identitiesData.push({
      id: identityId,
      userId: profile.userId,
      type: IdentityType.COMPANY,
      isActive: true,
    });
    companyIdentityDataRows.push({
      id: randomUUID(),
      identityId,
      name: profile.name,
      services: profile.services,
      hqLocation: profile.hqLocation,
      serviceAreas: profile.serviceAreas,
      about: profile.about,
      licenseActivity: profile.licenseActivity,
      licenseNumber: profile.licenseNumber,
      licenseExpiry: profile.licenseExpiry,
      logoUrl: profile.logoUrl,
      licenseFileUrl: profile.licenseFileUrl,
      isVerified: profile.isVerified,
      status: profile.status,
      latitude: profile.latitude,
      longitude: profile.longitude,
    });
    userIdToIdentityId.set(profile.userId, identityId);
  }

  await prisma.identity.createMany({ data: identitiesData });
  await prisma.companyIdentityData.createMany({ data: companyIdentityDataRows });
  console.log(
    `✅ Seeded ${identitiesData.length} COMPANY identities for login/ownership resolution.`,
  );

  // 4. Generate 4500 Properties
  console.log('🏠 Seeding 4500 Properties...');
  const propertiesData: any[] = [];
  const listingTypes: ListingType[] = [
    ListingType.SALE,
    ListingType.RENT,
    ListingType.EXCHANGE,
  ];

  const propertyCategories: PropertyCategory[] = [
    PropertyCategory.APARTMENT,
    PropertyCategory.VILLA,
    PropertyCategory.HOUSE,
    PropertyCategory.LAND,
    PropertyCategory.BUILDING,
    PropertyCategory.COMMERCIAL,
    PropertyCategory.INVESTMENT,
  ];

  for (let i = 1; i <= 4500; i++) {
    // Distribute properties randomly among seeded company users
    const randomUser = usersData[i % usersData.length];
    const randomArea = allAreas[i % allAreas.length];
    const type = listingTypes[i % listingTypes.length];
    const category = propertyCategories[i % propertyCategories.length];
    const companyProfile = companyProfilesData.find(
      (cp) => cp.userId === randomUser.id,
    );
    const companyName = companyProfile
      ? companyProfile.name
      : 'بيوتنا العقارية';

    // Pricing rules depending on ListingType
    let price: number | null = null;
    if (type === ListingType.RENT) {
      price = 250 + (i % 20) * 100; // 250 to 2150 KWD
    } else if (type === ListingType.SALE) {
      price = 45000 + (i % 50) * 15000; // 45,000 to 780,000 KWD
    }

    // Set 90% of listings as ACTIVE and 10% as DRAFT
    const status = i % 10 === 0 ? ListingStatus.DRAFT : ListingStatus.ACTIVE;

    const areaSize = 100 + (i % 15) * 50; // 100 to 800 sqm
    const beds = 1 + (i % 5); // 1 to 5 beds
    const baths = 1 + (i % 4); // 1 to 4 baths

    // Arabic title
    const title = `${PROPERTY_TITLES[i % PROPERTY_TITLES.length]} - ${companyName}`;
    const description = `مساحة ${areaSize}م² - ${DESCRIPTIONS[i % DESCRIPTIONS.length]}`;

    // Select images
    const images = [
      PROPERTY_IMAGES[i % PROPERTY_IMAGES.length],
      PROPERTY_IMAGES[(i + 1) % PROPERTY_IMAGES.length],
    ];

    const { latitude, longitude } = randomCoordinateForArea(randomArea.areaId);

    propertiesData.push({
      id: randomUUID(),
      referenceNumber: 1000000 + i,
      userId: randomUser.id,
      identityId: userIdToIdentityId.get(randomUser.id),
      type,
      category,
      isFeatured: i % 12 === 0, // ~8% featured
      price,
      beds,
      baths,
      location: title,
      description,
      images,
      status,
      isHidden: false,
      governorateId: randomArea.govId,
      areaId: randomArea.areaId,
      areaSize,
      phoneNumber: randomUser.phone,
      views: i % 100, // mock views
      latitude,
      longitude,
    });
  }

  // Batch insert properties in chunks to prevent database payload limit issues (e.g. 250 records per chunk)
  const chunkSize = 250;
  for (let i = 0; i < propertiesData.length; i += chunkSize) {
    const chunk = propertiesData.slice(i, i + chunkSize);
    await prisma.property.createMany({ data: chunk });
    console.log(
      `Uploaded property chunk ${i / chunkSize + 1}/${propertiesData.length / chunkSize}...`,
    );
  }

  console.log(`✅ Seeded ${propertiesData.length} properties.`);

  // 5. Seed Dedicated App Store Reviewer Account
  console.log('🛡️ Seeding Dedicated App Store Reviewer Account...');
  const reviewerUserId = randomUUID();
  await prisma.user.create({
    data: {
      id: reviewerUserId,
      email: 'reviewer@buyootna.com',
      phone: '+96512345678',
      password: hashedPassword,
      role: Role.INDIVIDUAL,
    },
  });

  await prisma.individualProfile.create({
    data: {
      id: randomUUID(),
      userId: reviewerUserId,
    },
  });

  // Legacy individualProfile above isn't what login/the app resolve an
  // active identity from anymore -- see the COMPANY identity comment above.
  await prisma.identity.create({
    data: {
      id: randomUUID(),
      userId: reviewerUserId,
      type: IdentityType.INDIVIDUAL,
      isActive: true,
      individualData: { create: { name: 'App Store Reviewer' } },
    },
  });

  // Connect reviewer to 3 random favorited properties
  const dbProperties = await prisma.property.findMany({
    where: { status: ListingStatus.ACTIVE },
    take: 3,
  });

  for (const prop of dbProperties) {
    await prisma.favorite.create({
      data: {
        userId: reviewerUserId,
        propertyId: prop.id,
      },
    });
  }

  // Seed chat history for reviewer
  if (dbProperties.length > 0) {
    const targetProp = dbProperties[0];
    const sellerId = targetProp.userId;

    const convId = randomUUID();
    const reviewerParticipantId = randomUUID();
    const sellerParticipantId = randomUUID();

    await prisma.conversation.create({
      data: {
        id: convId,
        propertyId: targetProp.id,
        participants: {
          createMany: {
            data: [
              { id: reviewerParticipantId, userId: reviewerUserId },
              { id: sellerParticipantId, userId: sellerId },
            ],
          },
        },
        messages: {
          createMany: {
            data: [
              {
                id: randomUUID(),
                senderId: sellerId,
                type: 'TEXT',
                content: 'مرحباً، هل أنت مهتم بمعاينة العقار الموضح؟',
              },
              {
                id: randomUUID(),
                senderId: reviewerUserId,
                type: 'TEXT',
                content: 'نعم، أود الحصول على مزيد من التفاصيل وموعد المعاينة.',
              },
              {
                id: randomUUID(),
                senderId: sellerId,
                type: 'TEXT',
                content: 'بالتأكيد، يمكننا التنسيق في عطلة نهاية الأسبوع.',
              },
            ],
          },
        },
      },
    });
  }
  console.log(
    '✅ Seeded App Store Reviewer demo account (reviewer@buyootna.com / password123)',
  );

  // 6. Seed Dedicated Individual Test User with Listings
  console.log('👤 Seeding Testing Individual User with listings...');
  const individualUserId = randomUUID();
  await prisma.user.create({
    data: {
      id: individualUserId,
      email: 'individual@buyootna.com',
      phone: '+96599998888',
      password: hashedPassword,
      role: Role.INDIVIDUAL,
    },
  });

  await prisma.individualProfile.create({
    data: {
      id: randomUUID(),
      userId: individualUserId,
    },
  });

  const individualIdentityId = randomUUID();
  await prisma.identity.create({
    data: {
      id: individualIdentityId,
      userId: individualUserId,
      type: IdentityType.INDIVIDUAL,
      isActive: true,
      individualData: { create: { name: 'مستخدم تجريبي' } },
    },
  });

  // Create 5 listings for this individual user
  for (let i = 1; i <= 5; i++) {
    const randomArea = allAreas[(i + 50) % allAreas.length];
    const type = i % 2 === 0 ? ListingType.RENT : ListingType.SALE;
    const category =
      i % 2 === 0 ? PropertyCategory.APARTMENT : PropertyCategory.VILLA;

    const areaSize = 150 + i * 30;
    const price = type === ListingType.RENT ? 400 + i * 50 : 120000 + i * 20000;

    const { latitude, longitude } = randomCoordinateForArea(randomArea.areaId);

    await prisma.property.create({
      data: {
        id: randomUUID(),
        referenceNumber: 2000000 + i,
        userId: individualUserId,
        identityId: individualIdentityId,
        type,
        category,
        isFeatured: i === 2,
        price,
        beds: 3,
        baths: 2,
        location: `بيت للبيع/شقة للإيجار للمالك الشخصي ${i}`,
        description: `مساحة ${areaSize}م² - عقار شخصي مميز معروض مباشرة من المالك للتواصل والمعاينة.`,
        images: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
        ],
        status: ListingStatus.ACTIVE,
        isHidden: false,
        governorateId: randomArea.govId,
        areaId: randomArea.areaId,
        areaSize,
        phoneNumber: '+96599998888',
        views: 12 + i,
        latitude,
        longitude,
      },
    });
  }
  console.log('✅ Seeded individual@buyootna.com with 5 listings.');

  // 6b. Seed demo CompanyRequest rows (leads marketplace) so the company
  // requests list/details screens (wired to real data, no request-creation
  // UI exists yet) have something real to show. Targeted at the developer
  // company (youssef@youssef.app) since that's the account used for company
  // QA throughout dev; individual@buyootna.com is the client.
  const developerCompanyIdentityId = userIdToIdentityId.get(developerUserId)!;
  await prisma.companyRequest.createMany({
    data: [
      {
        clientIdentityId: individualIdentityId,
        targetIdentityId: developerCompanyIdentityId,
        title: 'تشطيب كامل لمحل تجاري',
        category: 'تشطيب و ديكور',
        priceRange: '22,000 - 15,000 د.ك',
        location: 'شمال غرب صليبيخات',
        images: [
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=400&q=80',
        ],
        offerType: 'عرض مخصص',
        description:
          'محل تجاري بمساحة 120م، يحتاج تشطيب كامل وتصميم داخلي عصري.',
        status: RequestStatus.PENDING,
      },
      {
        clientIdentityId: individualIdentityId,
        targetIdentityId: developerCompanyIdentityId,
        title: 'تمديدات كهرباء لمحل تجاري',
        category: 'أعمال كهربائية',
        priceRange: '9,000 - 6,000 د.ك',
        location: 'السالمية',
        offerType: 'عرض مخصص',
        description:
          'محل ملابس بمساحة 120م، يحتاج تمديدات كهربائية كاملة ولوحة توزيع.',
        status: RequestStatus.RESPONDED,
      },
      {
        clientIdentityId: individualIdentityId,
        targetIdentityId: developerCompanyIdentityId,
        acceptedByIdentityId: developerCompanyIdentityId,
        title: 'صيانة تكييف مركزي لمكتب',
        category: 'تكييف وتبريد',
        priceRange: '18,000 - 12,000 د.ك',
        location: 'الجهراء',
        offerType: 'عرض مخصص',
        description:
          'مكتب إداري بمساحة 200م، يحتاج صيانة شاملة لنظام التكييف المركزي.',
        status: RequestStatus.ACCEPTED,
      },
      {
        clientIdentityId: individualIdentityId,
        targetIdentityId: developerCompanyIdentityId,
        title: 'دهانات فيلا سكنية',
        category: 'دهانات',
        priceRange: '5,000 - 3,000 د.ك',
        location: 'الفروانية',
        offerType: 'عرض مخصص',
        description: 'فيلا من طابقين تحتاج دهانات داخلية وخارجية كاملة.',
        status: RequestStatus.REJECTED,
      },
      // Public/marketplace requests -- visible to any company, still open
      {
        clientIdentityId: individualIdentityId,
        title: 'تركيب كاميرات مراقبة لفيلا',
        category: 'أنظمة أمنية',
        priceRange: '45,000 - 30,000 د.ك',
        location: 'الفروانية',
        offerType: 'عرض عام',
        description:
          'فيلا سكنية من طابقين، تحتاج تركيب 8 كاميرات مراقبة خارجية ونظام تسجيل.',
        status: RequestStatus.PENDING,
      },
      {
        clientIdentityId: individualIdentityId,
        acceptedByIdentityId: developerCompanyIdentityId,
        title: 'تصميم حديقة منزلية',
        category: 'تنسيق حدائق',
        priceRange: '3,000 - 1,500 د.ك',
        location: 'مدينة جابر الأحمد',
        offerType: 'عرض عام',
        description: 'حديقة منزلية بمساحة 80م، تحتاج تصميم وتنسيق كامل.',
        status: RequestStatus.ACCEPTED,
      },
    ],
  });
  console.log('✅ Seeded 6 demo CompanyRequest rows.');

  // 7. Seed Dedicated App Store Reviewer Office (مكتب عقاري) Account
  console.log('🏢 Seeding App Store Reviewer Office Account...');
  const officeUserId = randomUUID();
  await prisma.user.create({
    data: {
      id: officeUserId,
      email: 'office.reviewer@buyootna.com',
      phone: '+96512345679',
      password: hashedPassword,
      role: Role.OFFICE,
    },
  });

  const officeArea = allAreas[0];
  await prisma.officeProfile.create({
    data: {
      id: randomUUID(),
      userId: officeUserId,
      name: 'مكتب بيوتنا العقاري - حساب المراجعة',
      services: 'وساطة عقارية • تأجير • إدارة أملاك',
      hqLocation: `${officeArea.areaName}، ${officeArea.govName}`,
      about:
        'مكتب عقاري تجريبي مخصص لمراجعة تطبيق آبل، يعرض كافة ميزات حسابات المكاتب العقارية.',
      licenseActivity: 'وساطة عقارية',
      licenseNumber: 'LIC-REVIEW-OFFICE-001',
      licenseExpiry: '15 ابريل 2028',
      logoUrl:
        'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80',
      licenseFileUrl: 'https://example.com/license.pdf',
      isVerified: true,
      status: ApprovalStatus.APPROVED,
    },
  });

  const officeIdentityId = randomUUID();
  await prisma.identity.create({
    data: {
      id: officeIdentityId,
      userId: officeUserId,
      type: IdentityType.OFFICE,
      isActive: true,
      officeData: {
        create: {
          name: 'مكتب بيوتنا العقاري - حساب المراجعة',
          services: 'وساطة عقارية • تأجير • إدارة أملاك',
          hqLocation: `${officeArea.areaName}، ${officeArea.govName}`,
          about:
            'مكتب عقاري تجريبي مخصص لمراجعة تطبيق آبل، يعرض كافة ميزات حسابات المكاتب العقارية.',
          licenseActivity: 'وساطة عقارية',
          licenseNumber: 'LIC-REVIEW-OFFICE-001',
          licenseExpiry: '15 ابريل 2028',
          logoUrl:
            'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80',
          licenseFileUrl: 'https://example.com/license.pdf',
          isVerified: true,
          status: ApprovalStatus.APPROVED,
        },
      },
    },
  });

  // Give the office a few active listings so reviewers see full functionality
  for (let i = 1; i <= 3; i++) {
    const randomArea = allAreas[(i + 20) % allAreas.length];
    const { latitude, longitude } = randomCoordinateForArea(randomArea.areaId);

    await prisma.property.create({
      data: {
        id: randomUUID(),
        referenceNumber: 2100000 + i,
        userId: officeUserId,
        identityId: officeIdentityId,
        type: i % 2 === 0 ? ListingType.RENT : ListingType.SALE,
        category: PropertyCategory.APARTMENT,
        isFeatured: i === 1,
        price: i % 2 === 0 ? 500 + i * 50 : 95000 + i * 15000,
        beds: 2 + i,
        baths: 2,
        location: `عقار تابع لمكتب المراجعة رقم ${i}`,
        description: 'عقار تجريبي معروض من مكتب عقاري لأغراض مراجعة التطبيق.',
        images: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
        ],
        status: ListingStatus.ACTIVE,
        isHidden: false,
        governorateId: randomArea.govId,
        areaId: randomArea.areaId,
        areaSize: 120 + i * 20,
        phoneNumber: '+96512345679',
        views: 5 + i,
        latitude,
        longitude,
      },
    });
  }

  console.log(
    '✅ Seeded App Store Reviewer office account (office.reviewer@buyootna.com / password123)',
  );

  // --- Seed Plans ---
  console.log('🌱 Seeding subscription plans...');
  const plans = [
    {
      slug: 'regular',
      name: 'العادية',
      price: 3,
      maxActiveAds: 1,
      durationDays: 10,
      maxImagesPerAd: 5,
      featuredDays: 0,
      prioritySearch: false,
      features: [
        'اعلان واحد نشط.',
        'مدة النشر 10 ايام.',
        'حتى 5 صورة للعقار.',
        'ظهور في نتائج البحث.',
        'تواصل مباشر مع المهتمين.',
      ],
      color: '#15304D',
      sortOrder: 1,
    },
    {
      slug: 'silver',
      name: 'الفضية',
      price: 5,
      maxActiveAds: 1,
      durationDays: 45,
      maxImagesPerAd: 10,
      featuredDays: 5,
      prioritySearch: false,
      features: [
        'اعلان واحد نشط.',
        'مدة النشر 45 يوم.',
        'حتى 10 صورة للعقار.',
        'تثبيت 5 ايام في نتائج البحث.',
        'ظهور في نتائج البحث المميزة.',
        'تواصل مباشر مع المهتمين.',
      ],
      color: '#15304D',
      sortOrder: 2,
    },
    {
      slug: 'gold',
      name: 'الذهبية',
      price: 10,
      originalPrice: 20,
      discountText: 'خصم 50%',
      badge: 'موصى به',
      maxActiveAds: 4,
      durationDays: 60,
      maxImagesPerAd: 15,
      featuredDays: 7,
      prioritySearch: true,
      features: [
        '4 اعلانات نشطة في نفس الوقت.',
        'مدة النشر 60 يوم.',
        'حتى 15 صورة للعقار.',
        'تثبيت 7 ايام في نتائج البحث.',
        'اولوية الظهور في البحث الجغرافي.',
      ],
      color: '#15304D',
      sortOrder: 3,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
  }
  console.log('✅ Seeded subscription plans.');

  // --- Seed FAQs ---
  console.log('🌱 Seeding FAQs...');
  const faqs = [
    {
      question: 'ما هو تطبيق بيوتنا؟',
      answer:
        'تطبيق بيوتنا هو منصة عقارية كويتية متخصصة تهدف لتسهيل عملية البحث، البيع، الإيجار، والبدل لمختلف فئات العقارات في الكويت.',
      sortOrder: 1,
    },
    {
      question: 'كيف يمكنني إضافة إعلان جديد؟',
      answer:
        'يمكنك إضافة إعلان بالضغط على زر (+) في القائمة السفلية، ثم ملء تفاصيل العقار كالموقع والمساحة والسعر وإرفاق الصور المطلوبة ونشره مباشرة.',
      sortOrder: 2,
    },
    {
      question: 'هل توجد عمولات على عمليات البيع أو الإيجار؟',
      answer:
        'لا، تطبيق بيوتنا منصة مجانية للإعلان العقاري ولا يتقاضى أي عمولة على الصفقات المبرمة بين البائع والمشتري.',
      sortOrder: 3,
    },
    {
      question: 'ما هي باقات الإعلانات المميزة؟',
      answer:
        'توفر باقات الإعلانات المميزة ظهوراً أكبر لإعلانك في أعلى نتائج البحث وواجهة التطبيق الرئيسية لزيادة فرص الاتصال والمشاهدات.',
      sortOrder: 4,
    },
    {
      question: 'كيف يمكنني التواصل مع صاحب العقار؟',
      answer:
        'يمكنك التواصل مباشرة مع صاحب الإعلان من خلال صفحة تفاصيل العقار بالضغط على أزرار الاتصال الهاتفي، أو الواتساب، أو عبر المحادثة المباشرة المدمجة بالتطبيق.',
      sortOrder: 5,
    },
  ];

  // Clear and insert FAQs to avoid duplicates during repeat runs
  await prisma.fAQ.deleteMany({});
  for (const faq of faqs) {
    await prisma.fAQ.create({
      data: faq,
    });
  }
  console.log('✅ Seeded FAQs.');

  // --- Seed Invoices ---
  console.log('🌱 Seeding invoices...');
  await prisma.invoice.deleteMany({});

  const sampleInvoices = [
    {
      invoiceNo: 'INV-20365',
      planName: 'الباقة الذهبية',
      planDetails: 'باقة 5 اعلانات',
      amount: 100.0,
      status: 'PAID',
      paidAt: new Date('2026-05-05T10:00:00Z'),
      dueDate: null,
      delayDays: null,
      userId: reviewerUserId,
      createdAt: new Date('2026-05-05T09:00:00Z'),
    },
    {
      invoiceNo: 'INV-20366',
      planName: 'الباقة الذهبية',
      planDetails: 'باقة 5 اعلانات',
      amount: 100.0,
      status: 'OVERDUE',
      paidAt: null,
      dueDate: new Date('2026-05-30T23:59:59Z'),
      delayDays: 5,
      userId: reviewerUserId,
      createdAt: new Date('2026-05-15T09:00:00Z'),
    },
    {
      invoiceNo: 'INV-20367',
      planName: 'الباقة الذهبية',
      planDetails: 'باقة 5 اعلانات',
      amount: 100.0,
      status: 'CANCELLED',
      paidAt: null,
      dueDate: new Date('2026-04-30T23:59:59Z'),
      delayDays: null,
      userId: reviewerUserId,
      createdAt: new Date('2026-04-10T09:00:00Z'),
    },
    {
      invoiceNo: 'INV-10111',
      planName: 'الباقة الفضية',
      planDetails: 'باقة 2 اعلانات',
      amount: 50.0,
      status: 'PAID',
      paidAt: new Date('2026-06-01T12:00:00Z'),
      dueDate: null,
      delayDays: null,
      userId: individualUserId,
      createdAt: new Date('2026-06-01T11:00:00Z'),
    },
  ];

  for (const inv of sampleInvoices) {
    await prisma.invoice.create({
      data: {
        invoiceNo: inv.invoiceNo,
        planName: inv.planName,
        planDetails: inv.planDetails,
        amount: inv.amount,
        status: inv.status as any,
        paidAt: inv.paidAt,
        dueDate: inv.dueDate,
        delayDays: inv.delayDays,
        userId: inv.userId,
        createdAt: inv.createdAt,
      },
    });
  }
  console.log('✅ Seeded Invoices.');

  // 7. Seed Dedicated Admin Test Account
  console.log('🛡️ Seeding Dedicated Admin Test Account...');
  const adminUserId = randomUUID();
  await prisma.user.create({
    data: {
      id: adminUserId,
      email: 'admin@buyootna.com',
      phone: '+96512345680',
      password: hashedPassword,
      role: Role.INDIVIDUAL,
      isAdmin: true,
    },
  });

  await prisma.individualProfile.create({
    data: {
      id: randomUUID(),
      userId: adminUserId,
    },
  });

  // Legacy individualProfile above isn't what login/the app resolve an
  // active identity from anymore -- see the COMPANY identity comment above.
  await prisma.identity.create({
    data: {
      id: randomUUID(),
      userId: adminUserId,
      type: IdentityType.INDIVIDUAL,
      isActive: true,
      individualData: { create: { name: 'Admin' } },
    },
  });

  console.log('✅ Seeded Admin account (admin@buyootna.com / password123)');

  console.log('🎉 Seeding process completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
