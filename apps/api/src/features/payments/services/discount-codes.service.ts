import { BadRequestException, Injectable } from '@nestjs/common';
import type { DiscountPurpose } from '@prisma/client';

import { PrismaService } from '../../../core/prisma/prisma.service';
import {
  assertDiscountUsable,
  computeDiscount,
  DISCOUNT_ERRORS,
  normalizeDiscountCode,
} from '../discounts.rules';

export interface PricedWithDiscount {
  price: number;
  discount: number;
  total: number;
  // The code applied, upper-case; null without one
  code: string | null;
  codeId: string | null;
}

/** «كود الخصم»: checks a code for a purchase and works out what's left to pay. */
@Injectable()
export class DiscountCodesService {
  constructor(private readonly prisma: PrismaService) {}

  async price(
    input: string | undefined | null,
    purpose: DiscountPurpose,
    price: number,
    userId: string,
  ): Promise<PricedWithDiscount> {
    const code = normalizeDiscountCode(input);
    if (!code) {
      return { price, discount: 0, total: price, code: null, codeId: null };
    }

    const row = await this.prisma.discountCode.findUnique({ where: { code } });
    if (!row) throw new BadRequestException(DISCOUNT_ERRORS.invalid);

    const usesByAccount = row.onePerAccount
      ? await this.prisma.discountRedemption.count({
          where: { codeId: row.id, userId },
        })
      : 0;
    assertDiscountUsable(row, purpose, price, usesByAccount);

    return { price, ...computeDiscount(row, price), code, codeId: row.id };
  }
}

/** The invoice fields for a priced purchase (amount is what is charged). */
export function invoiceAmountFields(priced: PricedWithDiscount) {
  const discounted = priced.discount > 0;
  return {
    amount: priced.total,
    originalAmount: discounted ? priced.price : null,
    discountAmount: discounted ? priced.discount : null,
    discountCodeId: discounted ? priced.codeId : null,
  };
}
