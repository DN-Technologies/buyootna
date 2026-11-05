import { BadRequestException } from '@nestjs/common';
import {
  assertDiscountUsable,
  computeDiscount,
  DISCOUNT_ERRORS,
  normalizeDiscountCode,
} from './discounts.rules';
import { enabledPaymentMethods, tapSourceFor } from './payment-methods';

const base = {
  isActive: true,
  startsAt: null as Date | null,
  expiresAt: null as Date | null,
  maxUses: null as number | null,
  usedCount: 0,
  onePerAccount: true,
  appliesTo: ['PLAN', 'FEATURE'] as ('PLAN' | 'SUBSCRIPTION' | 'FEATURE')[],
  minAmount: null as number | null,
};
const now = new Date('2026-11-06T12:00:00.000Z');

const refusal = (fn: () => void) => {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(BadRequestException);
    return (error as BadRequestException).message;
  }
  return null;
};

describe('discount rules', () => {
  it('reads a code in any case, trimmed', () => {
    expect(normalizeDiscountCode('  save25 ')).toBe('SAVE25');
    expect(normalizeDiscountCode(undefined)).toBe('');
  });

  it('a usable code passes', () => {
    expect(
      refusal(() => assertDiscountUsable(base, 'PLAN', 5, 0, now)),
    ).toBeNull();
  });

  it.each([
    ['inactive', { isActive: false }, 'PLAN', 5, 0, DISCOUNT_ERRORS.invalid],
    [
      'not started',
      { startsAt: new Date('2026-12-01') },
      'PLAN',
      5,
      0,
      DISCOUNT_ERRORS.notStarted,
    ],
    [
      'expired',
      { expiresAt: new Date('2026-11-01') },
      'PLAN',
      5,
      0,
      DISCOUNT_ERRORS.expired,
    ],
    [
      'used up',
      { maxUses: 10, usedCount: 10 },
      'PLAN',
      5,
      0,
      DISCOUNT_ERRORS.usedUp,
    ],
    ['used by this account', {}, 'PLAN', 5, 1, DISCOUNT_ERRORS.usedByYou],
    [
      'not for subscriptions',
      {},
      'SUBSCRIPTION',
      5,
      0,
      DISCOUNT_ERRORS.notForThis,
    ],
    [
      'under the minimum',
      { minAmount: 10 },
      'PLAN',
      5,
      0,
      DISCOUNT_ERRORS.minAmount(10),
    ],
  ] as const)(
    'refuses a code that is %s',
    (_, patch, purpose, amount, uses, message) => {
      expect(
        refusal(() =>
          assertDiscountUsable(
            { ...base, ...patch },
            purpose,
            amount,
            uses,
            now,
          ),
        ),
      ).toBe(message);
    },
  );

  it('a code not limited to one per account can be used again', () => {
    expect(
      refusal(() =>
        assertDiscountUsable(
          { ...base, onePerAccount: false },
          'PLAN',
          5,
          3,
          now,
        ),
      ),
    ).toBeNull();
  });

  it('percent, capped percent and fixed discounts, in fils', () => {
    expect(
      computeDiscount({ type: 'PERCENT', value: 25, maxDiscount: null }, 12),
    ).toEqual({
      discount: 3,
      total: 9,
    });
    expect(
      computeDiscount({ type: 'PERCENT', value: 50, maxDiscount: 2 }, 12),
    ).toEqual({
      discount: 2,
      total: 10,
    });
    expect(
      computeDiscount({ type: 'PERCENT', value: 15, maxDiscount: null }, 7.5),
    ).toEqual({
      discount: 1.125,
      total: 6.375,
    });
    expect(
      computeDiscount({ type: 'FIXED', value: 2, maxDiscount: null }, 5),
    ).toEqual({
      discount: 2,
      total: 3,
    });
  });

  it('never takes off more than the price', () => {
    expect(
      computeDiscount({ type: 'FIXED', value: 50, maxDiscount: null }, 12),
    ).toEqual({
      discount: 12,
      total: 0,
    });
  });
});

describe('payment methods', () => {
  it('offers every method unless TAP_SOURCES narrows them', () => {
    expect(enabledPaymentMethods(undefined)).toEqual([
      'apple_pay',
      'google_pay',
      'card',
      'knet',
    ]);
    expect(enabledPaymentMethods(' Card , knet, paypal ')).toEqual([
      'card',
      'knet',
    ]);
  });

  it("maps a method to its Tap source, and an older app's sourceId too", () => {
    const all = enabledPaymentMethods(undefined);
    expect(tapSourceFor('knet', undefined, all)).toBe('src_kw.knet');
    expect(tapSourceFor('card', 'src_all', all)).toBe('src_card');
    expect(tapSourceFor(undefined, 'src_kw.knet', all)).toBe('src_kw.knet');
    expect(tapSourceFor(undefined, 'src_anything', all)).toBe('src_all');
    expect(tapSourceFor(undefined, undefined, all)).toBe('src_all');
  });

  it('refuses a method that is unknown or not offered', () => {
    expect(() => tapSourceFor('paypal', undefined, ['card'])).toThrow(
      'طريقة الدفع غير متاحة',
    );
    expect(() => tapSourceFor('apple_pay', undefined, ['card'])).toThrow(
      'طريقة الدفع غير متاحة',
    );
  });
});
