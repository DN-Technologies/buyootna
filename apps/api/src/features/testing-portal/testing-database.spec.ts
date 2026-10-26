import { EventEmitter } from 'events';
import { PassThrough } from 'stream';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { DocsLoginLimiterService } from '../docs-portal/docs-login-limiter.service';
import {
  DatabaseJob,
  TestingDatabaseService,
  WIPE_CONFIRM,
  pgEnv,
} from './testing-database.service';

jest.mock('child_process', () => ({ spawn: jest.fn() }));
jest.mock('../../core/demo-data/dev-seed', () => ({ runDevSeed: jest.fn() }));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { spawn } = require('child_process') as { spawn: jest.Mock };
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { runDevSeed } = require('../../core/demo-data/dev-seed') as {
  runDevSeed: jest.Mock;
};

const actor = { tester: { name: 'Ahmed (QA)' }, ip: '1.2.3.4' };

/** A pg_dump that writes `output` and exits with `code`. */
function fakeDump(output: string, code = 0) {
  spawn.mockImplementation(() => {
    const child = new EventEmitter() as EventEmitter & {
      stdout: PassThrough;
      stderr: PassThrough;
    };
    child.stdout = new PassThrough();
    child.stderr = new PassThrough();
    setImmediate(() => {
      if (code !== 0) child.stderr.write('connection refused');
      child.stdout.end(output);
      child.stderr.end();
      setImmediate(() => child.emit('close', code));
    });
    return child;
  });
}

function setup({ dangerOk = true, users = 0 } = {}) {
  const prisma = {
    $queryRaw: jest
      .fn()
      .mockResolvedValue([
        { tablename: 'User' },
        { tablename: 'Property' },
        { tablename: '_prisma_migrations' },
        { tablename: 'TestingCredential' },
        { tablename: 'TestingAuditLog' },
      ]),
    $executeRawUnsafe: jest.fn(),
    user: { count: jest.fn().mockResolvedValue(users) },
  };
  const storage = {
    uploadPrivateFile: jest.fn(),
    isPubliclyReadable: jest.fn().mockResolvedValue(false),
    deleteKey: jest.fn(),
  };
  const portal = { checkDangerPassword: jest.fn().mockResolvedValue(dangerOk) };
  const audit = { record: jest.fn() };
  const service = new TestingDatabaseService(
    prisma as never,
    storage as never,
    portal as never,
    new DocsLoginLimiterService(),
    audit as never,
  );
  return { service, prisma, storage, audit };
}

async function settle(job: DatabaseJob) {
  for (let i = 0; i < 50 && job.state === 'running'; i++) {
    await new Promise((resolve) => setImmediate(resolve));
  }
}

describe('TestingDatabaseService', () => {
  const env = process.env.DATABASE_URL;
  beforeEach(() => {
    process.env.DATABASE_URL =
      'postgresql://app:p%40ss@db:5432/buyootna?schema=public';
    spawn.mockReset();
    runDevSeed.mockReset();
  });
  afterAll(() => (process.env.DATABASE_URL = env));

  it('refuses a wipe without the exact phrase, before checking the password', async () => {
    const { service, prisma } = setup();
    await expect(service.wipe('buyootna', 'danger', actor)).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.$executeRawUnsafe).not.toHaveBeenCalled();
  });

  it('refuses a wrong danger password and records it', async () => {
    const { service, prisma, audit } = setup({ dangerOk: false });
    await expect(service.wipe(WIPE_CONFIRM, 'nope', actor)).rejects.toThrow(
      ForbiddenException,
    );
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'DANGER_PASSWORD_WRONG' }),
    );
    expect(spawn).not.toHaveBeenCalled();
    expect(prisma.$executeRawUnsafe).not.toHaveBeenCalled();
  });

  it('backs up first, then empties every table but the kept ones', async () => {
    const { service, prisma, storage, audit } = setup();
    fakeDump('PGDMP-backup');
    storage.uploadPrivateFile.mockResolvedValue('PGDMP-backup'.length);

    const job = await service.wipe(WIPE_CONFIRM, 'danger', actor);
    await settle(job);

    expect(job.state).toBe('done');
    expect(job.backupKey).toMatch(/^backups\/.+\.dump$/);
    // The password reaches pg_dump through the env, never its arguments
    expect(spawn.mock.calls[0][1].join(' ')).not.toContain('p@ss');
    expect(spawn.mock.calls[0][2].env).toMatchObject({
      PGHOST: 'db',
      PGPASSWORD: 'p@ss',
      PGDATABASE: 'buyootna',
    });
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      'TRUNCATE TABLE "User", "Property" RESTART IDENTITY',
    );
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'DATABASE_WIPED',
        target: job.backupKey,
      }),
    );
  });

  it('deletes nothing when pg_dump fails', async () => {
    const { service, prisma, storage } = setup();
    fakeDump('', 1);
    const job = await service.wipe(WIPE_CONFIRM, 'danger', actor);
    await settle(job);
    expect(job.state).toBe('failed');
    expect(job.error).toContain('pg_dump failed');
    expect(storage.uploadPrivateFile).not.toHaveBeenCalled();
    expect(prisma.$executeRawUnsafe).not.toHaveBeenCalled();
  });

  it('deletes nothing when S3 has less than the whole backup', async () => {
    const { service, prisma, storage } = setup();
    fakeDump('PGDMP-backup');
    storage.uploadPrivateFile.mockResolvedValue(3);
    const job = await service.wipe(WIPE_CONFIRM, 'danger', actor);
    await settle(job);
    expect(job.state).toBe('failed');
    expect(prisma.$executeRawUnsafe).not.toHaveBeenCalled();
  });

  it('removes a backup anyone could read, and deletes nothing', async () => {
    const { service, prisma, storage } = setup();
    fakeDump('PGDMP-backup');
    storage.uploadPrivateFile.mockResolvedValue('PGDMP-backup'.length);
    storage.isPubliclyReadable.mockResolvedValue(true);
    const job = await service.wipe(WIPE_CONFIRM, 'danger', actor);
    await settle(job);
    expect(job.state).toBe('failed');
    expect(job.error).toContain('public');
    expect(storage.deleteKey).toHaveBeenCalledWith(
      storage.uploadPrivateFile.mock.calls[0][1],
    );
    expect(prisma.$executeRawUnsafe).not.toHaveBeenCalled();
  });

  it('seeds only an empty database, without the admin account', async () => {
    const full = setup({ users: 3 });
    await expect(full.service.seed('password123', actor)).rejects.toThrow(
      ConflictException,
    );
    expect(runDevSeed).not.toHaveBeenCalled();

    const empty = setup();
    const job = await empty.service.seed('password123', actor);
    await settle(job);
    expect(job.state).toBe('done');
    expect(runDevSeed).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ password: 'password123', includeAdmin: false }),
    );
  });

  it('reads sslmode from DATABASE_URL', () => {
    expect(pgEnv('postgres://u:p@h/db?sslmode=require').PGSSLMODE).toBe(
      'require',
    );
  });
});
