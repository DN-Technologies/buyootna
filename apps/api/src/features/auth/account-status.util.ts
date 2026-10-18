import { ForbiddenException } from '@nestjs/common';
import type { IdentityType, User } from '@prisma/client';

/**
 * The account's state, derived from the stored flags:
 * - deactivated_by_user: the owner suspended it (suspendedAt set); signing
 *   in, or reaching suspendedUntil, brings it back
 * - suspended_by_admin: an admin disabled it; only an admin undoes that
 * - blocked: an admin banned it
 */
export type AccountStatus =
  'active' | 'deactivated_by_user' | 'suspended_by_admin' | 'blocked';

export function accountStatus(
  user: Pick<User, 'isDisabled' | 'isBlocked' | 'suspendedAt'>,
): AccountStatus {
  if (user.isBlocked) return 'blocked';
  if (user.isDisabled) {
    return user.suspendedAt ? 'deactivated_by_user' : 'suspended_by_admin';
  }
  return 'active';
}

export const SUSPENDED_BY_ADMIN_MESSAGE =
  'تم إيقاف حسابك من قبل الإدارة. يرجى التواصل مع الدعم.';

/** Login refusal for an account an admin suspended or blocked. */
export function suspendedByAdminError() {
  return new ForbiddenException({
    statusCode: 403,
    code: 'ACCOUNT_SUSPENDED_BY_ADMIN',
    message: SUSPENDED_BY_ADMIN_MESSAGE,
  });
}

const IDENTITY_TYPE_LABELS: Record<IdentityType, string> = {
  INDIVIDUAL: 'فرد',
  COMPANY: 'شركة',
  OFFICE: 'مكتب',
};

/**
 * The login screen asked for a persona (فرد / مكتب / شركة) this account
 * doesn't have. `availableTypes` lets the app offer the ones it does.
 */
export function identityTypeNotFoundError(
  requested: IdentityType,
  availableTypes: IdentityType[],
) {
  return new ForbiddenException({
    statusCode: 403,
    code: 'IDENTITY_TYPE_NOT_FOUND',
    message: `لا يوجد حساب ${IDENTITY_TYPE_LABELS[requested]} مرتبط بهذا الحساب. اختر نوع حساب آخر أو أضف هذا الحساب من المزيد بعد تسجيل الدخول.`,
    requestedType: requested,
    availableTypes,
  });
}

/** Whole days until `until`, rounded up (2.1 days left -> 3). */
export function daysUntil(until: Date, now = new Date()): number {
  return Math.max(1, Math.ceil((until.getTime() - now.getTime()) / 86_400_000));
}

/** "يوم واحد" / "يومين" / "3 أيام" / "14 يوماً" */
export function arabicDays(n: number): string {
  if (n === 1) return 'يوم واحد';
  if (n === 2) return 'يومين';
  if (n <= 10) return `${n} أيام`;
  return `${n} يوماً`;
}
