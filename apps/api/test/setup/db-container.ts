import { execFileSync } from 'child_process';
import * as path from 'path';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

// Reused by both the Jest e2e globalSetup (this package) and the mobile
// Maestro orchestration script, which needs the exact same "fresh isolated
// Postgres, migrated from scratch" primitive to run a local API instance
// against — see the plan's Part B.

const API_ROOT = path.resolve(__dirname, '..', '..');

export interface TestDatabase {
  container: StartedPostgreSqlContainer;
  connectionUri: string;
}

declare global {
  // Shared between global-setup.ts and global-teardown.ts, which Jest runs
  // in the same orchestrator process (unlike test files, which run in
  // spawned workers) — attaching to globalThis is the standard way to pass
  // a live handle between the two.
  var __TEST_DB__: TestDatabase | undefined;
}

/**
 * Starts an ephemeral Postgres container and returns its connection URI.
 * Caller is responsible for calling `stopTestDatabase` when done.
 */
export async function startTestDatabase(): Promise<TestDatabase> {
  const container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('buyootna_test')
    .withUsername('test')
    .withPassword('test')
    .start();

  return { container, connectionUri: container.getConnectionUri() };
}

/** Applies the full committed migration history to the given database. */
export function applyMigrations(connectionUri: string): void {
  execFileSync('npx', ['prisma', 'migrate', 'deploy', '--schema=prisma'], {
    cwd: API_ROOT,
    env: { ...process.env, DATABASE_URL: connectionUri },
    stdio: 'inherit',
  });
}

export async function stopTestDatabase(db: TestDatabase): Promise<void> {
  await db.container.stop();
}
