import { BadRequestException } from '@nestjs/common';
import type { DiscountCode, DiscountPurpose } from '@prisma/client';

/** What a code takes off a price, and what is left to pay (KWD). */
export interface DiscountQuote {
  discount: number;
  total: number;
}

/** Codes are typed any case; stored and matched upper-case. */
export function normalizeDiscountCode(input?: string | null): string {
  return (input ?? '').trim().toUpperCase();
}

/** KWD has 3 decimals (fils). */
export function roundKwd(amount: number): number {
  return Math.round(amount * 1000) / 1000;
}

/** The checks a code fails, as the user should read them. */
export const DISCOUNT_ERRORS = {
  invalid: 'كود الخصم غير صحيح',
  notStarted: 'كود الخصم غير متاح بعد',
  expired: 'انتهت صلاحية كود الخصم',
  usedUp: 'تم استخدام كود الخصم بالكامل',
  usedByYou: 'سبق أن استخدمت كود الخصم هذا',
  notForThis: 'كود الخصم لا ينطبق على هذا الشراء',
  minAmount: (min: number) => `كود الخصم يتطلب مبلغاً لا يقل عن ${min} د.ك`,
} as const;

/**
 * Whether `code` can be used now for this purchase, given how many paid uses
 * it has by this account; throws the reason it can't.
 */
export function assertDiscountUsable(
  code: Pick<
    DiscountCode,
    | 'isActive'
    | 'startsAt'
    | 'expiresAt'
    | 'maxUses'
    | 'usedCount'
    | 'onePerAccount'
    | 'appliesTo'
    | 'minAmount'
  >,
  purpose: DiscountPurpose,
  amount: number,
  usesByAccount: number,
  now = new Date(),
): void {
  if (!code.isActive) throw new BadRequestException(DISCOUNT_ERRORS.invalid);
  if (code.startsAt && code.startsAt > now) {
    throw new BadRequestException(DISCOUNT_ERRORS.notStarted);
  }
  if (code.expiresAt && code.expiresAt <= now) {
    throw new BadRequestException(DISCOUNT_ERRORS.expired);
  }
  if (code.maxUses !== null && code.usedCount >= code.maxUses) {
    throw new BadRequestException(DISCOUNT_ERRORS.usedUp);
  }
  if (code.onePerAccount && usesByAccount > 0) {
    throw new BadRequestException(DISCOUNT_ERRORS.usedByYou);
  }
  if (!code.appliesTo.includes(purpose)) {
    throw new BadRequestException(DISCOUNT_ERRORS.notForThis);
  }
  if (code.minAmount !== null && amount < code.minAmount) {
    throw new BadRequestException(DISCOUNT_ERRORS.minAmount(code.minAmount));
  }
}

/** What the code takes off `amount`: never more than the price itself. */
export function computeDiscount(
  code: Pick<DiscountCode, 'type' | 'value' | 'maxDiscount'>,
  amount: number,
): DiscountQuote {
  let discount =
    code.type === 'PERCENT' ? (amount * code.value) / 100 : code.value;
  if (code.type === 'PERCENT' && code.maxDiscount !== null) {
    discount = Math.min(discount, code.maxDiscount);
  }
  discount = roundKwd(Math.min(Math.max(discount, 0), amount));
  return { discount, total: roundKwd(amount - discount) };
}
