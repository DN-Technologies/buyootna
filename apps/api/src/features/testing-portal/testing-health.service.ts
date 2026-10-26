import { Injectable, OnModuleInit } from '@nestjs/common';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { monitorEventLoopDelay, IntervalHistogram } from 'node:perf_hooks';
import { PrismaService } from '../../core/prisma/prisma.service';
import { MailService } from '../../core/mail/mail.service';
import { StorageService } from '../../core/storage/storage.service';
import { TwilioService } from '../../core/twilio/twilio.service';

export type HealthStatus = 'ok' | 'warn' | 'down';

export interface HealthCheck {
  key: string;
  label: string;
  status: HealthStatus;
  detail: string;
  latencyMs?: number;
}

const TIMEOUT_MS = 4000;
const RANK: Record<HealthStatus, number> = { ok: 0, warn: 1, down: 2 };

// The web apps on the production docker network
const PRODUCTION_WEB_APPS = [
  'admin=http://web-admin:3005',
  'docs=http://web-docs:3006',
  'landing=http://web-landing:3001',
  'companies=http://web-companies:3002',
  'offices=http://web-offices:3003',
  'management=http://web-management:3004',
];

function withTimeout<T>(promise: Promise<T>, ms = TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`timed out after ${ms} ms`)), ms),
    ),
  ]);
}

const message = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/**
 * الحالة: is each part of the platform up — the database and its
 * migrations, file storage, email and SMS providers, the API process and
 * the web apps.
 */
@Injectable()
export class TestingHealthService implements OnModuleInit {
  private loopDelay?: IntervalHistogram;
  private readonly startedAt = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly storage: StorageService,
    private readonly twilio: TwilioService,
  ) {}

  onModuleInit() {
    this.loopDelay = monitorEventLoopDelay({ resolution: 20 });
    this.loopDelay.enable();
  }

  async check() {
    const checks = await Promise.all([
      this.database(),
      this.migrations(),
      this.fileStorage(),
      Promise.resolve(this.email()),
      Promise.resolve(this.sms()),
      Promise.resolve(this.process()),
      ...this.webApps(),
    ]);
    const status = checks.reduce<HealthStatus>(
      (worst, c) => (RANK[c.status] > RANK[worst] ? c.status : worst),
      'ok',
    );
    return {
      status,
      checkedAt: new Date().toISOString(),
      version: this.version(),
      checks,
    };
  }

  version() {
    return {
      commit: process.env.GIT_SHA || null,
      builtAt: process.env.BUILD_TIME || null,
      environment: process.env.NODE_ENV ?? 'development',
      node: process.version,
      startedAt: new Date(this.startedAt).toISOString(),
    };
  }

  private async database(): Promise<HealthCheck> {
    const start = Date.now();
    try {
      await withTimeout(this.prisma.$queryRaw`SELECT 1`);
      const latencyMs = Date.now() - start;
      return {
        key: 'database',
        label: 'قاعدة البيانات',
        status: latencyMs > 500 ? 'warn' : 'ok',
        detail: `يستجيب خلال ${latencyMs} ms`,
        latencyMs,
      };
    } catch (error) {
      return {
        key: 'database',
        label: 'قاعدة البيانات',
        status: 'down',
        detail: message(error),
      };
    }
  }

  private async migrations(): Promise<HealthCheck> {
    const label = 'ترحيلات قاعدة البيانات';
    try {
      const files = readdirSync(join(process.cwd(), 'prisma', 'migrations'), {
        withFileTypes: true,
      }).filter((entry) => entry.isDirectory()).length;
      const rows = await withTimeout(
        this.prisma.$queryRaw<{ applied: bigint; failed: bigint }[]>`
          SELECT
            count(*) FILTER (WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL) AS applied,
            count(*) FILTER (WHERE finished_at IS NULL AND rolled_back_at IS NULL) AS failed
          FROM "_prisma_migrations"`,
      );
      const applied = Number(rows[0]?.applied ?? 0);
      const failed = Number(rows[0]?.failed ?? 0);
      const pending = Math.max(0, files - applied);
      if (failed) {
        return {
          key: 'migrations',
          label,
          status: 'down',
          detail: `${failed} ترحيل فشل`,
        };
      }
      return {
        key: 'migrations',
        label,
        status: pending ? 'warn' : 'ok',
        detail: pending ? `${pending} ترحيل لم يُطبَّق` : `${applied} مطبّقة`,
      };
    } catch (error) {
      return {
        key: 'migrations',
        label,
        status: 'warn',
        detail: message(error),
      };
    }
  }

  private async fileStorage(): Promise<HealthCheck> {
    const start = Date.now();
    try {
      await withTimeout(this.storage.checkAccess());
      return {
        key: 'storage',
        label: 'تخزين الملفات (S3)',
        status: 'ok',
        detail: 'متاح',
        latencyMs: Date.now() - start,
      };
    } catch (error) {
      return {
        key: 'storage',
        label: 'تخزين الملفات (S3)',
        status: 'down',
        detail: message(error),
      };
    }
  }

  private email(): HealthCheck {
    return this.mail.isMockMode
      ? {
          key: 'email',
          label: 'البريد (Resend)',
          status: 'warn',
          detail: 'وضع تجريبي: الرسائل لا تُرسل، تظهر في السجلات فقط',
        }
      : {
          key: 'email',
          label: 'البريد (Resend)',
          status: 'ok',
          detail: 'مُعدّ ويرسل',
        };
  }

  private sms(): HealthCheck {
    return this.twilio.isConfigured
      ? {
          key: 'sms',
          label: 'الرسائل النصية (Twilio)',
          status: 'ok',
          detail: 'مُعدّ ويرسل',
        }
      : {
          key: 'sms',
          label: 'الرسائل النصية (Twilio)',
          status: 'warn',
          detail: 'وضع تجريبي: الرموز في السجلات فقط',
        };
  }

  private process(): HealthCheck {
    const memory = process.memoryUsage();
    const rssMb = Math.round(memory.rss / 1024 / 1024);
    const lagMs = this.loopDelay
      ? Math.round(this.loopDelay.percentile(99) / 1e6)
      : 0;
    this.loopDelay?.reset();
    const uptimeMin = Math.round(process.uptime() / 60);
    return {
      key: 'process',
      label: 'خادم الـ API',
      status: lagMs > 200 || rssMb > 1500 ? 'warn' : 'ok',
      detail: `يعمل منذ ${uptimeMin} دقيقة · الذاكرة ${rssMb} MB · تأخر الحلقة ${lagMs} ms`,
    };
  }

  // Each web app answers over the docker network (not configured locally)
  private webApps(): Promise<HealthCheck>[] {
    const targets = process.env.TESTING_HEALTH_WEB_URLS
      ? process.env.TESTING_HEALTH_WEB_URLS.split(',')
      : process.env.NODE_ENV === 'production'
        ? PRODUCTION_WEB_APPS
        : [];
    return targets.map(async (target): Promise<HealthCheck> => {
      const [name, url] = target.split('=');
      const label = `موقع ${name}`;
      const start = Date.now();
      try {
        const res = await withTimeout(fetch(url, { redirect: 'manual' }));
        const latencyMs = Date.now() - start;
        return {
          key: `web-${name}`,
          label,
          status: res.status >= 500 ? 'down' : 'ok',
          detail: `HTTP ${res.status}`,
          latencyMs,
        };
      } catch (error) {
        return {
          key: `web-${name}`,
          label,
          status: 'down',
          detail: message(error),
        };
      }
    });
  }
}
