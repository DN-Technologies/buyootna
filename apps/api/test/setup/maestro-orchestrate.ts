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
const SEED_EMAIL = 'maestro-e2e@buyootna.test';
const SEED_PASSWORD = 'MaestroE2E123!';

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

async function seedLoginUser(): Promise<void> {
  const res = await fetch(
    `http://localhost:${PORT}/users/register/individual`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Maestro Seed User',
        identifier: SEED_EMAIL,
        password: SEED_PASSWORD,
      }),
    },
  );
  if (res.status !== 201) {
    const body = await res.text();
    throw new Error(`Failed to seed login user: ${res.status} ${body}`);
  }
  console.log(`[orchestrate] Seeded login user ${SEED_EMAIL}`);
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

    await seedLoginUser();

    console.log('[orchestrate] Running Maestro flows...');
    const maestroEnv = {
      ...process.env,
      PATH: `${process.env.PATH}:${process.env.HOME}/.maestro/bin`,
      MAESTRO_CLI_NO_ANALYTICS: '1',
      MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED: 'true',
      SEED_EMAIL,
      SEED_PASSWORD,
    };
    exitCode = await new Promise<number>((resolve) => {
      const maestro = spawn(
        'maestro',
        [
          'test',
          '.maestro/',
          '-e',
          `SEED_EMAIL=${SEED_EMAIL}`,
          '-e',
          `SEED_PASSWORD=${SEED_PASSWORD}`,
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
