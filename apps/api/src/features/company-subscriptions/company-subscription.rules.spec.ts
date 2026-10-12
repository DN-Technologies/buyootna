import { ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  addMonths,
  assertActiveCompanySubscription,
  getCompanySubscriptionState,
  grantTrialIfNew,
  TRIAL_DAYS,
} from './company-subscription.rules';

const DAY_MS = 24 * 60 * 60 * 1000;
const now = new Date('2026-10-12T09:00:00Z');
const inDays = (days: number) => new Date(now.getTime() + days * DAY_MS);
const annual = {
  id: 'annual',
  name: 'السنوية',
  price: 100,
  durationMonths: 12,
  features: ['اصدار الفواتير.'],
};

describe('company subscription rules', () => {
  const companySubscription = {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
  };
  const identity = { findUnique: jest.fn() };
  const db = { companySubscription, identity } as unknown as PrismaClient;

  beforeEach(() => {
    jest.clearAllMocks();
    identity.findUnique.mockResolvedValue({ type: 'COMPANY' });
  });

  describe('getCompanySubscriptionState', () => {
    it('is NONE for a company that never had a period', async () => {
      companySubscription.findMany.mockResolvedValue([]);

      expect(await getCompanySubscriptionState(db, 'c1', now)).toEqual({
        status: 'NONE',
        currentPlanId: null,
        plan: null,
        endsAt: null,
        daysLeft: 0,
      });
    });

    it('is TRIAL while only the free period is running', async () => {
      companySubscription.findMany.mockResolvedValue([
        { kind: 'TRIAL', companyPlanId: null, endsAt: inDays(12) },
      ]);

      expect(await getCompanySubscriptionState(db, 'c1', now)).toMatchObject({
        status: 'TRIAL',
        currentPlanId: null,
        daysLeft: 12,
      });
    });

    it('is ACTIVE on the latest paid plan, covered until the last period ends', async () => {
      companySubscription.findMany.mockResolvedValue([
        {
          kind: 'PAID',
          companyPlanId: 'annual',
          endsAt: inDays(400),
          companyPlan: annual,
        },
        { kind: 'PAID', companyPlanId: 'quarterly', endsAt: inDays(35) },
        { kind: 'TRIAL', companyPlanId: null, endsAt: inDays(-10) },
      ]);

      expect(await getCompanySubscriptionState(db, 'c1', now)).toEqual({
        status: 'ACTIVE',
        currentPlanId: 'annual',
        plan: annual,
        endsAt: inDays(400),
        daysLeft: 400,
      });
    });

    it('is EXPIRED once the last period has ended', async () => {
      companySubscription.findMany.mockResolvedValue([
        {
          kind: 'PAID',
          companyPlanId: 'annual',
          endsAt: inDays(-1),
          companyPlan: annual,
        },
      ]);

      // The plan it was on stays known, to offer renewing it
      expect(await getCompanySubscriptionState(db, 'c1', now)).toMatchObject({
        status: 'EXPIRED',
        currentPlanId: null,
        plan: annual,
        daysLeft: 0,
      });
    });

    it('has no plan when only the trial ever ran', async () => {
      companySubscription.findMany.mockResolvedValue([
        { kind: 'TRIAL', companyPlanId: null, endsAt: inDays(-3) },
      ]);

      expect(await getCompanySubscriptionState(db, 'c1', now)).toMatchObject({
        status: 'EXPIRED',
        plan: null,
      });
    });
  });

  describe('assertActiveCompanySubscription', () => {
    it('lets a covered company through', async () => {
      companySubscription.findFirst.mockResolvedValue({ id: 'p1' });

      await expect(
        assertActiveCompanySubscription(db, 'c1'),
      ).resolves.toBeUndefined();
    });

    it('refuses an uncovered company with a code the app can act on', async () => {
      companySubscription.findFirst.mockResolvedValue(null);

      const error = await assertActiveCompanySubscription(db, 'c1').catch(
        (e: unknown) => e,
      );

      expect(error).toBeInstanceOf(ForbiddenException);
      expect((error as ForbiddenException).getResponse()).toMatchObject({
        code: 'SUBSCRIPTION_REQUIRED',
      });
    });

    it('never gates an office or an individual', async () => {
      identity.findUnique.mockResolvedValue({ type: 'OFFICE' });

      await expect(
        assertActiveCompanySubscription(db, 'o1'),
      ).resolves.toBeUndefined();
      expect(companySubscription.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('grantTrialIfNew', () => {
    it('starts a trial for a company with no period yet', async () => {
      companySubscription.findFirst.mockResolvedValue(null);

      await grantTrialIfNew(db, 'c1', now);

      expect(companySubscription.create).toHaveBeenCalledWith({
        data: {
          identityId: 'c1',
          kind: 'TRIAL',
          startsAt: now,
          endsAt: inDays(TRIAL_DAYS),
        },
      });
    });

    it('does not hand out a second trial', async () => {
      companySubscription.findFirst.mockResolvedValue({ id: 'p1' });

      await grantTrialIfNew(db, 'c1', now);

      expect(companySubscription.create).not.toHaveBeenCalled();
    });
  });

  it('adds calendar months', () => {
    expect(addMonths(new Date('2026-10-12T00:00:00Z'), 3)).toEqual(
      new Date('2027-01-12T00:00:00Z'),
    );
    // The 30th of November has no match in February
    expect(addMonths(new Date('2026-11-30T00:00:00Z'), 3)).toEqual(
      new Date('2027-02-28T00:00:00Z'),
    );
  });
});
