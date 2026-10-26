/**
 * Sets a testing-portal password from the server: LOGIN (signs testers in)
 * or DANGER (asked again before wiping the database). The password is
 * typed at a hidden prompt -- never passed as an argument, where it would
 * land in shell history and the process list.
 *
 *   local:      pnpm --filter api testing:set-password LOGIN
 *   production: docker compose run --rm api node dist/src/scripts/testing-set-password.js LOGIN
 */
import 'dotenv/config';
import { PrismaClient, TestingCredentialKind } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';
import { TESTING_PASSWORD_MIN_LENGTH } from '../features/testing-portal/testing-portal.constants';

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
    // Echo nothing while the password is typed
    const output = rl as unknown as { _writeToOutput: (s: string) => void };
    let prompted = false;
    output._writeToOutput = (s: string) => {
      if (!prompted) {
        process.stdout.write(s);
        prompted = true;
      }
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
  });
}

async function main() {
  const kind = process.argv[2]?.toUpperCase() as
    TestingCredentialKind | undefined;
  if (!kind || !Object.values(TestingCredentialKind).includes(kind)) {
    console.error(
      `Usage: testing-set-password <${Object.values(TestingCredentialKind).join('|')}>`,
    );
    process.exit(1);
  }
  if (!process.stdin.isTTY) {
    console.error('Run this in an interactive terminal (hidden prompt).');
    process.exit(1);
  }

  const password = await askHidden(`New ${kind} password: `);
  const confirm = await askHidden('Repeat it: ');
  if (password !== confirm) {
    console.error('The two entries differ; nothing changed.');
    process.exit(1);
  }
  if (password.length < TESTING_PASSWORD_MIN_LENGTH || password.length > 128) {
    console.error(
      `Use ${TESTING_PASSWORD_MIN_LENGTH}-128 characters; nothing changed.`,
    );
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.testingCredential.upsert({
      where: { kind },
      create: { kind, passwordHash, updatedBy: 'server script' },
      update: { passwordHash, updatedBy: 'server script' },
    });
    console.log(
      kind === TestingCredentialKind.LOGIN
        ? 'Testing portal password set. Everyone signed in must sign in again.'
        : 'Danger password set.',
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

void main();
