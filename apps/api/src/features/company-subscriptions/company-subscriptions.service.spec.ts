import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CompanySubscriptionsService } from './company-subscriptions.service';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('CompanySubscriptionsService', () => {
  const companySubscription = { findMany: jest.fn() };
  const service = new CompanySubscriptionsService({
    companySubscription,
  } as unknown as PrismaService);

  beforeEach(() => jest.clearAllMocks());

  it('lists the paid periods with a short id and whether each is still running', async () => {
    const running = new Date(Date.now() + 30 * DAY_MS);
    const over = new Date(Date.now() - 30 * DAY_MS);
    companySubscription.findMany.mockResolvedValue([
      {
        id: '1a2b3c4d-0000-0000-0000-000000000000',
        startsAt: over,
        endsAt: running,
        companyPlan: { name: 'السنوية' },
      },
      {
        id: '9f8e7d6c-0000-0000-0000-000000000000',
        startsAt: over,
        endsAt: over,
        companyPlan: null,
      },
    ]);

    const history = await service.getHistory('c1', 'COMPANY');

    expect(companySubscription.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { identityId: 'c1', kind: 'PAID' } }),
    );
    expect(history).toEqual([
      expect.objectContaining({
        displayId: 'ID:1A2B3C4D',
        planName: 'السنوية',
        status: 'ACTIVE',
      }),
      // The plan row was deleted since
      expect.objectContaining({ planName: 'باقة', status: 'EXPIRED' }),
    ]);
  });

  it('is for company personas only', async () => {
    await expect(service.getHistory('i1', 'INDIVIDUAL')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(() => service.getMine('i1', 'OFFICE')).toThrow(ForbiddenException);
  });
});
