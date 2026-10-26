import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import { createWriteStream } from 'fs';
import { rm, stat } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { pipeline } from 'stream/promises';
import { runDevSeed } from '../../core/demo-data/dev-seed';
import { PrismaService } from '../../core/prisma/prisma.service';
import { StorageService } from '../../core/storage/storage.service';
import { DocsLoginLimiterService } from '../docs-portal/docs-login-limiter.service';
import { TestingAuditService } from './testing-audit.service';
import type { TestingUser } from './testing-portal.constants';
import { TestingPortalService } from './testing-portal.service';

/** Typed in the wipe dialog, GitHub-style. */
export const WIPE_CONFIRM = 'buyootna-production';

// Kept by a wipe: the migration history and the portal's own tables
// (its passwords, its audit log and the bug reports), so the portal still
// works and shows who wiped
const isKept = (table: string) =>
  table === '_prisma_migrations' || table.startsWith('Testing');

const MAX_LINES = 200;

export interface DatabaseJob {
  id: string;
  kind: 'wipe' | 'seed';
  state: 'running' | 'done' | 'failed';
  actorName: string;
  startedAt: string;
  finishedAt: string | null;
  lines: string[];
  error: string | null;
  backupKey: string | null;
  backupBytes: number | null;
}

interface Actor {
  tester: TestingUser;
  ip?: string;
}

