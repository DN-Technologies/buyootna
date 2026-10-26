import { IDENTITY_TYPE_LABELS } from '@/components/users/IdentitySwitcher'
import { formatRelativeArabicTime } from '@/lib/admin-dashboard'
import type { AdminUserDetail, AdminUserIdentity } from '@/lib/admin-users'
import type { UserRole } from './constants'

/**
 * The persona the page shows: `?identity=` when it's one of the account's,
 * else the one the app opens by default (the individual, else the first).
 */
export function selectIdentity(
  identities: AdminUserIdentity[],
  requestedId: string | null,
): AdminUserIdentity | undefined {
  return (
    identities.find((i) => i.id === requestedId) ??
    identities.find((i) => i.type === 'INDIVIDUAL') ??
    identities[0]
  )
}

export function formatArabicDate(date?: string | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('ar', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    calendar: 'gregory',
    numberingSystem: 'latn',
  }).format(new Date(date))
}

export type AccountStatusLabel = 'نشط' | 'محظور' | 'موقوف'

/** What the page shows about the account through the selected persona. */
export interface UserDetailView {
  displayName: string
  avatarUrl: string | null | undefined
  accountType: string
  statusLabel: AccountStatusLabel
  licenseNumber: string | null | undefined
  location: string | undefined
  servicesCount: number | undefined
  lastActivity: string
  lastLogin: string
  joinedAt: string
}

export function buildUserDetailView(
  user: AdminUserDetail,
  identity: AdminUserIdentity | undefined,
  role: UserRole,
): UserDetailView {
  const businessData = identity?.companyData ?? identity?.officeData
  return {
    displayName:
      identity?.companyData?.name ||
      identity?.officeData?.name ||
      identity?.individualData?.name ||
      user.name ||
      '—',
    avatarUrl:
      identity?.individualData?.avatarUrl ||
      identity?.companyData?.logoUrl ||
      identity?.officeData?.logoUrl ||
      user.avatarUrl,
    accountType: IDENTITY_TYPE_LABELS[role] || 'فرد',
    statusLabel: user.isBlocked ? 'محظور' : user.isDisabled ? 'موقوف' : 'نشط',
    licenseNumber: businessData?.licenseNumber,
    location: businessData?.hqLocation || undefined,
    // A company's services are rows; an office only has its typed list
    servicesCount:
      identity?.type === 'COMPANY'
        ? identity.servicesCount
        : identity?.type === 'OFFICE'
          ? (identity.officeData?.services ?? '')
              .split(/[,،\n]/)
              .filter((part) => part.trim()).length
          : undefined,
    lastActivity: user.lastActiveAt
      ? formatRelativeArabicTime(user.lastActiveAt)
      : '—',
    lastLogin: formatArabicDate(user.lastLoginAt),
    joinedAt: formatArabicDate(user.createdAt),
  }
}
