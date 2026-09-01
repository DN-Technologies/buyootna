import { spawn, execSync, ChildProcess } from 'child_process';
import * as path from 'path';
import {
  startTestDatabase,
  applyMigrations,
  stopTestDatabase,
  TestDatabase,
} from './db-container';

// Orchestrates a real API instance (pointed at a fresh, isolated
// testcontainers Postgres) on localhost:8000 — the host/port the mobile app
// already expects in dev — so the Maestro flows under apps/mobile/.maestro
// exercise the real app against a real backend without ever touching the
// shared Neon dev database. See the plan's Part B.

const API_ROOT = path.resolve(__dirname, '..', '..');
const MOBILE_ROOT = path.resolve(API_ROOT, '..', 'mobile');
const PORT = 8000;
// A valid Kuwait mobile number per isPhone()'s regex — [569]\d{7}. Phone
// identifiers create the User+Identity row synchronously and have no
// login-time verification gate (see AuthService.validateUser), unlike email
// identifiers, which stay pending until an OTP is verified — so this is the
// only identifier type a black-box orchestration script (running in a
// separate process from the API, with no access to its in-memory OTP
// stores or a debug endpoint for phone OTPs) can use to seed an
// already-loggable-in account in a single call.
const SEED_PHONE = '56789012';
const SEED_PASSWORD = 'MaestroE2E123!';
const COMPANY_A_NAME = 'QA Company Alpha';
const COMPANY_B_NAME = 'QA Company Beta';

function killPort(port: number): void {
  try {
    const pids = execSync(`lsof -ti tcp:${port}`).toString().trim();
    if (pids) {
      console.log(
        `[orchestrate] Port ${port} is occupied by PID(s) ${pids.replace(/\n/g, ', ')} — stopping so this run can bind it.`,
      );
      execSync(`kill -9 ${pids.split('\n').join(' ')}`);
    }
  } catch {
    // lsof exits non-zero when nothing is listening — nothing to kill.
  }
}

async function waitForApi(url: string, timeoutMs: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`API did not become ready at ${url} within ${timeoutMs}ms`);
}

/** Registers the individual account the chat-isolation flow logs in as. Returns its User.id. */
async function seedLoginUser(): Promise<string> {
  const res = await fetch(
    `http://localhost:${PORT}/users/register/individual`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Maestro Seed User',
        identifier: SEED_PHONE,
        password: SEED_PASSWORD,
      }),
    },
  );
  if (res.status !== 201) {
    const body = await res.text();
    throw new Error(`Failed to seed login user: ${res.status} ${body}`);
  }
  const body = (await res.json()) as { user: { id: string } };
  console.log(`[orchestrate] Seeded login user ${SEED_PHONE}`);
  return body.user.id;
}

/**
 * Registers a company account — no OTP gate at all (see
 * UsersRegistrationService.registerCompany), so this alone is enough to
 * seed an "other party" identity for a conversation. Returns its User.id.
 */
async function seedCompany(name: string, licenseNumber: string): Promise<string> {
  const form = new FormData();
  form.set('name', name);
  form.set('email', `${licenseNumber.toLowerCase()}@buyootna.test`);
  form.set('password', 'CompanySeed123!');
  form.set('licenseNumber', licenseNumber);

  const res = await fetch(`http://localhost:${PORT}/users/register/company`, {
    method: 'POST',
    body: form,
  });
  if (res.status !== 201) {
    const body = await res.text();
    throw new Error(`Failed to seed company "${name}": ${res.status} ${body}`);
  }
  const body = (await res.json()) as { user: { id: string } };
  console.log(`[orchestrate] Seeded company "${name}"`);
  return body.user.id;
}

/**
 * Seeds two conversations — one between the individual and each company —
 * each with one message already sent by the company. This is what the
 * chat-conversation-isolation flow needs precondition-wise ("the user has
 * initiated chat sessions with at least two different companies"):
 * getConversations() only lists conversations that already have at least
 * one message. There's no REST endpoint for sending a message (only the
 * chat socket gateway persists messages), so this writes directly via
 * Prisma — the same driver-adapter setup PrismaService uses in the app
 * itself (see apps/api/src/core/prisma/prisma.service.ts).
 */
