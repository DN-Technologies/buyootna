import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import type { IncomingHttpHeaders } from 'node:http';
import { PrismaService } from '../prisma/prisma.service';

const FLUSH_MS = 60_000;
// Header values are client-controlled: keep them short and plain
const clean = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)
    ?.replace(/[^\w.\-+]/g, '')
    .slice(0, 40) || null;

/**
 * Counts requests per app build (X-Device-Platform / X-App-Version /
 * X-App-Runtime / X-App-Update, sent by the mobile app) and writes the totals once a minute, so the
 * testing portal can show which builds are in use without a write per
 * request.
 */
@Injectable()
export class AppVersionTracker {
  private readonly logger = new Logger(AppVersionTracker.name);
  private pending = new Map<string, number>();

  note(headers: IncomingHttpHeaders): void {
    const platform =
      clean(headers['x-device-platform']) ?? clean(headers['x-platform']);
    const appVersion = clean(headers['x-app-version']);
    if (!platform || !appVersion) return;
    // The runtime and the OTA update it runs: «1.7.0/3f9a1c2e» or «1.7.0/embedded»
    const update = clean(headers['x-app-update']);
    const runtime = [clean(headers['x-app-runtime']) ?? appVersion, update]
      .filter(Boolean)
      .join('/');
    const key = [platform, appVersion, runtime].join('|');
    this.pending.set(key, (this.pending.get(key) ?? 0) + 1);
  }

  @Interval(FLUSH_MS)
  async flush(): Promise<void> {
    if (!this.pending.size) return;
    const batch = this.pending;
    this.pending = new Map();
    const now = new Date();
    try {
      await Promise.all(
        [...batch.entries()].map(([key, requests]) => {
          const [platform, appVersion, runtime] = key.split('|');
          return this.prisma.appVersionSeen.upsert({
            where: {
              platform_appVersion_runtime: { platform, appVersion, runtime },
            },
            create: {
              platform,
              appVersion,
              runtime,
              requests,
              lastSeenAt: now,
            },
            update: { requests: { increment: requests }, lastSeenAt: now },
          });
        }),
      );
    } catch (error) {
      this.logger.warn(`Could not save app versions: ${String(error)}`);
    }
  }

  constructor(private readonly prisma: PrismaService) {}
}
