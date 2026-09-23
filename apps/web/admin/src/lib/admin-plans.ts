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

export async function fetchUserWallet(userId: string): Promise<AdminUserWallet> {
  const res = await api.get(`/admin/users/${userId}/wallet`)
  return res.data
}

export interface ChangeUserPlanInput {
  planId: string
  adsRemaining?: number
}

export async function changeUserPlan(userId: string, data: ChangeUserPlanInput) {
  const res = await api.post(`/admin/users/${userId}/plan`, data)
  return res.data
}

export interface GrantExceptionalFeatureInput {
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