async function seedConversations(
  databaseUrl: string,
  individualUserId: string,
  companyAUserId: string,
  companyBUserId: string,
): Promise<void> {
  // Imported lazily so this file only pulls in the generated Prisma client
  // (and pg) once the migrations that produce it have actually run.
  const { PrismaClient } = await import('@prisma/client');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  const { Pool } = await import('pg');

  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const individualIdentity = await prisma.identity.findFirstOrThrow({
      where: { userId: individualUserId, type: 'INDIVIDUAL' },
    });

    const seedOneConversation = async (
      companyUserId: string,
      companyName: string,
      messageContent: string,
    ) => {
      const companyIdentity = await prisma.identity.findFirstOrThrow({
        where: { userId: companyUserId, type: 'COMPANY' },
      });

      const conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [
              { userId: individualUserId, identityId: individualIdentity.id },
              { userId: null, identityId: companyIdentity.id },
            ],
          },
        },
      });

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          type: 'TEXT',
          content: messageContent,
          senderId: null,
          senderIdentityId: companyIdentity.id,
        },
      });

      console.log(
        `[orchestrate] Seeded conversation with "${companyName}" (${conversation.id})`,
      );
    };

    await seedOneConversation(
      companyAUserId,
      COMPANY_A_NAME,
      'مرحباً، كيف يمكننا مساعدتك؟',
    );
    await seedOneConversation(
      companyBUserId,
      COMPANY_B_NAME,
      'أهلاً بك، هل لديك أي استفسار؟',
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

function startApi(databaseUrl: string): ChildProcess {
  const child = spawn('npx', ['nest', 'start'], {
    cwd: API_ROOT,
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      PORT: String(PORT),
      // Force TwilioService's mock-OTP mode regardless of whatever real
      // credentials apps/api/.env currently has — same reasoning as the
      // Jest e2e globalSetup in Part A.
      TWILIO_ACCOUNT_SID: '',
      TWILIO_AUTH_TOKEN: '',
      TWILIO_VERIFY_SERVICE_SID: '',
      // Same reasoning, for MailService — force mock-mail mode so signup
      // emails never hit the real Resend API.
      RESEND_API_KEY: '',
      // Disable OTP cooldown for end-to-end Maestro automated flows.
      OTP_REQUEST_COOLDOWN_SECONDS: '0',
      OTP_MAX_REQUESTS_PER_HOUR: '1000',
    },
    stdio: 'inherit',
  });
  return child;
}

async function main(): Promise<void> {
  let db: TestDatabase | undefined;
  let api: ChildProcess | undefined;
  let exitCode = 1;

  try {
    killPort(PORT);

    console.log('[orchestrate] Starting ephemeral Postgres container...');
    db = await startTestDatabase();
    console.log('[orchestrate] Applying migrations...');
    applyMigrations(db.connectionUri);

    console.log('[orchestrate] Starting API on port', PORT, '...');
    api = startApi(db.connectionUri);

    // A cold `nest start` build (no ts-node/webpack cache) has been observed
    // taking well over 60s locally — give it real headroom rather than
    // failing the whole run on a slow first compile.
    await waitForApi(`http://localhost:${PORT}/api/docs`, 120_000);
    console.log('[orchestrate] API is ready.');

    const individualUserId = await seedLoginUser();
    const companyAUserId = await seedCompany(COMPANY_A_NAME, 'QA-LIC-A-001');
    const companyBUserId = await seedCompany(COMPANY_B_NAME, 'QA-LIC-B-002');
    await seedConversations(
      db.connectionUri,
      individualUserId,
      companyAUserId,
      companyBUserId,
    );

    console.log('[orchestrate] Running Maestro flows...');
    const maestroEnv = {
      ...process.env,
      PATH: `${process.env.PATH}:${process.env.HOME}/.maestro/bin`,
      MAESTRO_CLI_NO_ANALYTICS: '1',
      MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED: 'true',
      SEED_PHONE,
      SEED_PASSWORD,
      COMPANY_A_NAME,
      COMPANY_B_NAME,
    };
    exitCode = await new Promise<number>((resolve) => {
      const maestro = spawn(
        'maestro',
        [
          'test',
          '.maestro/',
          '-e',
          `SEED_PHONE=${SEED_PHONE}`,
          '-e',
          `SEED_PASSWORD=${SEED_PASSWORD}`,
          '-e',
          `COMPANY_A_NAME=${COMPANY_A_NAME}`,
          '-e',
          `COMPANY_B_NAME=${COMPANY_B_NAME}`,
        ],
        { cwd: MOBILE_ROOT, env: maestroEnv, stdio: 'inherit' },
      );
      maestro.on('exit', (code) => resolve(code ?? 1));
    });
  } finally {
    if (api) {
      console.log('[orchestrate] Stopping API...');
      api.kill('SIGTERM');
    }
    if (db) {
      console.log('[orchestrate] Stopping test database container...');
      await stopTestDatabase(db);
    }
  }

  process.exit(exitCode);
}

main().catch((err) => {
  console.error('[orchestrate] Fatal error:', err);
  process.exit(1);
});
