import { applyMigrations, startTestDatabase } from './db-container';

export default async function globalSetup(): Promise<void> {
  const db = await startTestDatabase();
  applyMigrations(db.connectionUri);

  // Must be set before any test-worker process (spawned after this
  // completes) compiles a Nest testing module — PrismaService reads
  // process.env.DATABASE_URL directly in its constructor with no DI
  // override seam.
  process.env.DATABASE_URL = db.connectionUri;

  // Force TwilioService into deterministic mock-OTP mode regardless of
  // whatever real credentials apps/api/.env currently holds. Assigning
  // empty strings (rather than deleting the keys) matters: dotenv.config()
  // calls made later inside spawned test-worker processes only fill in
  // keys that are NOT already present in process.env, so a present-but-
  // empty value survives untouched, while a deleted key would just get
  // silently repopulated from .env in the child process.
  process.env.TWILIO_ACCOUNT_SID = '';
  process.env.TWILIO_AUTH_TOKEN = '';
  process.env.TWILIO_VERIFY_SERVICE_SID = '';

  // Same reasoning, for MailService — force mock-mail mode so registration
  // OTP emails never hit the real Resend API (which rejects @example.com
  // test addresses outright) and the OTP is readable from the in-memory
  // pending store instead.
  process.env.RESEND_API_KEY = '';

  // Disable OTP cooldown and expand hourly rate limits in e2e tests so rapid assertions
  // against the test endpoints don't get throttled with 429
  process.env.OTP_REQUEST_COOLDOWN_SECONDS = '0';
  process.env.OTP_MAX_REQUESTS_PER_HOUR = '1000';

  globalThis.__TEST_DB__ = db;
}
