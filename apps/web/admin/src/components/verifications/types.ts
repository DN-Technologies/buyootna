export interface VerificationTableRow {
  id: string
  userId?: string
  name: string
  email: string
  accountType: 'شركة' | 'مكتب عقاري'
  status: 'غير موثق' | 'مرفوض' | 'موثق' | 'قيد الانتظار'
  accountStatus?: 'نشط' | 'موقوف'
  attachmentsText: string
  sentAt: string
  actionLabel: 'مراجعة' | 'عرض'
  licenseNumber?: string
  licenseActivity?: string
  licenseExpiry?: string
  licenseFileUrl?: string
  logoUrl?: string
  createdAtTimestamp?: number
}

export type VerificationTab = 'all' | 'offices' | 'companies'

// Initial dataset matching Figma nodes 4779:122928, 2769:49892, & 2769:52652
