/**
 * Empirical check for the QA ticket "changing the password fails to
 * invalidate active sessions on other devices", against a REAL Postgres.
 *
 * Proves, end to end with the real services and schema (including the
 * passwordChangedAt migration):
 *   1. changePassword(..., logoutAllDevices=true, currentSessionId=A)
 *      deletes Device B's Session row and keeps Device A's,
 *   2. stamps user.passwordChangedAt,
 *   3. JwtStrategy rejects Device B's legacy no-sid token issued before
 *      the change, and accepts Device A's sid-backed token.
 *
 * Gated behind VERIFY_PASSWORD_DB so ordinary `pnpm test` runs (no DB)
 * skip it. Point it at a THROWAWAY database only:
 *
 *   VERIFY_PASSWORD_DB=postgresql://postgres:test@localhost:55432/buyootna_test \
 *     DATABASE_URL=postgresql://postgres:test@localhost:55432/buyootna_test \
 *     pnpm --filter api test -- --runTestsByPath src/features/auth/scripts/verify-password-invalidation.spec.ts
 */
import * as bcrypt from 'bcrypt';

import { SessionsService } from '../../devices/sessions.service';
import type { GeoIpService } from '../../../core/geoip/geoip.service';
import { TwilioService } from '../../../core/twilio/twilio.service';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { AuthPasswordService } from '../services/auth-password.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

const DB_URL = process.env.VERIFY_PASSWORD_DB;
const describeIfDb = DB_URL ? describe : describe.skip;

describeIfDb('password change session invalidation (real Postgres)', () => {
  let prisma: PrismaService;
  let passwordService: AuthPasswordService;
  let strategy: JwtStrategy;
  let sessions: SessionsService;

  const suffix = Date.now();
  let userId: string;
  let identityId: string;
  const deviceA = 'session-device-a';
  const deviceB = 'session-device-b';

  beforeAll(async () => {
    // Safety interlock: the Prisma client connects with DATABASE_URL (which
    // dotenv may fill from apps/api/.env = the shared/staging DB). Refuse to
    // run unless it explicitly targets the same throwaway DB as the gate.
    if (process.env.DATABASE_URL !== DB_URL) {
      throw new Error(
        'Refusing to run: DATABASE_URL must equal VERIFY_PASSWORD_DB (a throwaway database).',
      );
    }

    prisma = new PrismaService();
    await prisma.$connect();

    // Location lookup isn't under test here
    sessions = new SessionsService(prisma, {
      locate: () => null,
    } as unknown as GeoIpService);
    // (prisma, twilio, sessions) — this user has no phone on file, so the
    // Twilio dependency is never touched by changePassword.
    passwordService = new AuthPasswordService(
      prisma,
      {} as TwilioService,
      sessions,
    );
    strategy = new JwtStrategy(prisma);

    // bcrypt hash of 'old-password'.
    const realHash = await bcrypt.hash('old-password', 10);

    const user = await prisma.user.create({
      data: { password: realHash, email: `pw-${suffix}@test.local` },
    });
    userId = user.id;

    // JwtStrategy validates the identity claim belongs to the user.
    const identity = await prisma.identity.create({
      data: { userId, type: 'INDIVIDUAL', isActive: true },
    });
    identityId = identity.id;

    // Two active sessions, one per device.
    await prisma.session.createMany({
      data: [
        {
          id: deviceA,
          userId,
          deviceName: 'iPhone 15 (Device A)',
          isActive: true,
          lastActive: new Date(),
        },
        {
          id: deviceB,
          userId,
          deviceName: 'iPhone X (Device B)',
          isActive: true,
          lastActive: new Date(),
        },
      ],
    });
  });

  afterAll(async () => {
    if (!userId) return;
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  afterAll(async () => {
    if (!userId) return;
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.identity.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('revokes Device B, keeps Device A, stamps passwordChangedAt — and the legacy token check reflects it', async () => {
    const result = await passwordService.changePassword(
      userId,
      'old-password',
      'new-password',
      undefined, // no phone on file -> no OTP required
      true, // "log out from all other devices" (now the client default)
      deviceA,
    );
    expect(result.message).toBe('تم تغيير كلمة المرور بنجاح');

    const sessions = await prisma.session.findMany({
      where: { userId },
      select: { id: true },
    });
    expect(sessions.map((s) => s.id).sort()).toEqual([deviceA]);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    expect(user?.passwordChangedAt).toBeInstanceOf(Date);
    expect(await bcrypt.compare('new-password', user!.password)).toBe(true);

    // Device B's legacy no-sid token, issued before the change: rejected.
    const beforeChange = Math.floor((Date.now() - 60_000) / 1000);
    await expect(
      strategy.validate({
        sub: userId,
        ident: identityId,
        type: 'INDIVIDUAL',
        iat: beforeChange,
      }),
    ).rejects.toThrow();

    // Device A's sid-backed token: still valid.
    const strategyResult = await strategy.validate({
      sub: userId,
      ident: identityId,
      type: 'INDIVIDUAL',
      sid: deviceA,
      iat: beforeChange,
    });
    expect(strategyResult.userId).toBe(userId);
  });
});
