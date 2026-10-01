import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { LoginAlertService } from '../../devices/login-alert.service';
import { SessionsService } from '../../devices/sessions.service';
import { AccountStateService } from '../../users/services/account-state.service';
import { SUSPENDED_BY_ADMIN_MESSAGE } from '../account-status.util';
import { AuthIdentitiesService } from './auth-identities.service';
import { AuthSessionService } from './auth-session.service';

describe('AuthSessionService.login account status', () => {
  const prisma = {
    user: {
      update: jest.fn().mockReturnValue('user-op'),
      findUnique: jest.fn(),
    },
    accountSuspension: {
      updateMany: jest.fn().mockReturnValue('suspension-op'),
    },
    $transaction: jest.fn().mockResolvedValue([]),
  };
  const identity = { id: 'i1', type: 'INDIVIDUAL', isActive: true };
  const identities = {
    findForDevice: jest.fn().mockResolvedValue(null),
    markLastUsed: jest.fn(),
    findActive: jest.fn().mockResolvedValue(identity),
    listAll: jest.fn().mockResolvedValue([identity]),
  };
  const sessions = {
    upsertSession: jest
      .fn()
      .mockResolvedValue({ id: 's1', isNewDevice: false }),
  };

  // A real JwtService, so tickets are actually signed and verified
  const jwt = new JwtService({ secret: 'test-secret' });
  const service = new AuthSessionService(
    prisma as unknown as PrismaService,
    jwt,
    identities as unknown as AuthIdentitiesService,
    sessions as unknown as SessionsService,
    { notifyNewDeviceLogin: jest.fn() } as unknown as LoginAlertService,
    new AccountStateService(prisma as unknown as PrismaService),
  );

  const user = (flags: Partial<User>) =>
    ({
      id: 'u1',
      isAdmin: false,
      isBlocked: false,
      isDisabled: false,
      suspendedAt: null,
      ...flags,
    }) as Omit<User, 'password'>;

  beforeEach(() => jest.clearAllMocks());

  it('signs a normal account in without touching its status', async () => {
    const result = await service.login(user({}));

    expect(typeof result.access_token).toBe('string');
    expect(result.user.accountStatus).toBe('active');
    expect(result).not.toHaveProperty('reactivated');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('reactivates an account the user suspended themselves', async () => {
    const result = await service.login(
      user({ isDisabled: true, suspendedAt: new Date('2026-09-01') }),
    );

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { isDisabled: false, suspendedAt: null, suspendedUntil: null },
    });
    expect(prisma.accountSuspension.updateMany).toHaveBeenCalledWith({
      where: { userId: 'u1', reactivatedAt: null },
      data: { reactivatedAt: expect.any(Date) as Date },
    });
    expect(result.reactivated).toBe(true);
    expect(result.user.isDisabled).toBe(false);
  });

  it.each([
    ['disabled by an admin', { isDisabled: true }],
    ['blocked', { isBlocked: true }],
    [
      'suspended by an admin after suspending themselves',
      { isBlocked: true, isDisabled: true, suspendedAt: new Date() },
    ],
  ])(
    'refuses an account %s with 403 on every sign-in path, changing nothing',
    async (_, flags) => {
      const attempt = service.login(user(flags));
      await expect(attempt).rejects.toThrow(ForbiddenException);
      await expect(attempt).rejects.toThrow(SUSPENDED_BY_ADMIN_MESSAGE);
      expect(sessions.upsertSession).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    },
  );

  describe('timed deactivation', () => {
    const inDays = (d: number) => new Date(Date.now() + d * 86_400_000);
    const timed = (days: number) =>
      user({
        isDisabled: true,
        suspendedAt: new Date(),
        suspendedUntil: inDays(days),
      });

    const conflictOf = async (p: Promise<unknown>) => {
      const err = await p.catch((e: unknown) => e);
      expect(err).toBeInstanceOf(ConflictException);
      return (err as ConflictException).getResponse() as {
        code: string;
        message: string;
        daysLeft: number;
        reactivationTicket: string;
      };
    };

    it('asks before ending it early: 409 with the days left and a ticket, account unchanged', async () => {
      const body = await conflictOf(service.login(timed(2.5)));

      expect(body.code).toBe('ACCOUNT_SCHEDULED_DEACTIVATION');
      expect(body.daysLeft).toBe(3);
      expect(body.message).toContain('3 أيام');
      expect(body.reactivationTicket).toEqual(expect.any(String));
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(sessions.upsertSession).not.toHaveBeenCalled();
    });

    it('"yes": the ticket reactivates the account and signs in', async () => {
      const u = timed(3);
      const { reactivationTicket } = await conflictOf(service.login(u));
      prisma.user.findUnique.mockResolvedValue({ ...u, password: 'hash' });

      const result =
        await service.loginWithReactivationTicket(reactivationTicket);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { isDisabled: false, suspendedAt: null, suspendedUntil: null },
      });
      expect(result.reactivated).toBe(true);
      expect(result.user).not.toHaveProperty('password');
      expect(sessions.upsertSession).toHaveBeenCalled();
    });

    it('a ticket for an account an admin has since suspended is refused', async () => {
      const { reactivationTicket } = await conflictOf(
        service.login(timed(3)),
      );
      prisma.user.findUnique.mockResolvedValue({
        ...user({ isDisabled: true }),
        password: 'hash',
      });

      await expect(
        service.loginWithReactivationTicket(reactivationTicket),
      ).rejects.toThrow(ForbiddenException);
    });

    it.each([
      ['garbage', 'not-a-jwt'],
      ['a normal access token', 'ACCESS'],
      ['an expired ticket', 'EXPIRED'],
    ])('refuses %s as a ticket', async (_, kind) => {
      const token =
        kind === 'ACCESS'
          ? jwt.sign({ sub: 'u1', ident: 'i1', type: 'INDIVIDUAL' })
          : kind === 'EXPIRED'
            ? jwt.sign({ sub: 'u1', kind: 'reactivate' }, { expiresIn: -10 })
            : kind;

      await expect(service.loginWithReactivationTicket(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('signs straight in once the period has passed', async () => {
      const result = await service.login(timed(-0.1));
      expect(result.reactivated).toBe(true);
    });
  });
});
