import { Test, TestingModule } from '@nestjs/testing';
import { PlansService } from './plans.service';
import { PrismaService } from '../../core/prisma/prisma.service';

describe('PlansService', () => {
  let service: PlansService;

  const prisma = {
    userPlanSlot: { findMany: jest.fn() },
    identity: { findUnique: jest.fn(), aggregate: jest.fn() },
  };

  const gold = {
    id: 'plan-gold',
    slug: 'gold',
    name: 'الذهبية',
    color: '#15304D',
    badge: null,
    maxActiveAds: 1,
    durationDays: 30,
  };

  const slot = (overrides: Record<string, unknown>) => ({
    id: 'slot-1',
    planId: gold.id,
    status: 'ACTIVE',
    adsRemaining: 1,
    createdAt: new Date('2026-09-01'),
    plan: gold,
    invoice: null,
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlansService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<PlansService>(PlansService);
    prisma.identity.findUnique.mockResolvedValue({ freeAdsRemaining: 0 });
  });

  describe('getWallet totalAds', () => {
    it('uses the purchased package size', async () => {
      prisma.userPlanSlot.findMany.mockResolvedValue([
        slot({ adsRemaining: 3, invoice: { planPackage: { adsCount: 5 } } }),
      ]);

      const wallet = await service.getWallet('identity-1');

      expect(wallet.slots[0]).toMatchObject({ adsRemaining: 3, totalAds: 5 });
    });

    it('falls back to the plan default for slots without a package', async () => {
      prisma.userPlanSlot.findMany.mockResolvedValue([
        slot({ adsRemaining: 1, invoice: { planPackage: null } }),
      ]);

      const wallet = await service.getWallet('identity-1');

      expect(wallet.slots[0].totalAds).toBe(1);
    });

    it('never reports a total below what remains (admin grants)', async () => {
      prisma.userPlanSlot.findMany.mockResolvedValue([
        slot({ adsRemaining: 4, invoice: null }),
      ]);

      const wallet = await service.getWallet('identity-1');

      expect(wallet.slots[0].totalAds).toBe(4);
    });
  });

  describe('ownership', () => {
    it("lists only the persona's own credits and its own free ad", async () => {
      prisma.userPlanSlot.findMany.mockResolvedValue([]);
      prisma.identity.findUnique.mockResolvedValue({ freeAdsRemaining: 1 });

      const wallet = await service.getWallet('identity-company');

      const findArgs = (
        prisma.userPlanSlot.findMany.mock.calls as [{ where: unknown }][]
      )[0][0];
      expect(findArgs.where).toEqual({ identityId: 'identity-company' });
      expect(wallet.freeAdsRemaining).toBe(1);
    });

    it("sums every persona for the admin's account view", async () => {
      prisma.userPlanSlot.findMany.mockResolvedValue([]);
      prisma.identity.aggregate.mockResolvedValue({
        _sum: { freeAdsRemaining: 2 },
      });

      const wallet = await service.getAccountWallet('user-1');

      const findArgs = (
        prisma.userPlanSlot.findMany.mock.calls as [{ where: unknown }][]
      )[0][0];
      expect(findArgs.where).toEqual({ identity: { userId: 'user-1' } });
      expect(wallet.freeAdsRemaining).toBe(2);
    });
  });
});
