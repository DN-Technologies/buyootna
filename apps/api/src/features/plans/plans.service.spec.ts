import { Test, TestingModule } from '@nestjs/testing';
import { PlansService } from './plans.service';
import { PrismaService } from '../../core/prisma/prisma.service';

describe('PlansService', () => {
  let service: PlansService;

  const prisma = {
    userPlanSlot: { findMany: jest.fn() },
    user: { findUnique: jest.fn() },
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
    prisma.user.findUnique.mockResolvedValue({ freeAdsRemaining: 0 });
  });

  describe('getUserWallet totalAds', () => {
    it('uses the purchased package size', async () => {
      prisma.userPlanSlot.findMany.mockResolvedValue([
        slot({ adsRemaining: 3, invoice: { planPackage: { adsCount: 5 } } }),
      ]);

      const wallet = await service.getUserWallet('user-1');

      expect(wallet.slots[0]).toMatchObject({ adsRemaining: 3, totalAds: 5 });
    });

    it('falls back to the plan default for slots without a package', async () => {
      prisma.userPlanSlot.findMany.mockResolvedValue([
        slot({ adsRemaining: 1, invoice: { planPackage: null } }),
      ]);

      const wallet = await service.getUserWallet('user-1');

      expect(wallet.slots[0].totalAds).toBe(1);
    });

    it('never reports a total below what remains (admin grants)', async () => {
      prisma.userPlanSlot.findMany.mockResolvedValue([
        slot({ adsRemaining: 4, invoice: null }),
      ]);

      const wallet = await service.getUserWallet('user-1');

      expect(wallet.slots[0].totalAds).toBe(4);
    });
  });
});
