import { Prisma } from '@prisma/client';

/**
 * A credit that can still be spent: active, ads left, and not past its
 * validity (an office bundle's «صلاحية انتهاء الباقة»; null = none). The
 * daily job marks expired ones EXPIRED; this keeps them unusable before it
 * runs.
 */
export function usableSlotWhere(
  now = new Date(),
): Prisma.UserPlanSlotWhereInput {
  return {
    status: 'ACTIVE',
    adsRemaining: { gt: 0 },
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  };
}

export function isSlotUsable(
  slot: { status: string; adsRemaining: number; expiresAt?: Date | null },
  now = new Date(),
): boolean {
  return (
    slot.status === 'ACTIVE' &&
    slot.adsRemaining > 0 &&
    (slot.expiresAt == null || slot.expiresAt > now)
  );
}

/** When a package bought now stops being usable: `validityMonths` on. */
export function slotExpiry(
  validityMonths: number | null | undefined,
  from: Date,
): Date | null {
  if (!validityMonths || validityMonths <= 0) return null;
  const end = new Date(from);
  // In UTC: local months move the hour across a daylight-saving change
  end.setUTCMonth(end.getUTCMonth() + validityMonths);
  return end;
}
