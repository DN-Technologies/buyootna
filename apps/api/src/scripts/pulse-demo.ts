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
 *   pnpm --filter api pulse:demo studio              my company (or office): past stories in its
 *                                                    archive (1, 3, 8 and 20 days ago), and two
 *                                                    highlights, one keeping a 40-day-old story
 *   pnpm --filter api pulse:demo clear               removes everything it added
 *
 * On the production server (deliberately, removed again with clear), inside
 * the API container, with the account named:
 *
 *   docker compose run --rm api node dist/src/scripts/pulse-demo.js all --email you@example.com --production
 *   (then company, office, studio the same way; clear --production removes them)
 *
 * The account: --email <email>, or the only individual profile in the
 * database. Each case replaces its own earlier rows, so it can be re-run;
 * pull to refresh (or leave and come back to) the home to see it. For the
 * company and office, double-tap your photo and switch to the new profile.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import {
  DEMO_COMMANDS,
  DemoCommand,
  runPulseDemo,
} from '../core/demo-data/pulse-demo';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1'];

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

/**
 * Local databases only, unless --production is passed together with
 * --email (production has many accounts): then it says loudly where it
 * writes. Demo rows there are seen by real users until `clear`.
 */
function assertTarget(url: string | undefined): string {
  if (!url) throw new Error('DATABASE_URL is not set (apps/api/.env).');
  const host = new URL(url).hostname;
  if (LOCAL_HOSTS.includes(host)) return host;
  if (!process.argv.includes('--production')) {
    throw new Error(
      `Refusing to write demo data to "${host}": local databases only (${LOCAL_HOSTS.join(', ')}). Add --production --email <email> to do it on purpose.`,
    );
  }
  if (!arg('email')) {
    throw new Error('--production needs --email <the account to fill>.');
  }
  console.log(
    `⚠ PRODUCTION database "${host}": demo rows are visible to real users until "clear --production".`,
  );
  return host;
}

async function main() {
  const what = process.argv[2];
  if (!what || !DEMO_COMMANDS.includes(what)) {
    console.log(
      `Usage: pnpm --filter api pulse:demo <${DEMO_COMMANDS.join(' | ')}> [--email <email>] [--days N] [--production]`,
    );
    process.exit(1);
  }
  assertTarget(process.env.DATABASE_URL);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  try {
    const days = arg('days');
    const lines = await runPulseDemo(prisma, what as DemoCommand, {
      email: arg('email'),
      days: days === undefined ? undefined : Number(days),
    });
    for (const line of lines) console.log(line);
    if (what !== 'clear')
      console.log('Undo: pnpm --filter api pulse:demo clear');
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e: Error) => {
  console.error(`✗ ${e.message}`);
  process.exit(1);
});
