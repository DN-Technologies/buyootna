import {
  PrismaClient,
  ListingType,
  PropertyCategory,
  ListingStatus,
  Role,
  ApprovalStatus,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const GOVERNORATES = [
  {
    id: 'capital',
    name: 'العاصمة',
    areas: [
      { id: 'capital_1', name: 'الشرق' },
      { id: 'capital_2', name: 'القبلة' },
      { id: 'capital_3', name: 'المرقاب' },
      { id: 'capital_4', name: 'بنيد القار' },
      { id: 'capital_5', name: 'الدسمة' },
      { id: 'capital_6', name: 'الدعية' },
    ],
  },
  {
    id: 'hawally',
    name: 'حولي',
    areas: [
      { id: 'hawally_1', name: 'السالمية' },
      { id: 'hawally_2', name: 'حولي' },
      { id: 'hawally_3', name: 'الشعب' },
      { id: 'hawally_4', name: 'الجابرية' },
      { id: 'hawally_5', name: 'الرميثية' },
      { id: 'hawally_6', name: 'سلوى' },
      { id: 'hawally_7', name: 'بيان' },
      { id: 'hawally_8', name: 'مشرف' },
    ],
  },
  {
    id: 'farwaniya',
    name: 'الفروانية',
    areas: [
      { id: 'farwaniya_1', name: 'الفروانية' },
      { id: 'farwaniya_2', name: 'خيطان' },
      { id: 'farwaniya_3', name: 'الأندلس' },
      { id: 'farwaniya_4', name: 'جليب الشيوخ' },
      { id: 'farwaniya_5', name: 'الرقعي' },
      { id: 'farwaniya_6', name: 'العارضية' },
    ],
  },
  {
    id: 'ahmadi',
    name: 'الأحمدي',
    areas: [
      { id: 'ahmadi_1', name: 'الفنطاس' },
      { id: 'ahmadi_2', name: 'العقيلة' },
      { id: 'ahmadi_3', name: 'المنقف' },
      { id: 'ahmadi_4', name: 'أبو حليفة' },
      { id: 'ahmadi_5', name: 'الفحيحيل' },
      { id: 'ahmadi_6', name: 'المهبولة' },
      { id: 'ahmadi_7', name: 'الرقة' },
      { id: 'ahmadi_8', name: 'الصباحية' },
    ],
  },
  {
    id: 'jahra',
    name: 'الجهراء',
    areas: [
      { id: 'jahra_1', name: 'الجهراء' },
      { id: 'jahra_2', name: 'النسيم' },
      { id: 'jahra_3', name: 'تيماء' },
      { id: 'jahra_4', name: 'الواحة' },
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

  // 3. Generate 200 Company Users and Profiles
  console.log('👤 Seeding 200 Company Users & Profiles...');
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

  companyProfilesData.push({
    id: randomUUID(),
    userId: developerUserId,
    name: 'بيوتنا العقارية التطويرية',
    services: 'إدارة أملاك • وساطة عقارية • تقييم عقاري',
    hqLocation: 'مدينة الكويت، العاصمة',
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
  });

  // Seed the remaining 199 companies
  for (let i = 1; i <= 199; i++) {
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

    companyProfilesData.push({
      id: randomUUID(),
      userId,
      name,
      services: category,
      hqLocation: 'مدينة الكويت',
      serviceAreas: 'جميع المناطق',
      about: `شركة ${name} الرائدة في تقديم الخدمات العقارية والصيانة بجودة واحترافية متناهية في السوق الكويتي.`,
      licenseActivity: 'خدمات عقارية عامة',
      licenseExpiry: '15 ابريل 2027',
      logoUrl: `https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80`,
      licenseFileUrl: 'https://example.com/license.pdf',
      licenseNumber: `LIC-COMP-${100000 + i}`,
      isVerified: i % 2 === 0, // 50% verified
      status: ApprovalStatus.APPROVED, // Approved so they are visible in queries
    });
  }

  // Batch insert users and company profiles
  await prisma.user.createMany({ data: usersData });
  await prisma.companyProfile.createMany({ data: companyProfilesData });
  console.log(`✅ Seeded ${usersData.length} company users and profiles.`);

  // 4. Generate 1000 Properties
  console.log('🏠 Seeding 1000 Properties...');
  const propertiesData: any[] = [];
  const listingTypes: ListingType[] = [
    ListingType.SALE,
    ListingType.RENT,
    ListingType.EXCHANGE,
  ];

  // Pick all areas to randomly assign to properties
  const allAreas = GOVERNORATES.flatMap((g) =>
    g.areas.map((a) => ({ govId: g.id, areaId: a.id })),
  );

  const propertyCategories: PropertyCategory[] = [
    PropertyCategory.APARTMENT,
    PropertyCategory.VILLA,
    PropertyCategory.HOUSE,
    PropertyCategory.LAND,
    PropertyCategory.BUILDING,
    PropertyCategory.COMMERCIAL,
    PropertyCategory.INVESTMENT,
  ];

  for (let i = 1; i <= 1000; i++) {
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

    propertiesData.push({
      id: randomUUID(),
      userId: randomUser.id,
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
