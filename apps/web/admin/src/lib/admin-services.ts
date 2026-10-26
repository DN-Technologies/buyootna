import { api } from './api'

export interface AdminServiceRow {
  id: string
  name: string
  specialty: string | null
  description: string | null
  isHidden: boolean
  createdAt: string
}

export interface AdminUserServices {
  specialty: string | null
  // «اخفاء الخدمة»: the company's services are off its profile
  servicesHidden: boolean
  services: AdminServiceRow[]
}

export async function fetchUserServices(
  userId: string,
  identityId?: string,
): Promise<AdminUserServices> {
  const res = await api.get(`/admin/users/${userId}/services`, {
    params: { identityId },
  })
  return res.data
}
