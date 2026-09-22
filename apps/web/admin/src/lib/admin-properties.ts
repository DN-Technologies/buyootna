import { api } from './api'

export interface UpdatePropertyInput {
  isHidden?: boolean
  isFeatured?: boolean
  featuredUntil?: string
  status?: 'DRAFT' | 'ACTIVE' | 'REJECTED' | 'EXPIRED' | 'CLOSED'
}

export async function updateProperty(propertyId: string, data: UpdatePropertyInput) {
  const res = await api.patch(`/admin/properties/${propertyId}`, data)
  return res.data
}
