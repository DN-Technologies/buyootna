import { IdentityType, Prisma, Role } from '@prisma/client';

/**
 * Matches every account that is, or has added, a persona of this type.
 *
 * `User.role` is only set when an account is registered, so an individual who
 * later adds a company from inside the app keeps `role = INDIVIDUAL` while
 * owning a COMPANY identity. Filtering and counting on `role` alone hid those
 * accounts (and their pending company) from the admin lists.
 */
export function hasAccountType(role: Role): Prisma.UserWhereInput {
  return {
    OR: [{ role }, { identities: { some: { type: role } } }],
  };
}

export const ACCOUNT_TYPE_LABELS: Record<Role, 'فرد' | 'شركة' | 'مكتب عقاري'> =
  {
    [Role.INDIVIDUAL]: 'فرد',
    [Role.COMPANY]: 'شركة',
    [Role.OFFICE]: 'مكتب عقاري',
  };

/** Company wins over office, office over individual: the admin's "type". */
export function accountTypeOf(
  role: Role | null,
  identities: { type: IdentityType }[],
): 'فرد' | 'شركة' | 'مكتب عقاري' {
  const has = (type: IdentityType) => identities.some((i) => i.type === type);
  if (role === Role.COMPANY || has(IdentityType.COMPANY)) return 'شركة';
  if (role === Role.OFFICE || has(IdentityType.OFFICE)) return 'مكتب عقاري';
  return 'فرد';
}
