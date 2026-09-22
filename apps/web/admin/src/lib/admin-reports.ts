import { api } from './api'

export type BackendReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED'
export type BackendReportPriority = 'LOW' | 'MEDIUM' | 'URGENT'
export type BackendReportTargetType = 'USER' | 'PROPERTY'

export type BackendUserRole = 'INDIVIDUAL' | 'COMPANY' | 'OFFICE'

export interface AdminReportUserSummary {
  id: string
  name: string
  email: string | null
  phone: string | null
  role: BackendUserRole | null
  avatarUrl: string | null
}

export interface AdminReportAssignedAdmin {
  id: string
  name: string
}

export interface AdminReportRow {
  id: string
  reportNumber: string
  targetType: BackendReportTargetType
  status: BackendReportStatus
  priority: BackendReportPriority
  reason: string
  description: string | null
  submittedBy: AdminReportUserSummary | null
  against: AdminReportUserSummary | null
  assignedAdmin: AdminReportAssignedAdmin | null
  createdAt: string
  resolvedAt: string | null
}

export interface AdminReportsFilters {
  search?: string
  status?: 'ALL' | BackendReportStatus
  priority?: 'ALL' | BackendReportPriority
  targetType?: 'ALL' | BackendReportTargetType
  targetRole?: 'ALL' | BackendUserRole
  dateFilter?: 'ALL' | 'TODAY' | 'WEEK' | 'MONTH'
  page?: number
  limit?: number
}

export interface AdminReportsResponse {
  data: AdminReportRow[]
  meta: {
    total: number
    currentPage: number
    limit: number
    totalPages: number
  }
  stats: {
    total: number
    pending: number
    resolved: number
    dismissed: number
  }
}

export async function fetchReports(
  filters: AdminReportsFilters = {},
): Promise<AdminReportsResponse> {
  const params: Record<string, any> = {}
  if (filters.search) params.search = filters.search
  if (filters.status) params.status = filters.status
  if (filters.priority) params.priority = filters.priority
  if (filters.targetType) params.targetType = filters.targetType
  if (filters.targetRole) params.targetRole = filters.targetRole
  if (filters.dateFilter) params.dateFilter = filters.dateFilter
  if (filters.page) params.page = filters.page
  if (filters.limit) params.limit = filters.limit

  const res = await api.get('/admin/reports', { params })
  return res.data
}

export async function fetchReport(id: string): Promise<AdminReportRow> {
  const res = await api.get(`/admin/reports/${id}`)
  return res.data
}

export interface UpdateReportInput {
  status?: 'RESOLVED' | 'DISMISSED'
  priority?: BackendReportPriority
  // Pass a user id to assign, or '' to unassign.
  assignedAdminId?: string
}

export async function updateReport(
  id: string,
  data: UpdateReportInput,
): Promise<AdminReportRow> {
  const res = await api.patch(`/admin/reports/${id}`, data)
  return res.data
}

export interface BulkReportsResult {
  message: string
  updatedCount: number
  updatedIds: string[]
  failedIds: string[]
}

export async function bulkResolveReports(
  ids: string[],
): Promise<BulkReportsResult> {
  const res = await api.post('/admin/reports/bulk-resolve', { ids })
  return res.data
}

export async function bulkDismissReports(
  ids: string[],
): Promise<BulkReportsResult> {
  const res = await api.post('/admin/reports/bulk-dismiss', { ids })
  return res.data
}

export interface UserReportsResponse {
  data: AdminReportRow[]
  meta: {
    total: number
    currentPage: number
    limit: number
    totalPages: number
  }
}

export async function fetchUserReports(
  userId: string,
  filters: { status?: 'ALL' | BackendReportStatus; page?: number; limit?: number } = {},
): Promise<UserReportsResponse> {
  const params: Record<string, any> = {}
  if (filters.status) params.status = filters.status
  if (filters.page) params.page = filters.page
  if (filters.limit) params.limit = filters.limit

  const res = await api.get(`/admin/users/${userId}/reports`, { params })
  return res.data
}

export async function fetchPropertyReports(
  propertyId: string,
): Promise<AdminReportRow[]> {
  const res = await api.get(`/admin/properties/${propertyId}/reports`)
  return res.data
}

export async function deleteReportedProperty(
  propertyId: string,
  reason?: string,
): Promise<{ message: string }> {
  const res = await api.delete(`/admin/properties/${propertyId}`, {
    data: { reason },
  })
  return res.data
}

export interface AdminModerator {
  id: string
  name: string
  email: string | null
}

export async function fetchAssignableAdmins(): Promise<AdminModerator[]> {
  const res = await api.get('/admin/moderators')
  return res.data
}
