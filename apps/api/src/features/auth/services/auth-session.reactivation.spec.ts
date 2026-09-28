import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { LoginAlertService } from '../../devices/login-alert.service';
import { SessionsService } from '../../devices/sessions.service';
import { AuthIdentitiesService } from './auth-identities.service';
import { AuthSessionService } from './auth-session.service';

describe('AuthSessionService.login account status', () => {
  const prisma = {
    user: { update: jest.fn().mockReturnValue('user-op') },
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

  const service = new AuthSessionService(
    prisma as unknown as PrismaService,
    { sign: jest.fn().mockReturnValue('jwt') } as unknown as JwtService,
    identities as unknown as AuthIdentitiesService,
    sessions as unknown as SessionsService,
    { notifyNewDeviceLogin: jest.fn() } as unknown as LoginAlertService,
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

    expect(result.access_token).toBe('jwt');
    expect(result).not.toHaveProperty('reactivated');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('reactivates an account the user suspended themselves', async () => {
    const result = await service.login(
      user({ isDisabled: true, suspendedAt: new Date('2026-09-01') }),
    );

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { isDisabled: false, suspendedAt: null },
    });
    expect(prisma.accountSuspension.updateMany).toHaveBeenCalledWith({
      where: { userId: 'u1', reactivatedAt: null },
      data: { reactivatedAt: expect.any(Date) as Date },
    });
    expect(result.reactivated).toBe(true);
    expect(result.user.isDisabled).toBe(false);
  });

  it.each([
    ['disabled by an admin', { isDisabled: true }, 'الحساب معطل مؤقتاً'],
    ['blocked', { isBlocked: true }, 'الحساب محظور'],
  ])(
    'refuses an account %s on every sign-in path',
    async (_, flags, message) => {
      await expect(service.login(user(flags))).rejects.toThrow(
        new UnauthorizedException(message),
      );
      expect(sessions.upsertSession).not.toHaveBeenCalled();
    },
  );
});
