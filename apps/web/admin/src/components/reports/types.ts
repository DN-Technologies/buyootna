export type ReportPriority = 'عاجل' | 'متوسط' | 'منخفضة'
export type ReportStatus = 'قيد الانتظار' | 'تم حلها' | 'مرفوض'
export type ReportType = 'عقار' | 'خدمة' | 'فرد' | 'مكتب عقاري' | 'شركة'
export type ReportTargetType = 'USER' | 'PROPERTY'

export interface UserSummary {
  id?: string
  name: string
  email: string
  avatar?: string
  phone?: string
}

export interface ReportAttachment {
  name: string
  type: 'image' | 'pdf' | 'doc'
  url?: string
}

export interface ReportItem {
  id: string
  reportNumber: string // e.g. "RP-1025"
  submittedBy: UserSummary
  against: UserSummary
  targetType?: ReportTargetType
  type: ReportType
  reportCategory?: string // e.g. "بيع"
  reason: string // e.g. "معلومات غير صحيحة", "خدمة وهمية غير مكتملة"
  status: ReportStatus
  createdAt: string // e.g. "منذ ساعتين", "منذ ساعة"
  priority: ReportPriority
  description?: string
  targetTitle?: string // e.g. "فيلا بالتجمع الخامس", "شقة"
  targetId?: string
  targetPrice?: string // e.g. "150,000"
  targetCurrency?: string // e.g. "د.ك"
  targetArea?: string // e.g. "200 م2"
  targetLocation?: string // e.g. "شمال غرب صليبيخات"
  targetPropertyType?: string // e.g. "عمارة"
  targetImage?: string
  attachments?: ReportAttachment[]
}

export type StatusFilterOption = 'الكل' | 'قيد الانتظار' | 'تم حلها' | 'مرفوض'
export type TypeFilterOption = 'الكل' | 'عقار' | 'خدمة' | 'فرد' | 'مكتب عقاري' | 'شركة'
export type PriorityFilterOption = 'الكل' | 'منخفض' | 'متوسط' | 'عاجل'
export type DateFilterOption = 'الكل' | 'اليوم' | 'هذا الأسبوع' | 'هذا الشهر'

export interface ReportStats {
  total: number
  pending: number
  resolved: number
  dismissed?: number
}

export interface ReportPagination {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
}
