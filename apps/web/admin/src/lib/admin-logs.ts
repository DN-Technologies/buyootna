import { api } from './api'

export type BackendAdminActionType =
  | 'PROPERTY_DELETED'
  | 'PROPERTY_HIDDEN'
  | 'PROPERTY_UNHIDDEN'
  | 'PROPERTY_FEATURED'
  | 'PROPERTY_REPUBLISHED'
  | 'REPORT_RESOLVED'
  | 'REPORT_DISMISSED'
  | 'REPORT_ASSIGNED'
  | 'REPORT_PRIORITY_CHANGED'
  | 'IDENTITY_APPROVED'
  | 'IDENTITY_REJECTED'
  | 'IDENTITY_EDIT_REQUESTED'
  | 'COUPON_GRANTED'
  | 'COUPON_BULK_GRANTED'
  | 'USER_STATUS_CHANGED'
  | 'USER_NOTIFIED'
  | 'PLAN_CHANGED'
  | 'EXCEPTIONAL_FEATURE_GRANTED'
  | 'COMPANY_PROJECT_DELETED'
  | 'PLAN_UPDATED'
  | 'FEATURE_PACKAGE_CREATED'
  | 'FEATURE_PACKAGE_UPDATED'
  | 'REVIEW_DELETED'
  | 'STORY_REMOVED'
  | 'REEL_REMOVED'
  | 'REEL_COMMENT_REMOVED'

export interface AdminLogActor {
  id: string
  name: string
}

export interface AdminLogRow {
  id: string
  action: BackendAdminActionType
  targetType: string
  targetId: string | null
  actorType: 'ADMIN' | 'SYSTEM'
  actorAdmin: AdminLogActor | null
  // Only on GET /admin/logs: the account the action was about
  targetUser?: { id: string; name: string | null } | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface AdminLogsResponse {
  data: AdminLogRow[]
  meta: {
    total: number
    currentPage: number
    limit: number
    totalPages: number
  }
}

export async function fetchUserLogs(
  userId: string,
  page = 1,
  limit = 10,
): Promise<AdminLogsResponse> {
  const res = await api.get(`/admin/users/${userId}/logs`, {
    params: { page, limit },
  })
  return res.data
}

/** Every admin action, newest first (السجل, اخر الانشطة). */
export async function fetchLogs(
  page = 1,
  limit = 20,
  action?: BackendAdminActionType,
): Promise<AdminLogsResponse> {
  const res = await api.get('/admin/logs', { params: { page, limit, action } })
  return res.data
}
