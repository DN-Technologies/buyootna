import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'youssef@youssef.app';
  console.log(`🌱 Finding user with email: ${email}...`);

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log(`👤 User ${email} not found. Creating user...`);
    user = await prisma.user.create({
      data: {
        email,
        password: 'hashed_password_placeholder',
        role: 'COMPANY',
      },
    });
  }

  console.log(`🧹 Cleaning up existing drafts for user ID: ${user.id}...`);
  await prisma.property.deleteMany({
    where: {
      userId: user.id,
      status: 'DRAFT',
    },
  });

  console.log(`🏗️ Creating 3 test draft properties for user ID: ${user.id}...`);

  // Draft 1: Sale (Apartment in Salmiya)
  const draft1 = await prisma.property.create({
    data: {
      referenceNumber: 2000001,
      userId: user.id,
      type: 'SALE',
      category: 'APARTMENT',
      isFeatured: false,
      price: 150000,
      beds: 3,
      baths: 2,
      location: 'حولي - السالمية',
      description: 'شقة سكنية مميزة معروضة للبيع كمسودة للمعاينة والنشر في السالمية.',
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      ],
      status: 'DRAFT',
      isHidden: false,
      governorateId: 'hawally',
      areaId: 'hawally_2',
      areaSize: 200,
      phoneNumber: '58094586',
    },
  });

  // Draft 2: Rent (Villa in Zahra)
  const draft2 = await prisma.property.create({
    data: {
      referenceNumber: 2000002,
      userId: user.id,
      type: 'RENT',
      category: 'VILLA',
      isFeatured: false,
      price: 850,
      beds: 4,
      baths: 3,
      location: 'حولي - الزهراء',
      description: 'فيلا فاخرة للإيجار الشهري، تشطيب راقي، موقع مميز وهادئ في منطقة الزهراء.',
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      ],
      status: 'DRAFT',
      isHidden: false,
      governorateId: 'hawally',
      areaId: 'hawally_5',
      areaSize: 400,
      phoneNumber: '58094586',
    },
  });

  // Draft 3: Exchange (House in Jaber Al-Ahmed)
  const draft3 = await prisma.property.create({
    data: {
      referenceNumber: 2000003,
      userId: user.id,
      type: 'EXCHANGE',
      category: 'HOUSE',
      isFeatured: false,
      requestYear: 2003,
      requiredYear: 2012,
      location: 'العاصمة - مدينة جابر الأحمد',
      description: 'طلب بدل أرض فضاء في مدينة جابر الأحمد مع طلب إسكاني قديم.',
      images: [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
      ],
      status: 'DRAFT',
      isHidden: false,
      governorateId: 'capital',
      areaId: 'capital_1',
      areaSize: 400,
      phoneNumber: '58094586',
    },
  });

  console.log(`✅ Seeded 3 draft properties successfully:`);
  console.log(` - Draft 1 (SALE): ${draft1.id}`);
  console.log(` - Draft 2 (RENT): ${draft2.id}`);
  console.log(` - Draft 3 (EXCHANGE): ${draft3.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding drafts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
