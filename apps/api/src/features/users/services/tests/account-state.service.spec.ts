import { PrismaService } from '../../../core/prisma/prisma.service';
import { AccountStateService } from './account-state.service';

describe('AccountStateService.reactivateExpired', () => {
  const prisma = {
    user: {
      findMany: jest.fn(),
      update: jest.fn().mockReturnValue('user-op'),
    },
    accountSuspension: {
      updateMany: jest.fn().mockReturnValue('suspension-op'),
    },
    $transaction: jest.fn().mockResolvedValue([]),
  };
  const service = new AccountStateService(prisma as unknown as PrismaService);

  beforeEach(() => jest.clearAllMocks());

  it('looks only for self-deactivations whose period has ended', async () => {
    prisma.user.findMany.mockResolvedValue([]);
    const now = new Date('2026-10-07T10:00:00Z');

    await expect(service.reactivateExpired(now)).resolves.toBe(0);

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        isDisabled: true,
        isBlocked: false,
        // An admin suspension never has suspendedAt, so it is never matched
        suspendedAt: { not: null },
        suspendedUntil: { lte: now },
      },
      select: { id: true },
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('reactivates each one and closes its suspension record', async () => {
    prisma.user.findMany.mockResolvedValue([{ id: 'u1' }, { id: 'u2' }]);

    await expect(service.reactivateExpired()).resolves.toBe(2);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u2' },
      data: { isDisabled: false, suspendedAt: null, suspendedUntil: null },
    });
    expect(prisma.accountSuspension.updateMany).toHaveBeenCalledWith({
      where: { userId: 'u1', reactivatedAt: null },
      data: { reactivatedAt: expect.any(Date) as Date },
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
  });

  it('keeps going when one account fails', async () => {
    prisma.user.findMany.mockResolvedValue([{ id: 'u1' }, { id: 'u2' }]);
    prisma.$transaction.mockRejectedValueOnce(new Error('db'));

    await service.reactivateExpired();

    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
  });
});
