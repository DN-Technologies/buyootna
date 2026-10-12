import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from './companies.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let prisma: {
    property: { count: jest.Mock; aggregate: jest.Mock };
    userPlanSlot: { findMany: jest.Mock };
    invoice: { findFirst: jest.Mock };
    companySubscription: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      property: {
        count: jest.fn().mockResolvedValue(0),
        aggregate: jest.fn().mockResolvedValue({ _sum: { views: null } }),
      },
      userPlanSlot: { findMany: jest.fn().mockResolvedValue([]) },
      invoice: { findFirst: jest.fn().mockResolvedValue(null) },
      companySubscription: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('reports no active plan and zero ads remaining when there are no active slots', async () => {
    const result = await service.getDashboard('identity-1');

    expect(result.billing).toEqual({
      hasActivePlan: false,
      activePlanName: null,
      adsRemaining: 0,
      hasOverdueInvoice: false,
      subscriptionStatus: 'NONE',
      trialDaysLeft: null,
    });
  });

  it("sums adsRemaining and reports the most recent slot's plan name when active slots exist", async () => {
    prisma.userPlanSlot.findMany.mockResolvedValue([
      { adsRemaining: 3, plan: { name: 'الباقة الذهبية' } },
      { adsRemaining: 2, plan: { name: 'الباقة الفضية' } },
    ]);

    const result = await service.getDashboard('identity-1');

    expect(result.billing).toEqual({
      hasActivePlan: true,
      activePlanName: 'الباقة الذهبية',
      adsRemaining: 5,
      hasOverdueInvoice: false,
      subscriptionStatus: 'NONE',
      trialDaysLeft: null,
    });
  });

  it('reports hasOverdueInvoice true when an overdue invoice exists', async () => {
    prisma.invoice.findFirst.mockResolvedValue({ id: 'invoice-1' });

    const result = await service.getDashboard('identity-1');

    expect(result.billing.hasOverdueInvoice).toBe(true);
  });

  it('returns active listing count and lifetime view sum for listings', async () => {
    prisma.property.count.mockResolvedValue(8);
    prisma.property.aggregate.mockResolvedValue({ _sum: { views: 42 } });

    const result = await service.getDashboard('identity-1');

    expect(result.listings).toEqual({ activeCount: 8, totalViews: 42 });
  });

  it('scopes every Prisma call to the given identityId', async () => {
    await service.getDashboard('identity-42');

    expect(prisma.property.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ identityId: 'identity-42' }),
      }),
    );
    expect(prisma.property.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { identityId: 'identity-42' },
      }),
    );
    expect(prisma.userPlanSlot.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ identityId: 'identity-42' }),
      }),
    );
    expect(prisma.invoice.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ identityId: 'identity-42' }),
      }),
    );
  });

  it('reports the trial countdown while the free period is running', async () => {
    prisma.companySubscription.findMany.mockResolvedValue([
      {
        kind: 'TRIAL',
        companyPlanId: null,
        endsAt: new Date(Date.now() + 9.5 * 24 * 60 * 60 * 1000),
      },
    ]);

    const result = await service.getDashboard('identity-1');

    expect(result.billing).toMatchObject({
      hasActivePlan: false,
      subscriptionStatus: 'TRIAL',
      trialDaysLeft: 10,
    });
  });

  it('counts a paid subscription as the active plan', async () => {
    prisma.companySubscription.findMany.mockResolvedValue([
      {
        kind: 'PAID',
        companyPlanId: 'annual',
        endsAt: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
      },
    ]);

    const result = await service.getDashboard('identity-1');

    expect(result.billing).toMatchObject({
      hasActivePlan: true,
      subscriptionStatus: 'ACTIVE',
      trialDaysLeft: null,
    });
  });
});
