import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { existsSync, promises as fs } from 'fs';
import { isIP } from 'net';
import { dirname, join } from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { CityResponse, open as openMmdb, Reader } from 'maxmind';
import { x as extractTar } from 'tar';

const DEFAULT_DB_PATH = join(process.cwd(), 'data/geoip/GeoLite2-City.mmdb');
const DOWNLOAD_URL =
  'https://download.maxmind.com/geoip/databases/GeoLite2-City/download?suffix=tar.gz';
// MaxMind publishes GeoLite2 updates twice a week
const MAX_DB_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const COUNTRY_NAMES_AR = new Intl.DisplayNames(['ar'], { type: 'region' });

/** Loopback, private, link-local and unique-local addresses have no location. */
export function isPublicIp(ip: string): boolean {
  const v4 = ip.startsWith('::ffff:') ? ip.slice(7) : ip;
  if (isIP(v4) === 4) {
    const [a, b] = v4.split('.').map(Number);
    return !(
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) // carrier-grade NAT
    );
  }
  if (isIP(ip) === 6) {
    const lower = ip.toLowerCase();
    return !(
      lower === '::1' ||
      lower === '::' ||
      lower.startsWith('fe80:') ||
      lower.startsWith('fc') ||
      lower.startsWith('fd')
    );
  }
  return false;
}

/**
 * IP -> "City، الدولة" using MaxMind's GeoLite2-City database, read locally.
 * The database is downloaded with MAXMIND_ACCOUNT_ID / MAXMIND_LICENSE_KEY
 * and refreshed weekly. Without credentials or the file, locate() returns
 * null -- location is informational and must never break a login.
 *
 * This product includes GeoLite2 data created by MaxMind, available from
 * https://www.maxmind.com.
 */
@Injectable()
export class GeoIpService implements OnModuleInit {
  private readonly logger = new Logger(GeoIpService.name);
  private readonly dbPath = process.env.GEOIP_DB_PATH || DEFAULT_DB_PATH;
  private reader: Reader<CityResponse> | null = null;

  onModuleInit() {
    // Don't hold up app startup on a download
    void this.refresh(false);
  }

  @Cron(CronExpression.EVERY_WEEK)
  async weeklyRefresh() {
    await this.refresh(true);
  }

  locate(ip: string | null | undefined): string | null {
    if (!ip || !this.reader || !isPublicIp(ip)) return null;
    try {
      const result = this.reader.get(
        ip.startsWith('::ffff:') ? ip.slice(7) : ip,
      );
      if (!result) return null;
      const isoCode = result.country?.iso_code;
      const country = isoCode ? COUNTRY_NAMES_AR.of(isoCode) : undefined;
      const city = result.city?.names?.en;
      if (city && country) return `${city}، ${country}`;
      return country ?? city ?? null;
    } catch {
      // Unreadable record: treat the location as unknown
      return null;
    }
  }

  /** Downloads the DB if missing/stale (or forced) and (re)opens it. */
  async refresh(force: boolean) {
    try {
      if (force || (await this.isStale())) {
        await this.download();
      }
      if (existsSync(this.dbPath)) {
        this.reader = await openMmdb<CityResponse>(this.dbPath);
      } else {
        this.logger.warn(
          'GeoLite2 database not available; device locations will be unknown',
        );
      }
    } catch (error) {
      this.logger.warn(`GeoIP refresh failed: ${error}`);
    }
  }

  private async isStale(): Promise<boolean> {
    try {
      const { mtimeMs } = await fs.stat(this.dbPath);
      return Date.now() - mtimeMs > MAX_DB_AGE_MS;
    } catch {
      return true;
    }
  }

  private async download() {
    const accountId = process.env.MAXMIND_ACCOUNT_ID;
    const licenseKey = process.env.MAXMIND_LICENSE_KEY;
    if (!accountId || !licenseKey) return;

    const response = await fetch(DOWNLOAD_URL, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountId}:${licenseKey}`).toString('base64')}`,
      },
    });
    if (!response.ok || !response.body) {
      throw new Error(`GeoLite2 download failed: HTTP ${response.status}`);
    }

    // Extract only the .mmdb into a temp dir, then swap it in atomically so a
    // half-written file is never opened
    const dir = dirname(this.dbPath);
    await fs.mkdir(dir, { recursive: true });
    const tmpDir = await fs.mkdtemp(join(dir, '.geoip-'));
    try {
      await pipeline(
        Readable.fromWeb(response.body as never),
        extractTar({
          cwd: tmpDir,
          strip: 1,
          filter: (path) => path.endsWith('.mmdb'),
        }),
      );
      const [mmdb] = (await fs.readdir(tmpDir)).filter((f) =>
        f.endsWith('.mmdb'),
      );
      if (!mmdb) throw new Error('GeoLite2 archive had no .mmdb file');
      await fs.rename(join(tmpDir, mmdb), this.dbPath);
      this.logger.log('GeoLite2 database updated');
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  }
}
