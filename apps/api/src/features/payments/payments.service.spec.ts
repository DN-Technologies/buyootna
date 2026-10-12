import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { FeatureCheckoutService } from './services/feature-checkout.service';
import { PaymentFulfillmentService } from './services/payment-fulfillment.service';
import { PlanCheckoutService } from './services/plan-checkout.service';
import { SubscriptionCheckoutService } from './services/subscription-checkout.service';
import { TapGatewayService } from './services/tap-gateway.service';

const DAY_MS = 24 * 60 * 60 * 1000;

// expect.objectContaining is typed `any`; keep assertions type-safe
const containing = <T extends object>(shape: T): T =>
  expect.objectContaining(shape) as T;

describe('PaymentsService', () => {
  let service: PaymentsService;
  let fetchMock: jest.Mock;

  const tx = {
    invoice: { updateMany: jest.fn() },
    userPlanSlot: { create: jest.fn() },
    user: { update: jest.fn() },
    property: { findUnique: jest.fn(), update: jest.fn() },
    companySubscription: { findFirst: jest.fn(), create: jest.fn() },
  };

  const prisma = {
    user: { findUnique: jest.fn() },
    plan: { findUnique: jest.fn(), findFirst: jest.fn() },
    planPackage: { findFirst: jest.fn() },
    featurePackage: { findMany: jest.fn(), findFirst: jest.fn() },
    property: { findUnique: jest.fn() },
    identity: { findUnique: jest.fn() },
    companyPlan: { findFirst: jest.fn(), findUnique: jest.fn() },
    invoice: { create: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn() },
    $transaction: jest.fn((fn: (t: typeof tx) => Promise<unknown>) => fn(tx)),
  };

  const goldPlan = {
    id: 'plan-gold',
    slug: 'gold',
    name: 'الذهبية',
    price: 12,
    maxActiveAds: 1,
  };

  const weekPackage = {
    id: 'feature-week',
    label: 'تمييز لاسبوع',
    description: 'ظهور أقوى لمدة أطول.',
    durationDays: 7,
    price: 3,
    isActive: true,
  };

  const tapCreatesCharge = () =>
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          id: 'chg_1',
          transaction: { url: 'https://tap/checkout' },
        }),
    });

  // What GET /v2/charges/:id returns when the webhook/redirect is verified
  const tapReportsCharge = (status: string, invoiceId: string) =>
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          id: 'chg_1',
          status,
          reference: { transaction: invoiceId },
        }),
    });

  const tapBody = () =>
    JSON.parse(
      (fetchMock.mock.calls[0] as [string, { body: string }])[1].body,
    ) as {
      amount: number;
      redirect: { url: string };
      metadata: Record<string, string>;
    };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.TAP_SECRET_KEY = 'sk_test_123';
    process.env.BACKEND_URL = 'https://api.example.test';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        TapGatewayService,
        PaymentFulfillmentService,
        PlanCheckoutService,
        FeatureCheckoutService,
        SubscriptionCheckoutService,
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
    tx.invoice.updateMany.mockResolvedValue({ count: 1 });

    fetchMock = jest.fn();
    tapCreatesCharge();
    global.fetch = fetchMock;
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
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
        'identity-1',
        'gold',
        'buyootna://payment-callback',
        undefined,
        5,
      );

      expect(prisma.planPackage.findFirst).toHaveBeenCalledWith(
        containing({
          where: { planId: 'plan-gold', adsCount: 5, isActive: true },
        }),
      );
      expect(prisma.invoice.create).toHaveBeenCalledWith({
        data: containing({
          amount: 50,
          planId: 'plan-gold',
          planPackageId: 'pkg-gold-5',
          planDetails: 'باقة الذهبية - 5 إعلانات',
          identityId: 'identity-1',
        }),
      });
      expect(tapBody().amount).toBe(50);
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
          'identity-1',
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
            'identity-1',
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
        'identity-1',
        'gold',
        'buyootna://payment-callback',
        undefined,
        '5',
      );

      expect(prisma.planPackage.findFirst).toHaveBeenCalledWith(
        containing({
          where: { planId: 'plan-gold', adsCount: 5, isActive: true },
        }),
      );
    });

    it('falls back to the plan price when no package is sent (older clients)', async () => {
      await service.createCharge(
        'user-1',
        'identity-1',
        'gold',
        'buyootna://payment-callback',
      );

      expect(prisma.planPackage.findFirst).not.toHaveBeenCalled();
      expect(prisma.invoice.create).toHaveBeenCalledWith({
        data: containing({
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
      prisma.invoice.findUnique.mockResolvedValue({
        id: 'inv-1',
        invoiceNo: 'INV-1',
        status: 'PENDING',
        planName: 'الذهبية',
        planId: 'plan-gold',
        userId: 'user-1',
        identityId: 'identity-1',
        planPackage: { id: 'pkg-free', adsCount: 3 },
      });

      const result = await service.createCharge(
        'user-1',
        'identity-1',
        'gold',
        'buyootna://payment-callback',
        undefined,
        3,
      );

      expect(fetchMock).not.toHaveBeenCalled();
      expect(tx.userPlanSlot.create).toHaveBeenCalledWith({
        // Credited to the persona that bought it
        data: containing({
          planId: 'plan-gold',
          adsRemaining: 3,
          identityId: 'identity-1',
        }),
      });
      expect(result.status).toBe('PAID');
    });

    it('sends Tap a well-formed redirect back to the API', async () => {
      await service.createCharge(
        'user-1',
        'identity-1',
        'gold',
        'buyootna://payment-callback',
      );

      const redirect = new URL(tapBody().redirect.url);
      expect(redirect.origin + redirect.pathname).toBe(
        'https://api.example.test/payments/redirect',
      );
      expect(redirect.searchParams.get('invoiceId')).toBe('inv-1');
      expect(redirect.searchParams.get('appRedirectUrl')).toBe(
        'buyootna://payment-callback',
      );
      expect(redirect.searchParams.has('purpose')).toBe(false);
    });
  });

  describe('feature an ad', () => {
    beforeEach(() => {
      prisma.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        identityId: 'identity-1',
        status: 'ACTIVE',
      });
      prisma.featurePackage.findFirst.mockResolvedValue(weekPackage);
    });

    const featureCharge = (propertyId = 'prop-1', identityId = 'identity-1') =>
      service.createFeatureCharge(
        'user-1',
        identityId,
        propertyId,
        'feature-week',
        'buyootna://payment-callback',
      );

    it('lists the active packages in order', async () => {
      prisma.featurePackage.findMany.mockResolvedValue([weekPackage]);

      await service.getFeaturePackages();

      expect(prisma.featurePackage.findMany).toHaveBeenCalledWith(
        containing({
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { durationDays: 'asc' }],
        }),
      );
    });

    it('charges the package price from the DB and records what was bought', async () => {
      const result = await featureCharge();

      expect(prisma.invoice.create).toHaveBeenCalledWith({
        data: containing({
          amount: 3,
          planName: 'تمييز الإعلان',
          planDetails: 'تمييز لاسبوع',
          identityId: 'identity-1',
          featurePackageId: 'feature-week',
          propertyId: 'prop-1',
          featureDays: 7,
        }),
      });
      const body = tapBody();
      expect(body.amount).toBe(3);
      expect(body.metadata).toMatchObject({
        featurePackageId: 'feature-week',
        propertyId: 'prop-1',
      });
      expect(new URL(body.redirect.url).searchParams.get('purpose')).toBe(
        'feature',
      );
      expect(result).toEqual({
        checkoutUrl: 'https://tap/checkout',
        invoiceId: 'inv-1',
        status: 'PENDING',
      });
    });

    it("refuses to feature someone else's ad", async () => {
      await expect(
        featureCharge('prop-1', 'identity-other'),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.invoice.create).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it.each(['DRAFT', 'EXPIRED'])('refuses a %s ad', async (status) => {
      prisma.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        identityId: 'identity-1',
        status,
      });

      await expect(featureCharge()).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.invoice.create).not.toHaveBeenCalled();
    });

    it('refuses an unknown ad or an inactive package', async () => {
      prisma.property.findUnique.mockResolvedValueOnce(null);
      await expect(featureCharge()).rejects.toBeInstanceOf(NotFoundException);

      prisma.featurePackage.findFirst.mockResolvedValueOnce(null);
      await expect(featureCharge()).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.invoice.create).not.toHaveBeenCalled();
    });

    it('features the ad straight away for a free package', async () => {
      prisma.featurePackage.findFirst.mockResolvedValue({
        ...weekPackage,
        price: 0,
      });
      prisma.invoice.findUnique.mockResolvedValue({
        id: 'inv-1',
        invoiceNo: 'INV-1',
        status: 'PENDING',
        featurePackageId: 'feature-week',
        propertyId: 'prop-1',
        featureDays: 7,
      });
      tx.property.findUnique.mockResolvedValue({ featuredUntil: null });

      const result = await featureCharge();

      expect(fetchMock).not.toHaveBeenCalled();
      expect(tx.property.update).toHaveBeenCalled();
      expect(result.status).toBe('PAID');
    });
  });

  describe('handleWebhook', () => {
    const planInvoice = {
      id: 'inv-1',
      invoiceNo: 'INV-1',
      status: 'PENDING',
      planName: 'الذهبية',
      planId: 'plan-gold',
      userId: 'user-1',
      featurePackageId: null,
      propertyId: null,
      planPackage: { id: 'pkg-gold-5', adsCount: 5 },
    };

    const webhook = (invoiceId = 'inv-1') =>
      service.handleWebhook({
        id: 'chg_1',
        status: 'CAPTURED',
        reference: { transaction: invoiceId },
      });

    it('adds the purchased package ad count to the wallet once Tap confirms it', async () => {
      tapReportsCharge('CAPTURED', 'inv-1');
      prisma.invoice.findUnique.mockResolvedValue(planInvoice);

      await webhook();

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.tap.company/v2/charges/chg_1',
        expect.anything() as RequestInit,
      );
      expect(prisma.plan.findUnique).toHaveBeenCalledWith({
        where: { id: 'plan-gold' },
      });
      expect(tx.userPlanSlot.create).toHaveBeenCalledWith({
        data: containing({
          planId: 'plan-gold',
          adsRemaining: 5,
          invoiceId: 'inv-1',
        }),
      });
    });

    it('ignores a forged "CAPTURED" body when Tap says the charge is not captured', async () => {
      tapReportsCharge('INITIATED', 'inv-1');
      prisma.invoice.findUnique.mockResolvedValue(planInvoice);

      const result = await webhook();

      expect(result.message).toBe('Status ignored');
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('ignores a captured charge that belongs to a different invoice', async () => {
      tapReportsCharge('CAPTURED', 'inv-someone-else');
      prisma.invoice.findUnique.mockResolvedValue(planInvoice);

      await webhook('inv-1');

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('rejects a payload without a charge id or invoice', async () => {
      const result = await service.handleWebhook({ status: 'CAPTURED' });

      expect(result.success).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('falls back to name matching and plan.maxActiveAds for legacy invoices', async () => {
      tapReportsCharge('CAPTURED', 'inv-old');
      prisma.invoice.findUnique.mockResolvedValue({
        ...planInvoice,
        id: 'inv-old',
        invoiceNo: 'INV-OLD',
        planId: null,
        planPackage: null,
      });
      prisma.plan.findFirst.mockResolvedValue({ ...goldPlan, maxActiveAds: 4 });

      await webhook('inv-old');

      expect(prisma.plan.findFirst).toHaveBeenCalled();
      expect(tx.userPlanSlot.create).toHaveBeenCalledWith({
        data: containing({ adsRemaining: 4 }),
      });
    });

    it('does nothing for an already-paid invoice', async () => {
      tapReportsCharge('CAPTURED', 'inv-1');
      prisma.invoice.findUnique.mockResolvedValue({
        id: 'inv-1',
        status: 'PAID',
      });

      await webhook();

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('grants nothing when a concurrent call already marked it paid', async () => {
      tapReportsCharge('CAPTURED', 'inv-1');
      prisma.invoice.findUnique.mockResolvedValue(planInvoice);
      tx.invoice.updateMany.mockResolvedValue({ count: 0 });

      await webhook();

      expect(tx.userPlanSlot.create).not.toHaveBeenCalled();
    });

    describe('feature invoices', () => {
      const featureInvoice = {
        id: 'inv-f',
        invoiceNo: 'INV-F',
        status: 'PENDING',
        featurePackageId: 'feature-week',
        propertyId: 'prop-1',
        featureDays: 7,
        planPackage: null,
      };

      // What fulfillment wrote to the featured ad
      const featureUpdate = () =>
        (
          tx.property.update.mock.calls as [
            { data: { isFeatured: boolean; featuredUntil: Date } },
          ][]
        )[0][0].data;

      beforeEach(() => {
        tapReportsCharge('CAPTURED', 'inv-f');
        prisma.invoice.findUnique.mockResolvedValue(featureInvoice);
      });

      it('features a not-yet-featured ad for the paid number of days', async () => {
        tx.property.findUnique.mockResolvedValue({ featuredUntil: null });
        const before = Date.now();

        await webhook('inv-f');

        const data = featureUpdate();
        expect(data.isFeatured).toBe(true);
        const until = data.featuredUntil.getTime();
        expect(until).toBeGreaterThanOrEqual(before + 7 * DAY_MS);
        expect(until).toBeLessThanOrEqual(Date.now() + 7 * DAY_MS);
        expect(tx.userPlanSlot.create).not.toHaveBeenCalled();
      });

      it('extends an ad that is still featured instead of resetting it', async () => {
        const currentEnd = new Date(Date.now() + 3 * DAY_MS);
        tx.property.findUnique.mockResolvedValue({ featuredUntil: currentEnd });

        await webhook('inv-f');

        const data = featureUpdate();
        expect(data.featuredUntil.getTime()).toBe(
          currentEnd.getTime() + 7 * DAY_MS,
        );
      });

      it('keeps the paid invoice when the ad was deleted in the meantime', async () => {
        prisma.invoice.findUnique.mockResolvedValue({
          ...featureInvoice,
          propertyId: null,
        });

        await webhook('inv-f');

        expect(tx.invoice.updateMany).toHaveBeenCalled();
        expect(tx.property.update).not.toHaveBeenCalled();
      });
    });
  });

  describe('verifyChargeAndRedirect', () => {
    it('fulfils a verified charge and sends the app the outcome', async () => {
      tapReportsCharge('CAPTURED', 'inv-1');
      prisma.invoice.findUnique.mockResolvedValue({
        id: 'inv-1',
        status: 'PAID',
      });

      const url = await service.verifyChargeAndRedirect(
        'chg_1',
        'inv-1',
        'buyootna://payment-callback',
        'feature',
      );

      expect(url).toBe(
        'buyootna://payment-callback?status=success&invoiceId=inv-1&purpose=feature',
      );
    });

    it('reports failure when Tap does not confirm the charge', async () => {
      tapReportsCharge('DECLINED', 'inv-1');

      const url = await service.verifyChargeAndRedirect(
        'chg_1',
        'inv-1',
        'exp://192.168.1.2:8081/--/payment-callback?x=1',
      );

      expect(url).toBe(
        'exp://192.168.1.2:8081/--/payment-callback?x=1&status=failed&invoiceId=inv-1',
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('company subscription', () => {
    const annual = {
      id: 'plan-annual',
      name: 'السنوية',
      durationMonths: 12,
      price: 100,
      isActive: true,
    };
    const subscribe = () =>
      service.createSubscriptionCharge(
        'user-1',
        'company-1',
        'plan-annual',
        'https://companies.example.test/plans/callback',
      );

    beforeEach(() => {
      prisma.identity.findUnique.mockResolvedValue({ type: 'COMPANY' });
      prisma.companyPlan.findFirst.mockResolvedValue(annual);
      prisma.companyPlan.findUnique.mockResolvedValue(annual);
      prisma.invoice.create.mockResolvedValue({
        id: 'inv-sub',
        invoiceNo: 'INV-SUB',
      });
    });

    it('charges the plan price from the DB and records the plan on the invoice', async () => {
      tapCreatesCharge();

      const result = await subscribe();

      expect(result.checkoutUrl).toBe('https://tap/checkout');
      expect(tapBody().amount).toBe(100);
      expect(tapBody().redirect.url).toContain('purpose=subscription');
      expect(prisma.invoice.create).toHaveBeenCalledWith({
        data: containing({
          amount: 100,
          companyPlanId: 'plan-annual',
          identityId: 'company-1',
          status: 'PENDING',
        }),
      });
    });

    it('refuses a persona that is not a company', async () => {
      prisma.identity.findUnique.mockResolvedValue({ type: 'INDIVIDUAL' });

      await expect(subscribe()).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.invoice.create).not.toHaveBeenCalled();
    });

    it('refuses an unknown or inactive plan', async () => {
      prisma.companyPlan.findFirst.mockResolvedValue(null);

      await expect(subscribe()).rejects.toBeInstanceOf(NotFoundException);
    });

    const paidInvoice = {
      id: 'inv-sub',
      invoiceNo: 'INV-SUB',
      status: 'PENDING',
      identityId: 'company-1',
      companyPlanId: 'plan-annual',
      planPackage: null,
    };
    const webhook = () =>
      service.handleWebhook({
        id: 'chg_1',
        status: 'CAPTURED',
        reference: { transaction: 'inv-sub' },
      });
    const createdPeriod = () =>
      (
        tx.companySubscription.create.mock.calls[0] as [
          { data: { startsAt: Date; endsAt: Date; kind: string } },
        ]
      )[0].data;

    it('starts the paid period now when the company has no cover left', async () => {
      tapReportsCharge('CAPTURED', 'inv-sub');
      prisma.invoice.findUnique.mockResolvedValue(paidInvoice);
      tx.invoice.updateMany.mockResolvedValue({ count: 1 });
      tx.companySubscription.findFirst.mockResolvedValue(null);

      await webhook();

      const period = createdPeriod();
      expect(period.kind).toBe('PAID');
      expect(Math.abs(period.startsAt.getTime() - Date.now())).toBeLessThan(
        5000,
      );
      expect(period.endsAt.getFullYear()).toBe(
        period.startsAt.getFullYear() + 1,
      );
    });

    it('adds the period after the current cover instead of replacing it', async () => {
      const coveredUntil = new Date(Date.now() + 20 * DAY_MS);
      tapReportsCharge('CAPTURED', 'inv-sub');
      prisma.invoice.findUnique.mockResolvedValue(paidInvoice);
      tx.invoice.updateMany.mockResolvedValue({ count: 1 });
      tx.companySubscription.findFirst.mockResolvedValue({
        endsAt: coveredUntil,
      });

      await webhook();

      expect(createdPeriod().startsAt).toEqual(coveredUntil);
    });

    it('grants nothing when the redirect already fulfilled the invoice', async () => {
      tapReportsCharge('CAPTURED', 'inv-sub');
      prisma.invoice.findUnique.mockResolvedValue(paidInvoice);
      // The other call flipped the invoice to PAID first
      tx.invoice.updateMany.mockResolvedValue({ count: 0 });

      await webhook();

      expect(tx.companySubscription.create).not.toHaveBeenCalled();
    });

    it('sends the app back with the subscription purpose', async () => {
      tapReportsCharge('CAPTURED', 'inv-sub');
      prisma.invoice.findUnique.mockResolvedValue({
        ...paidInvoice,
        status: 'PAID',
      });

      const url = await service.verifyChargeAndRedirect(
        'chg_1',
        'inv-sub',
        'buyootna://payment-callback',
        'subscription',
      );

      expect(url).toBe(
        'buyootna://payment-callback?status=success&invoiceId=inv-sub&purpose=subscription',
      );
    });
  });
});
