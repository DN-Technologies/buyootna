import type { BillingIdentityType } from '@/lib/admin-billing'

export type BillingTab = 'subscriptions' | 'invoices'

export interface BillingFilterState {
  search: string
  role: '' | BillingIdentityType
  plan: string
  status: string
}

export interface FilterOption {
  value: string
  label: string
}

export const ROLE_OPTIONS: FilterOption[] = [
  { value: '', label: 'الكل' },
  { value: 'INDIVIDUAL', label: 'الأفراد' },
  { value: 'OFFICE', label: 'المكاتب العقارية' },
  { value: 'COMPANY', label: 'الشركات' },
]

export const SUBSCRIPTION_STATUS_OPTIONS: FilterOption[] = [
  { value: '', label: 'الكل' },
  { value: 'active', label: 'نشط' },
  { value: 'expired', label: 'منتهي' },
]

export const INVOICE_STATUS_OPTIONS: FilterOption[] = [
  { value: '', label: 'الكل' },
  { value: 'PAID', label: 'مدفوعة' },
  { value: 'PENDING', label: 'بانتظار الدفع' },
  { value: 'OVERDUE', label: 'متأخرة' },
  { value: 'CANCELLED', label: 'ملغية' },
]

export const IDENTITY_TYPE_LABEL: Record<BillingIdentityType, string> = {
  INDIVIDUAL: 'فرد',
  COMPANY: 'شركة',
  OFFICE: 'مكتب عقاري',
}

export function formatKwd(amount: number | null): string {
  if (amount == null) return '—'
  return `${amount.toLocaleString('en-US', { maximumFractionDigits: 3 })} د.ك`
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('ar', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    calendar: 'gregory',
    numberingSystem: 'latn',
  }).format(new Date(iso))
}
