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

  console.log(`🏗️ Creating draft property for user ID: ${user.id}...`);

  // Create a sample draft property matching the mockup styling
  const draftProperty = await prisma.property.create({
    data: {
      userId: user.id,
      type: 'SALE',
      category: 'RESIDENTIAL',
      isFeatured: false,
      price: 150000,
      beds: 3,
      baths: 2,
      location: 'السالمية، الكويت',
      description: 'شقة سكنية مميزة معروضة للبيع كمسودة للمعاينة والنشر.',
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      ],
      status: 'DRAFT',
      isHidden: false,
    },
  });

  console.log(`✅ Seeded draft property successfully:`, draftProperty);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding draft:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
