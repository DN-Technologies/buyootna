export interface RequestClientInfo {
  name: string
  joinedDateLabel?: string
  previousOffers?: number
  rating?: number | null
  avatarUrl?: string | null
  phone?: string | null
  whatsapp?: string | null
}

export type RequestStatus = 'pending' | 'responded' | 'accepted' | 'rejected'

export interface RequestItem {
  id: string
  code: string
  title: string
  type: 'private' | 'public'
  clientName: string
  submitter?: string
  status: RequestStatus
  date: string
  offersCount?: number
  description?: string
  location?: string
  priceRange?: string | null
  serviceType?: string | null
  images?: string[]
  client?: RequestClientInfo
}

export type UserRequestItem = RequestItem

export const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'قيد الانتظار',
  responded: 'تم الرد',
  accepted: 'مقبولة',
  rejected: 'مرفوضة',
}

export const STATUS_STYLES: Record<RequestStatus, string> = {
  pending: 'bg-[#FEF6E6] text-[#D97706]',
  responded: 'bg-[#EBF3FF] text-[#2563EB]',
  accepted: 'bg-[#ECFDF5] text-[#047857]',
  rejected: 'bg-[#FEF3F2] text-[#9C1E28]',
}
