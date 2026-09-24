import { api } from './api'

export type BackendRequestStatus = 'pending' | 'responded' | 'accepted' | 'rejected'
export type BackendRequestScope = 'company' | 'public'

export interface AdminRequestClient {
  name: string
  joinedDate: string
  previousOffers: number
  rating: number | null
  avatarUrl?: string | null
  phone?: string | null
  whatsapp?: string | null
  isVerified?: boolean
}

export interface AdminRequestRow {
  id: string
  clientIdentityId: string
  title: string
  clientName: string
  requestNumber: string
  category?: string | null
  priceRange?: string | null
  location: string
  attachmentsCount: number
  offerType?: string | null
  images: string[]
  latitude?: number | null
  longitude?: number | null
  description: string
  status: BackendRequestStatus
  scope: BackendRequestScope
  createdAt: string
  client: AdminRequestClient
}

export async function fetchUserRequests(userId: string): Promise<AdminRequestRow[]> {
  const res = await api.get(`/admin/users/${userId}/requests`)
  return res.data
}
