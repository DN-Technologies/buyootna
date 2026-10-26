/**
 * Resets a local database to the dev fixtures (src/core/demo-data/dev-seed.ts),
 * admin@buyootna.com included; every account's password is password123.
 *
 *   pnpm --filter api seed
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { runDevSeed } from '../../src/core/demo-data/dev-seed';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

runDevSeed(prisma, { password: 'password123', includeAdmin: true })
  .then(() => console.log('✅ Accounts sign in with password123'))
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
