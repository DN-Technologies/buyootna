import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'youssef@youssef.app';
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log(`User ${email} not found.`);
    return;
  }

  console.log(`Updating all draft properties for user ID: ${user.id}...`);

  const result = await prisma.property.updateMany({
    where: {
      userId: user.id,
      status: 'DRAFT',
    },
    data: {
      governorateId: 'hawally',
      areaId: 'hawally_2',
      areaSize: 200,
      phoneNumber: '58094586',
    },
  });

  console.log(`Successfully updated ${result.count} draft properties!`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