/** pg_dump's connection settings from DATABASE_URL, password in the env (not argv). */
export function pgEnv(databaseUrl: string): NodeJS.ProcessEnv {
  const url = new URL(databaseUrl);
  const sslmode = url.searchParams.get('sslmode');
  return {
    PGHOST: url.hostname,
    PGPORT: url.port || '5432',
    PGUSER: decodeURIComponent(url.username),
    PGPASSWORD: decodeURIComponent(url.password),
    PGDATABASE: decodeURIComponent(url.pathname.replace(/^\//, '')),
    ...(sslmode ? { PGSSLMODE: sslmode } : {}),
  };
}

/**
 * The database danger zone: wipe all data (after a pg_dump to S3, which
 * must succeed first — no backup, no wipe) and seed the dev fixtures into
 * an empty database. Each runs as one background job at a time that the
 * portal follows line by line.
 */
@Injectable()
export class TestingDatabaseService {
  private readonly logger = new Logger(TestingDatabaseService.name);
  private job: DatabaseJob | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly portal: TestingPortalService,
    private readonly limiter: DocsLoginLimiterService,
    private readonly audit: TestingAuditService,
  ) {}

  private async tables(): Promise<string[]> {
    const rows = await this.prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables WHERE schemaname = current_schema()`;
    return rows.map((r) => r.tablename);
  }

  async overview() {
    const tables = (await this.tables()).filter((t) => !isKept(t));
    const [users, rows] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.$queryRaw<{ total: bigint | null }[]>`
        SELECT sum(n_live_tup)::bigint AS total FROM pg_stat_user_tables
        WHERE schemaname = current_schema()
          AND relname <> '_prisma_migrations' AND relname NOT LIKE 'Testing%'`,
    ]);
    return {
      confirmPhrase: WIPE_CONFIRM,
      environment: process.env.NODE_ENV ?? 'development',
      users,
      tables: tables.length,
      approxRows: Number(rows[0]?.total ?? 0),
      job: this.job,
    };
  }

  private async assertDangerPassword(password: string, { tester, ip }: Actor) {
    const key = `${ip ?? 'unknown'}:testing-danger`;
    this.limiter.assertAllowed(key);
    if (!(await this.portal.checkDangerPassword(password))) {
      this.limiter.recordFailure(key);
      await this.audit.record({
        actorName: tester.name,
        action: 'DANGER_PASSWORD_WRONG',
        ip,
      });
      // 403, not 401: the tester is signed in, so the portal mustn't sign them out
      throw new ForbiddenException('كلمة مرور الخطر غير صحيحة');
    }
    this.limiter.reset(key);
  }

  private start(kind: DatabaseJob['kind'], actorName: string): DatabaseJob {
    if (this.job?.state === 'running') {
      throw new ConflictException('عملية أخرى على قاعدة البيانات قيد التنفيذ');
    }
    this.job = {
      id: randomUUID(),
      kind,
      state: 'running',
      actorName,
      startedAt: new Date().toISOString(),
      finishedAt: null,
      lines: [],
      error: null,
      backupKey: null,
      backupBytes: null,
    };
    return this.job;
  }

  private line(job: DatabaseJob, text: string) {
    job.lines.push(text);
    if (job.lines.length > MAX_LINES)
      job.lines.splice(0, job.lines.length - MAX_LINES);
  }

  private async run(job: DatabaseJob, work: () => Promise<void>) {
    try {
      await work();
      job.state = 'done';
    } catch (error) {
      job.state = 'failed';
      job.error = error instanceof Error ? error.message : String(error);
      this.line(job, `✗ ${job.error}`);
      this.logger.error(`Database ${job.kind} failed: ${job.error}`);
    } finally {
      job.finishedAt = new Date().toISOString();
    }
  }

  async wipe(confirm: string, dangerPassword: string, actor: Actor) {
    if (confirm !== WIPE_CONFIRM) {
      throw new BadRequestException(`اكتب ${WIPE_CONFIRM} للتأكيد`);
    }
    await this.assertDangerPassword(dangerPassword, actor);
    const job = this.start('wipe', actor.tester.name);
    await this.audit.record({
      actorName: actor.tester.name,
      action: 'DATABASE_WIPE_STARTED',
      ip: actor.ip,
    });
    void this.run(job, async () => {
      const backup = await this.backup(job);
      const tables = (await this.tables()).filter((t) => !isKept(t));
      this.line(job, `Emptying ${tables.length} tables...`);
      // No CASCADE: if a kept table referenced one of these, this fails
      // instead of emptying the kept table too
      await this.prisma.$executeRawUnsafe(
        `TRUNCATE TABLE ${tables.map((t) => `"${t.replace(/"/g, '""')}"`).join(', ')} RESTART IDENTITY`,
      );
      this.line(
        job,
        '✓ All data deleted (migrations, portal passwords, audit log and bug reports kept)',
      );
      await this.audit.record({
        actorName: actor.tester.name,
        action: 'DATABASE_WIPED',
        target: backup.key,
        metadata: { backupBytes: backup.bytes, tables: tables.length },
        ip: actor.ip,
      });
    });
    return job;
  }

  /** pg_dump (custom format) to a temp file, then to S3; throws unless S3 has all of it. */
  private async backup(
    job: DatabaseJob,
  ): Promise<{ key: string; bytes: number }> {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error('DATABASE_URL is not set');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const key = `backups/${stamp}-${(process.env.GIT_SHA || 'local').slice(0, 7)}.dump`;
    const file = join(tmpdir(), `buyootna-${job.id}.dump`);

    this.line(job, 'Backing up the database (pg_dump)...');
    try {
      const child = spawn(
        'pg_dump',
        ['--format=custom', '--no-owner', '--no-acl'],
        {
          env: { ...process.env, ...pgEnv(databaseUrl) },
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      );
      let stderr = '';
      child.stderr.on('data', (chunk: Buffer) => (stderr += chunk.toString()));
      const exited = new Promise<number>((resolve, reject) => {
        child.on('error', reject);
        child.on('close', (code) => resolve(code ?? 1));
      });
      await pipeline(child.stdout, createWriteStream(file, { mode: 0o600 }));
      const code = await exited;
      if (code !== 0) {
        throw new Error(
          `pg_dump failed (${code}): ${stderr.trim().slice(0, 300)}`,
        );
      }

      this.line(job, `Uploading the backup to S3 (${key})...`);
      const bytes = await this.storage.uploadPrivateFile(
        file,
        key,
        'application/octet-stream',
      );
      const { size } = await stat(file);
      if (!bytes || bytes !== size) {
        throw new Error(
          `Backup upload incomplete (${bytes} of ${size} bytes); nothing was deleted`,
        );
      }
      // A whole-database dump must never be public: the bucket policy
      // makes every prefix but a few private ones readable by anyone
      if (await this.storage.isPubliclyReadable(key)) {
        await this.storage.deleteKey(key);
        throw new Error(
          "The backup would be public (add backups/* to the bucket policy's private prefixes); it was removed and nothing was deleted",
        );
      }
      job.backupKey = key;
      job.backupBytes = bytes;
      this.line(
        job,
        `✓ Backup saved: ${key} (${(bytes / 1024 / 1024).toFixed(1)} MB)`,
      );
      return { key, bytes };
    } finally {
      await rm(file, { force: true });
    }
  }

  async seed(password: string, actor: Actor) {
    // The fixtures start by deleting users, listings and chats, so they
    // only ever go into an empty database
    if ((await this.prisma.user.count()) > 0) {
      throw new ConflictException(
        'قاعدة البيانات ليست فارغة: امسحها أولاً ثم أعد التعبئة',
      );
    }
    const job = this.start('seed', actor.tester.name);
    void this.run(job, async () => {
      await runDevSeed(this.prisma, {
        password,
        includeAdmin: false,
        log: (text) => this.line(job, text),
      });
      await this.audit.record({
        actorName: actor.tester.name,
        action: 'DATABASE_SEEDED',
        ip: actor.ip,
      });
    });
    return job;
  }
}
