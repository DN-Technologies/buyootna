import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const properties = await prisma.property.findMany({
    where: { status: 'DRAFT' },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  console.log('NEWEST 5 DRAFT PROPERTIES:');
  console.dir(properties, { depth: null });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
