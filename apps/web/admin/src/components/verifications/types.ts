export interface VerificationTableRow {
  id: string
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
  logoUrl?: string
  createdAtTimestamp?: number
}

export type VerificationTab = 'all' | 'offices' | 'companies'

// Initial dataset matching Figma nodes 4779:122928, 2769:49892, & 2769:52652
export const INITIAL_VERIFICATION_ROWS: VerificationTableRow[] = [
  {
    id: 'req-1',
    name: 'دار العقار الحديث',
    email: 'dar@gmail.com',
    accountType: 'شركة',
    status: 'غير موثق',
    accountStatus: 'نشط',
    attachmentsText: '2',
    sentAt: 'منذ ساعتين',
    actionLabel: 'مراجعة',
    licenseActivity: 'تنفيذ وتشطيب',
    licenseExpiry: '17 مارس 2028',
    createdAtTimestamp: 9000,
  },
  {
    id: 'req-2',
    name: 'شركة المستقبل',
    email: 'mustaqbal@gmail.com',
    accountType: 'شركة',
    status: 'قيد الانتظار',
    accountStatus: 'نشط',
    attachmentsText: '3',
    sentAt: 'منذ ساعة',
    actionLabel: 'مراجعة',
    licenseActivity: 'تنفيذ وتشطيب',
    licenseExpiry: '17 مارس 2028',
    createdAtTimestamp: 8500,
  },
  {
    id: 'req-3',
    name: 'دار العقار الحديث',
    email: 'dar@gmail.com',
    accountType: 'شركة',
    status: 'موثق',
    accountStatus: 'نشط',
    attachmentsText: '3',
    sentAt: 'منذ ساعتين',
    actionLabel: 'عرض',
    licenseActivity: 'استشارات وبناء',
    licenseExpiry: '10 أغسطس 2026',
    createdAtTimestamp: 8000,
  },
  {
    id: 'req-4',
    name: 'دار العقار الحديث',
    email: 'dar@gmail.com',
    accountType: 'شركة',
    status: 'غير موثق',
    accountStatus: 'نشط',
    attachmentsText: '3',
    sentAt: 'منذ ساعتين',
    actionLabel: 'مراجعة',
    licenseActivity: 'إدارة وتطوير المشاريع',
    licenseExpiry: '05 مايو 2027',
    createdAtTimestamp: 7000,
  },
  {
    id: 'req-5',
    name: 'دار العقار الحديث',
    email: 'dar@gmail.com',
    accountType: 'شركة',
    status: 'غير موثق',
    accountStatus: 'نشط',
    attachmentsText: '3',
    sentAt: 'منذ ساعتين',
    actionLabel: 'مراجعة',
    licenseActivity: 'مقاولات عامة',
    licenseExpiry: '15 يناير 2026',
    createdAtTimestamp: 6000,
  },
  {
    id: 'req-6',
    name: 'مكتب المستقبل',
    email: 'mustaqbal.office@gmail.com',
    accountType: 'مكتب عقاري',
    status: 'قيد الانتظار',
    accountStatus: 'موقوف',
    attachmentsText: '4',
    sentAt: 'منذ ساعة',
    actionLabel: 'مراجعة',
    licenseNumber: '74978930863',
    licenseActivity: 'تنفيذ وتشطيب',
    licenseExpiry: '17 مارس 2028',
    createdAtTimestamp: 5000,
  },
  {
    id: 'req-7',
    name: 'المنار',
    email: 'almanar@gmail.com',
    accountType: 'مكتب عقاري',
    status: 'قيد الانتظار',
    accountStatus: 'موقوف',
    attachmentsText: '1',
    sentAt: '5 ابريل 2026',
    actionLabel: 'مراجعة',
    licenseNumber: '99201948123',
    licenseActivity: 'تقييم واستشارات عقارية',
    licenseExpiry: '30 ديسمبر 2028',
    createdAtTimestamp: 4000,
  },
  {
    id: 'req-8',
    name: 'المنار',
    email: 'almanar@gmail.com',
    accountType: 'مكتب عقاري',
    status: 'موثق',
    accountStatus: 'موقوف',
    attachmentsText: '1',
    sentAt: '5 ابريل 2026',
    actionLabel: 'عرض',
    licenseNumber: '44501938291',
    licenseActivity: 'وساطة تجارية وسكنية',
    licenseExpiry: '19 سبتمبر 2027',
    createdAtTimestamp: 3000,
  },
  {
    id: 'req-9',
    name: 'المنار',
    email: 'almanar@gmail.com',
    accountType: 'مكتب عقاري',
    status: 'موثق',
    accountStatus: 'موقوف',
    attachmentsText: '3',
    sentAt: '5 ابريل 2026',
    actionLabel: 'عرض',
    licenseNumber: '74978930863',
    licenseActivity: 'وساطة وإدارة أملاك',
    licenseExpiry: '17 مارس 2028',
    createdAtTimestamp: 2000,
  },
]
