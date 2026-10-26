import { api } from './api'

export interface AdminVerificationRow {
  identityId: string
  userId: string
  name: string
  email: string
  accountType: 'شركة' | 'مكتب عقاري'
  status: 'قيد الانتظار' | 'موثق' | 'غير موثق'
  accountStatus: 'نشط' | 'موقوف'
  attachmentsText: string
  sentAt: string
  actionLabel: 'مراجعة' | 'عرض'
  licenseNumber: string | null
  licenseActivity: string | null
  licenseExpiry: string | null
  licenseFileUrl: string | null
  logoUrl: string | null
  createdAt: string
}

export interface AdminVerificationsFilters {
  search?: string
  accountType?: 'شركة' | 'مكتب عقاري'
  status?: 'ALL' | 'VERIFIED' | 'PENDING' | 'UNVERIFIED'
  sortOrder?: 'NEWEST' | 'OLDEST'
  page?: number
  limit?: number
}

export interface AdminVerificationsResponse {
  data: AdminVerificationRow[]
  meta: {
    total: number
    currentPage: number
    limit: number
    totalPages: number
  }
  counts: {
    all: number
    companies: number
    offices: number
  }
  stats: {
    pendingCount: number
    approvedTodayCount: number
    rejectedTodayCount: number
  }
}

export async function fetchVerifications(
  filters: AdminVerificationsFilters = {},
): Promise<AdminVerificationsResponse> {
  const params: Record<string, any> = {}
  if (filters.search) params.search = filters.search
  if (filters.accountType) params.accountType = filters.accountType
  if (filters.status) params.status = filters.status
  if (filters.sortOrder) params.sortOrder = filters.sortOrder
  if (filters.page) params.page = filters.page
  if (filters.limit) params.limit = filters.limit

  const res = await api.get('/admin/verifications', { params })
  return res.data
}

export interface NotifyUsersOptions {
  userIds: string[]
  title: string
  message: string
  notifyEmail?: boolean
  notifyInApp?: boolean
}

export interface NotifyUsersResponse {
  message: string
  notifiedCount: number
  notifiedUserIds: string[]
  failedUserIds: string[]
}

export async function notifyUsers(
  options: NotifyUsersOptions,
): Promise<NotifyUsersResponse> {
  const res = await api.post('/admin/users/notify', options)
  return res.data
}
