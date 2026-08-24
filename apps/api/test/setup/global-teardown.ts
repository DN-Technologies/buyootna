import { stopTestDatabase } from './db-container';

export default async function globalTeardown(): Promise<void> {
  const db = globalThis.__TEST_DB__;
  if (db) {
    await stopTestDatabase(db);
  }
}
