import {
  BackendReportPriority,
  BackendReportStatus,
  BackendReportTargetType,
  BackendUserRole,
} from './admin-reports'

// One real backend enum (English), mapped to each screen's own Arabic
// display values at the UI layer -- the 5 pre-existing mock report shapes
// across the admin app used incompatible enums; these tables are the single
// source of truth for reconciling them against real data.

export const MAIN_STATUS_LABEL: Record<
  BackendReportStatus,
  'قيد الانتظار' | 'تم حلها' | 'مرفوض'
> = {
  PENDING: 'قيد الانتظار',
  RESOLVED: 'تم حلها',
  DISMISSED: 'مرفوض',
}

export const MAIN_PRIORITY_LABEL: Record<
  BackendReportPriority,
  'عاجل' | 'متوسط' | 'منخفضة'
> = {
  URGENT: 'عاجل',
  MEDIUM: 'متوسط',
  LOW: 'منخفضة',
}

export const USER_TAB_STATUS_LABEL: Record<
  BackendReportStatus,
  'مفتوحة' | 'معلقة' | 'مغلقة'
> = {
  PENDING: 'مفتوحة',
  RESOLVED: 'مغلقة',
  DISMISSED: 'مغلقة',
}

export const USER_TAB_PRIORITY_LABEL: Record<
  BackendReportPriority,
  'منخفضة' | 'متوسطة' | 'عالية'
> = {
  LOW: 'منخفضة',
  MEDIUM: 'متوسطة',
  URGENT: 'عالية',
}

export const AD_TAB_STATUS_LABEL: Record<BackendReportStatus, 'مفتوحة' | 'مغلقة'> = {
  PENDING: 'مفتوحة',
  RESOLVED: 'مغلقة',
  DISMISSED: 'مغلقة',
}

export const AD_TAB_PRIORITY_LABEL: Record<
  BackendReportPriority,
  'عاجل' | 'متوسط' | 'منخفضة'
> = {
  URGENT: 'عاجل',
  MEDIUM: 'متوسط',
  LOW: 'منخفضة',
}

// Main page's "type" column/filter (عقار/خدمة/فرد/مكتب عقاري/شركة) has no
// single backend enum -- it's targetType (USER/PROPERTY) further split by
// the target account's role for USER-type reports. "خدمة" has no real
// backend entity (no Service model exists), so it never matches real data.
export function reportTypeLabel(
  targetType: BackendReportTargetType,
  role: BackendUserRole | null,
): 'عقار' | 'خدمة' | 'فرد' | 'مكتب عقاري' | 'شركة' {
  if (targetType === 'PROPERTY') return 'عقار'
  if (role === 'COMPANY') return 'شركة'
  if (role === 'OFFICE') return 'مكتب عقاري'
  return 'فرد'
}

// "خدمة" (service) is deliberately absent here -- no Service model exists
// in the backend, so that filter option is handled as an always-empty
// local short-circuit in useReportsPage rather than a real API filter.
export const TYPE_FILTER_TO_BACKEND: Partial<
  Record<
    'عقار' | 'فرد' | 'مكتب عقاري' | 'شركة',
    { targetType?: BackendReportTargetType; targetRole?: BackendUserRole }
  >
> = {
  عقار: { targetType: 'PROPERTY' },
  فرد: { targetType: 'USER', targetRole: 'INDIVIDUAL' },
  'مكتب عقاري': { targetType: 'USER', targetRole: 'OFFICE' },
  شركة: { targetType: 'USER', targetRole: 'COMPANY' },
}
