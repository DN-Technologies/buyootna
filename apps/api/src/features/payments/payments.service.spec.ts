import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../../core/prisma/prisma.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let fetchMock: jest.Mock;

  const tx = {
    invoice: { update: jest.fn() },
    userPlanSlot: { create: jest.fn() },
    user: { update: jest.fn() },
  };

  const prisma = {
    user: { findUnique: jest.fn() },
    plan: { findUnique: jest.fn(), findFirst: jest.fn() },
    planPackage: { findFirst: jest.fn() },
    invoice: { create: jest.fn(), findUnique: jest.fn() },
    $transaction: jest.fn((fn: (t: typeof tx) => Promise<unknown>) => fn(tx)),
  };

  const goldPlan = {
    id: 'plan-gold',
    slug: 'gold',
    name: 'الذهبية',
    price: 12,
    maxActiveAds: 1,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.TAP_SECRET_KEY = 'sk_test_123';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);

    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      name: 'Test',
      email: 't@example.com',
      phone: '+96590000000',
    });
    prisma.plan.findUnique.mockResolvedValue(goldPlan);
    prisma.invoice.create.mockResolvedValue({
      id: 'inv-1',
      invoiceNo: 'INV-1',
    });

    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          id: 'chg_1',
          transaction: { url: 'https://tap/checkout' },
        }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  describe('createCharge', () => {
    it('charges the selected package price and records it on the invoice', async () => {
      prisma.planPackage.findFirst.mockResolvedValue({
        id: 'pkg-gold-5',
        adsCount: 5,
        price: 50,
      });

      const result = await service.createCharge(
        'user-1',
        'gold',
        'buyootna://payment-callback',
        undefined,
        5,
      );

      expect(prisma.planPackage.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { planId: 'plan-gold', adsCount: 5, isActive: true },
        }),
      );
      expect(prisma.invoice.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amount: 50,
          planId: 'plan-gold',
          planPackageId: 'pkg-gold-5',
          planDetails: 'باقة الذهبية - 5 إعلانات',
        }),
      });
      const tapBody = JSON.parse(
        (fetchMock.mock.calls[0][1] as { body: string }).body,
      ) as { amount: number };
      expect(tapBody.amount).toBe(50);
      expect(result).toEqual({
        checkoutUrl: 'https://tap/checkout',
        invoiceId: 'inv-1',
        status: 'PENDING',
      });
    });

    it('rejects an ad count the plan has no package for', async () => {
      prisma.planPackage.findFirst.mockResolvedValue(null);

      await expect(
        service.createCharge(
          'user-1',
          'gold',
          'buyootna://payment-callback',
          undefined,
          2,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.invoice.create).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it.each([0, -1, 1.5, 'abc'])(
      'rejects an invalid ad count (%p)',
      async (adsCount) => {
        await expect(
          service.createCharge(
            'user-1',
            'gold',
            'buyootna://payment-callback',
            undefined,
            adsCount,
          ),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(prisma.planPackage.findFirst).not.toHaveBeenCalled();
        expect(prisma.invoice.create).not.toHaveBeenCalled();
      },
    );

    it('accepts a numeric-string ad count from the JSON body', async () => {
      prisma.planPackage.findFirst.mockResolvedValue({
        id: 'pkg-gold-5',
        adsCount: 5,
        price: 50,
      });

      await service.createCharge(
        'user-1',
        'gold',
        'buyootna://payment-callback',
        undefined,
        '5',
      );

      expect(prisma.planPackage.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { planId: 'plan-gold', adsCount: 5, isActive: true },
        }),
      );
    });

    it('falls back to the plan price when no package is sent (older clients)', async () => {
      await service.createCharge(
        'user-1',
        'gold',
        'buyootna://payment-callback',
      );

      expect(prisma.planPackage.findFirst).not.toHaveBeenCalled();
      expect(prisma.invoice.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amount: 12,
          planId: 'plan-gold',
          planPackageId: null,
        }),
      });
    });

    it('grants the package ad count immediately for a free package', async () => {
      prisma.planPackage.findFirst.mockResolvedValue({
        id: 'pkg-free',
        adsCount: 3,
        price: 0,
      });

      const result = await service.createCharge(
        'user-1',
        'gold',
        'buyootna://payment-callback',
        undefined,
        3,
      );

      expect(fetchMock).not.toHaveBeenCalled();
      expect(tx.userPlanSlot.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ planId: 'plan-gold', adsRemaining: 3 }),
      });
      expect(result.status).toBe('PAID');
    });
  });

  describe('handleWebhook fulfillment', () => {
    it('adds the purchased package ad count to the wallet', async () => {
      prisma.invoice.findUnique.mockResolvedValue({
        id: 'inv-1',
        invoiceNo: 'INV-1',
        status: 'PENDING',
        planName: 'الذهبية',
        planId: 'plan-gold',
        userId: 'user-1',
        planPackage: { id: 'pkg-gold-5', adsCount: 5 },
      });

      await service.handleWebhook({
        id: 'chg_1',
        status: 'CAPTURED',
        reference: { transaction: 'inv-1' },
      });

      expect(prisma.plan.findUnique).toHaveBeenCalledWith({
        where: { id: 'plan-gold' },
      });
      expect(tx.userPlanSlot.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          planId: 'plan-gold',
          adsRemaining: 5,
          invoiceId: 'inv-1',
        }),
      });
    });

    it('falls back to name matching and plan.maxActiveAds for legacy invoices', async () => {
      prisma.invoice.findUnique.mockResolvedValue({
        id: 'inv-old',
        invoiceNo: 'INV-OLD',
        status: 'PENDING',
        planName: 'الذهبية',
        planId: null,
        userId: 'user-1',
        planPackage: null,
      });
      prisma.plan.findFirst.mockResolvedValue({ ...goldPlan, maxActiveAds: 4 });

      await service.handleWebhook({
        id: 'chg_2',
        status: 'CAPTURED',
        reference: { transaction: 'inv-old' },
      });

      expect(prisma.plan.findFirst).toHaveBeenCalled();
      expect(tx.userPlanSlot.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ adsRemaining: 4 }),
      });
    });

    it('does nothing for an already-paid invoice', async () => {
      prisma.invoice.findUnique.mockResolvedValue({
        id: 'inv-1',
        status: 'PAID',
      });

      await service.handleWebhook({
        id: 'chg_1',
        status: 'CAPTURED',
        reference: { transaction: 'inv-1' },
      });

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
