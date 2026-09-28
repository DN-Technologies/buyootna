import { Injectable } from '@nestjs/common';
import { Session } from '@prisma/client';
import { GeoIpService } from '../../core/geoip/geoip.service';
import { PrismaService } from '../../core/prisma/prisma.service';

// Per-request device info, extracted by AuthController from headers/req.ip
// and threaded through to whichever AuthService method issues the JWT.
export interface DeviceCtx {
  deviceId?: string;
  platform?: string;
  // Human-readable model name (e.g. "iPhone 13 Pro Max", "Pixel 7", "SM-G991B"),
  // read client-side via expo-device. Falls back to a generic per-platform
  // label below when the client doesn't send one.
  deviceModel?: string;
  ip?: string;
  userAgent?: string;
}

const PLATFORM_DEVICE_NAMES: Record<string, string> = {
  ios: 'آيفون',
  android: 'جهاز أندرويد',
};

/**
 * Owns all writes to the Session table -- session creation at login time and
 * the "keep only the caller's own device" revocation used by both
 * DevicesService.revokeAllExceptCurrent and AuthService.changePassword's
 * logoutAllDevices option (previously two separately maintained copies of
 * the same heuristic).
 */
@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geoIp: GeoIpService,
  ) {}

  /**
   * Creates or refreshes the Session row representing a login. Keyed by
   * (userId, deviceId) when the client sends a stable per-install deviceId,
   * so re-logging in on the same device refreshes one row instead of piling
   * up duplicates; falls back to a plain create (no upsert key) for clients
   * that haven't started sending the device headers yet.
   *
   * `isNewDevice` is true when this login created a Session row rather than
   * refreshing one -- i.e. the account was just accessed from a device it
   * hasn't been used on before, which triggers the new-login security alert.
   */
  async upsertSession(
    userId: string,
    deviceCtx: DeviceCtx,
  ): Promise<Session & { isNewDevice: boolean }> {
    const deviceName =
      deviceCtx.deviceModel ||
      (deviceCtx.platform && PLATFORM_DEVICE_NAMES[deviceCtx.platform]) ||
      'جهاز الهاتف الحالي';
    // "City، الدولة" from the login IP; refreshed on every login
    const location = this.geoIp.locate(deviceCtx.ip);

    if (deviceCtx.deviceId) {
      const existing = await this.prisma.session.findUnique({
        where: {
          userId_deviceId: { userId, deviceId: deviceCtx.deviceId },
        },
        select: { id: true },
      });
      const session = await this.prisma.session.upsert({
        where: {
          userId_deviceId: { userId, deviceId: deviceCtx.deviceId },
        },
        create: {
          userId,
          deviceId: deviceCtx.deviceId,
          platform: deviceCtx.platform,
          deviceModel: deviceCtx.deviceModel,
          deviceName,
          ipAddress: deviceCtx.ip,
          location,
          userAgent: deviceCtx.userAgent,
        },
        update: {
          platform: deviceCtx.platform,
          deviceModel: deviceCtx.deviceModel,
          deviceName,
          ipAddress: deviceCtx.ip,
          location,
          userAgent: deviceCtx.userAgent,
          isActive: true,
          lastActive: new Date(),
        },
      });
      return { ...session, isNewDevice: !existing };
    }

    const session = await this.prisma.session.create({
      data: {
        userId,
        deviceModel: deviceCtx.deviceModel,
        deviceName,
        ipAddress: deviceCtx.ip,
        location,
        userAgent: deviceCtx.userAgent,
      },
    });
    return { ...session, isNewDevice: true };
  }

  /**
   * Deletes every session for the user except `currentSessionId`. Falls back
   * to the previous "most recently active" heuristic when no
   * currentSessionId is given (a token issued before the sid JWT claim
   * existed).
   */
  async deleteAllExceptCurrent(
    userId: string,
    currentSessionId?: string,
  ): Promise<{ count: number }> {
    if (currentSessionId) {
      return this.prisma.session.deleteMany({
        where: { userId, id: { not: currentSessionId } },
      });
    }

    const latest = await this.prisma.session.findFirst({
      where: { userId, isActive: true },
      orderBy: { lastActive: 'desc' },
    });

    if (latest) {
      return this.prisma.session.deleteMany({
        where: { userId, id: { not: latest.id } },
      });
    }

    return { count: 0 };
  }

  /**
   * Refreshes a session's lastActive timestamp (e.g. when switching identity
   * on the same device/session, which shouldn't spawn a new Session row).
   * Best-effort by design: a stale/missing sessionId (e.g. from a token
   * issued before the sid claim existed) shouldn't block the caller.
   */
  async touchLastActive(sessionId: string): Promise<void> {
    await this.prisma.session
      .update({
        where: { id: sessionId },
        data: { lastActive: new Date() },
      })
      .catch(() => undefined);
  }
}
