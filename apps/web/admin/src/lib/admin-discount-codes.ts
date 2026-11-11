import { api } from './api'

export type DiscountType = 'PERCENT' | 'FIXED'
export type DiscountPurpose = 'PLAN' | 'SUBSCRIPTION' | 'FEATURE'

/** A code the app's «الدفع» screen accepts (أكواد الخصم). */
export interface AdminDiscountCode {
  id: string
  code: string
  type: DiscountType
  value: number
  maxDiscount: number | null
  minAmount: number | null
  appliesTo: DiscountPurpose[]
  startsAt: string | null
  expiresAt: string | null
  maxUses: number | null
  usedCount: number
  onePerAccount: boolean
  isActive: boolean
  // Advertised at the top of the app's «الباقات» while usable
  showOnPlans: boolean
  createdAt: string
}

export type DiscountCodeInput = Omit<
  AdminDiscountCode,
  'id' | 'usedCount' | 'createdAt'
>

export const PURPOSE_LABELS: Record<DiscountPurpose, string> = {
  PLAN: 'باقات الإعلانات',
  SUBSCRIPTION: 'اشتراك الشركات',
  FEATURE: 'تمييز الإعلان',
}

export async function fetchDiscountCodes(): Promise<AdminDiscountCode[]> {
  const res = await api.get<AdminDiscountCode[]>('/admin/discount-codes')
  return res.data
}

export async function createDiscountCode(data: DiscountCodeInput) {
  const res = await api.post<AdminDiscountCode>('/admin/discount-codes', data)
  return res.data
}

export async function updateDiscountCode(
  id: string,
  data: Partial<DiscountCodeInput>,
) {
  const res = await api.patch<AdminDiscountCode>(
    `/admin/discount-codes/${id}`,
    data,
  )
  return res.data
}

/** «25%» (up to 5 د.ك) or «2 د.ك». */
export function discountLabel(code: Pick<AdminDiscountCode, 'type' | 'value' | 'maxDiscount'>) {
  if (code.type === 'FIXED') return `${code.value} د.ك`
  return code.maxDiscount != null
    ? `${code.value}% (حتى ${code.maxDiscount} د.ك)`
    : `${code.value}%`
}

/** Whether the app accepts it right now, and why not. */
export function codeState(code: AdminDiscountCode, now = new Date()) {
  if (!code.isActive) return { label: 'موقوف', tone: 'muted' as const }
  if (code.startsAt && new Date(code.startsAt) > now)
    return { label: 'لم يبدأ', tone: 'warn' as const }
  if (code.expiresAt && new Date(code.expiresAt) <= now)
    return { label: 'منتهي', tone: 'muted' as const }
  if (code.maxUses != null && code.usedCount >= code.maxUses)
    return { label: 'مستنفد', tone: 'muted' as const }
  return { label: 'فعّال', tone: 'ok' as const }
}
