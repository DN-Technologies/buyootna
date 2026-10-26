import { api } from './api'

export interface AdminPlan {
  id: string
  slug: string
  name: string
  price: number
  originalPrice: number | null
  discountText: string | null
  badge: string | null
  features: string[]
  color: string
  sortOrder: number
  isActive: boolean
  maxActiveAds: number
  durationDays: number
  maxImagesPerAd: number
  featuredDays: number
  prioritySearch: boolean
}

export interface AdminWalletSlot {
  id: string
  planId: string
  planName: string
  planSlug: string
  color: string
  badge: string | null
  adsRemaining: number
  maxActiveAds: number
  createdAt: string
}

export interface AdminWalletHistoryItem {
  id: string
  displayId: string
  planName: string
  planSlug: string
  status: 'ACTIVE' | 'EXPIRED'
  dateText: string
  createdAt: string
  adsRemaining: number
}

export interface AdminUserWallet {
  freeAdsRemaining: number
  balanceCounts: { gold: number; silver: number; regular: number }
  slots: AdminWalletSlot[]
  history: AdminWalletHistoryItem[]
}

export async function fetchPlans(): Promise<AdminPlan[]> {
  const res = await api.get('/plans')
  return res.data
}

export async function fetchUserWallet(
  userId: string,
  identityId?: string,
): Promise<AdminUserWallet> {
  const res = await api.get(`/admin/users/${userId}/wallet`, {
    params: { identityId },
  })
  return res.data
}

export interface ChangeUserPlanInput {
  planId: string
  adsRemaining?: number
  // The persona the plan is for (the page's selected identity)
  identityId?: string
}

export async function changeUserPlan(
  userId: string,
  data: ChangeUserPlanInput,
) {
  const res = await api.post(`/admin/users/${userId}/plan`, data)
  return res.data
}

export interface GrantExceptionalFeatureInput {
  identityId?: string
  adsCount?: number
  photosCount?: number
  durationDays?: number
  priorityVisibility?: boolean
  featuredResultsVisibility?: boolean
  expiryDate?: string
  notifyEmail?: boolean
  notifyApp?: boolean
}

export async function grantExceptionalFeature(
  userId: string,
  data: GrantExceptionalFeatureInput,
): Promise<{ message: string }> {
  const res = await api.post(`/admin/users/${userId}/exceptional-feature`, data)
  return res.data
}

/** A plan as the admin Plans page sees it: with how often it was bought. */
export interface AdminCatalogPlan extends AdminPlan {
  createdAt: string
  subscriptionsCount: number
  subscriptionsThisMonth: number
}

export async function fetchPlanCatalog(): Promise<AdminCatalogPlan[]> {
  const res = await api.get<AdminCatalogPlan[]>('/admin/plans')
  return res.data
}

export type UpdatePlanInput = Partial<
  Pick<
    AdminPlan,
    | 'name'
    | 'price'
    | 'isActive'
    | 'maxActiveAds'
    | 'durationDays'
    | 'maxImagesPerAd'
    | 'featuredDays'
    | 'prioritySearch'
    | 'features'
  >
>

export async function updatePlan(id: string, data: UpdatePlanInput) {
  const res = await api.patch<AdminPlan>(`/admin/plans/${id}`, data)
  return res.data
}

/**
 * The feature lines the app shows under a plan, built from its numbers so
 * the text never disagrees with what the plan actually gives.
 */
export function buildPlanFeatures(
  plan: Pick<
    AdminPlan,
    | 'maxActiveAds'
    | 'durationDays'
    | 'maxImagesPerAd'
    | 'featuredDays'
    | 'prioritySearch'
  >,
): string[] {
  const lines = [
    plan.maxActiveAds === 1
      ? 'اعلان واحد نشط.'
      : `${plan.maxActiveAds} اعلانات نشطة في نفس الوقت.`,
    `مدة النشر ${plan.durationDays} يوم.`,
    `حتى ${plan.maxImagesPerAd} صورة للعقار.`,
  ]
  if (plan.featuredDays > 0) {
    lines.push(`تثبيت ${plan.featuredDays} ايام في نتائج البحث.`)
  }
  if (plan.prioritySearch) lines.push('اولوية الظهور في البحث الجغرافي.')
  lines.push(
    plan.featuredDays > 0
      ? 'ظهور في نتائج البحث المميزة.'
      : 'ظهور في نتائج البحث.',
    'تواصل مباشر مع المهتمين.',
  )
  return lines
}
