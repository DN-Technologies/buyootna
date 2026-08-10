export interface RequestItem {
  id: string
  code: string
  title: string
  type: 'private' | 'public' | 'خاص' | 'عام'
  clientName: string
  submitter?: string
  status:
    | 'pending'
    | 'accepted'
    | 'completed'
    | 'cancelled'
    | 'تم الرد'
    | 'قيد الانتظار'
    | 'مقبولة'
    | 'منتهي'
  date: string
  offersCount?: number
}

export type UserRequestItem = RequestItem

export const STATUS_LABELS: Record<string, string> = {
  pending: 'قيد الانتظار',
  accepted: 'مقبولة',
  completed: 'منتهي',
  cancelled: 'ملغاة',
  'قيد الانتظار': 'قيد الانتظار',
  مقبولة: 'مقبولة',
  'تم الرد': 'تم الرد',
  منتهي: 'منتهي',
}

export const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-[#FEF6E6] text-[#D97706]',
  accepted: 'bg-[#ECFDF5] text-[#047857]',
  completed: 'bg-[#FEF3F2] text-[#9C1E28]',
  cancelled: 'bg-[#F1F5F9] text-[#64748B]',
  'قيد الانتظار': 'bg-[#FEF6E6] text-[#D97706]',
  مقبولة: 'bg-[#ECFDF5] text-[#047857]',
  'تم الرد': 'bg-[#EBF3FF] text-[#2563EB]',
  منتهي: 'bg-[#FEF3F2] text-[#9C1E28]',
}
