import { BackendReportPriority, BackendReportStatus } from './admin-reports'

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
