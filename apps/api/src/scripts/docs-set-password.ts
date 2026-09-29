/**
 * Sets a docs-portal role password from the server, e.g. the first ADMIN
 * password on a fresh environment. The password is typed at a hidden
 * prompt -- never passed as an argument, where it would land in shell
 * history and the process list.
 *
 *   local:      pnpm --filter api docs:set-password ADMIN
 *   production: docker compose run --rm api node dist/src/scripts/docs-set-password.js ADMIN
 */
import 'dotenv/config';
import { DocsRole, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';
import { DOCS_PASSWORD_MIN_LENGTH } from '../features/docs-portal/docs-portal.constants';

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
  const role = process.argv[2]?.toUpperCase() as DocsRole | undefined;
  if (!role || !Object.values(DocsRole).includes(role)) {
    console.error(
      `Usage: docs-set-password <${Object.values(DocsRole).join('|')}>`,
    );
    process.exit(1);
  }
  if (!process.stdin.isTTY) {
    console.error('Run this in an interactive terminal (hidden prompt).');
    process.exit(1);
  }

  const password = await askHidden(`New password for ${role}: `);
  const confirm = await askHidden('Repeat it: ');
  if (password !== confirm) {
    console.error('The two entries differ; nothing changed.');
    process.exit(1);
  }
  if (password.length < DOCS_PASSWORD_MIN_LENGTH || password.length > 128) {
    console.error(
      `Use ${DOCS_PASSWORD_MIN_LENGTH}-128 characters; nothing changed.`,
    );
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.docsRoleCredential.upsert({
      where: { role },
      create: { role, passwordHash, updatedBy: 'server script' },
      update: { passwordHash, updatedBy: 'server script' },
    });
    console.log(
      `Password for ${role} set. Anyone signed in as ${role} must sign in again.`,
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

void main();
