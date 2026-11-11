import { Test, TestingModule } from '@nestjs/testing';
import { PlansService } from './plans.service';
import { DiscountPurpose, PlanAudience } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';

describe('PlansService', () => {
  let service: PlansService;

  const prisma = {
    userPlanSlot: { findMany: jest.fn() },
    identity: { findUnique: jest.fn(), aggregate: jest.fn() },
    discountCode: { findMany: jest.fn() },
    plan: { findMany: jest.fn() },
  };
  // What findAll asked Prisma for
  const planQuery = () =>
    (
      prisma.plan.findMany.mock.calls[0] as [
        {
          where: Record<string, unknown>;
          include: { packages: { select: Record<string, boolean> } };
        },
      ]
    )[0];

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

  // Offices' own الباقات (Figma 10180:31480)
  describe('findAll', () => {
    it('lists individual plans by default (older apps), as before', async () => {
      prisma.plan.findMany.mockResolvedValue([]);
      await service.findAll();
      expect(planQuery().where).toEqual({
        isActive: true,
        audience: 'INDIVIDUAL',
      });
    });

    it("lists an office's plans with something to buy (not «اعلان مميز» itself)", async () => {
      prisma.plan.findMany.mockResolvedValue([]);
      await service.findAll(PlanAudience.OFFICE);
      expect(planQuery().where).toEqual({
        isActive: true,
        audience: 'OFFICE',
        packages: { some: { isActive: true } },
      });
      // Each package says what it gives and how long it lasts
      expect(planQuery().include.packages.select).toMatchObject({
        featuredAdsCount: true,
        validityMonths: true,
      });
    });
  });

  describe('getWallet validity', () => {
    it('leaves out credits past «صلاحية انتهاء الباقة», and shows when the rest end', async () => {
      const ends = new Date(Date.now() + 30 * 24 * 3600 * 1000);
      prisma.userPlanSlot.findMany.mockResolvedValue([
        slot({
          id: 'old',
          adsRemaining: 5,
          expiresAt: new Date(Date.now() - 1000),
        }),
        slot({ id: 'live', adsRemaining: 3, expiresAt: ends }),
      ]);

      const wallet = await service.getWallet('identity-1');

      expect(wallet.slots.map((s) => s.id)).toEqual(['live']);
      expect(wallet.slots[0]).toMatchObject({ expiresAt: ends });
      expect(wallet.history.find((h) => h.id === 'old')?.status).toBe(
        'EXPIRED',
      );
    });
  });

  // «خصم 10% عند استخدامك كود "BYOUTNA10"» at the top of الباقات
  describe('getPromo', () => {
    const now = new Date('2026-11-11T12:00:00Z');

    it('asks only for flagged, active codes for this purpose, live now, newest first', async () => {
      prisma.discountCode.findMany.mockResolvedValue([]);

      await service.getPromo(DiscountPurpose.PLAN, now);

      expect(prisma.discountCode.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            showOnPlans: true,
            isActive: true,
            appliesTo: { has: 'PLAN' },
            AND: [
              { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
              { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
            ],
          },
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('gives the newest code that is not used up', async () => {
      prisma.discountCode.findMany.mockResolvedValue([
        {
          code: 'USEDUP',
          type: 'PERCENT',
          value: 20,
          maxUses: 5,
          usedCount: 5,
        },
        {
          code: 'BYOUTNA10',
          type: 'PERCENT',
          value: 10,
          maxUses: null,
          usedCount: 40,
        },
      ]);

      await expect(
        service.getPromo(DiscountPurpose.PLAN, now),
      ).resolves.toEqual({
        code: 'BYOUTNA10',
        type: 'PERCENT',
        value: 10,
      });
    });

    it('is null when there is none', async () => {
      prisma.discountCode.findMany.mockResolvedValue([
        { code: 'USEDUP', type: 'FIXED', value: 1, maxUses: 1, usedCount: 1 },
      ]);

      await expect(
        service.getPromo(DiscountPurpose.PLAN, now),
      ).resolves.toBeNull();
    });
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
