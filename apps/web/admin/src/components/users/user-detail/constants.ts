export type UserRole = 'INDIVIDUAL' | 'OFFICE' | 'COMPANY'

export const DEFAULT_TAB = 'نظرة عامة'

/** Each tab's `?tab=` slug, so a tab survives reloads and links. */
export const TAB_SLUGS: Record<string, string> = {
  'نظرة عامة': 'overview',
  الاعلانات: 'ads',
  الطلبات: 'requests',
  الخدمات: 'services',
  المعرض: 'exhibition',
  الباقة: 'packages',
  'الفواتير والخصم': 'invoices',
  البلاغات: 'reports',
  التقييمات: 'ratings',
  السجل: 'logs',
  ملاحظات: 'notes',
}

export const SLUG_TO_TAB: Record<string, string> = Object.fromEntries(
  Object.entries(TAB_SLUGS).map(([tab, slug]) => [slug, tab]),
)
