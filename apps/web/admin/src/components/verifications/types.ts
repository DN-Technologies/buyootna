export interface VerificationTableRow {
  id: string
  name: string
  email: string
  accountType: 'شركة' | 'مكتب عقاري'
  status: 'غير موثق' | 'مرفوض' | 'موثق'
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

// Initial dataset matching Figma nodes 4779:122928 & 2769:49892
export const INITIAL_VERIFICATION_ROWS: VerificationTableRow[] = [
  {
    id: 'req-1',
    name: 'دار العقار الحديث',
    email: 'dar@gmail.com',
    accountType: 'شركة',
    status: 'غير موثق',
    attachmentsText: 'ــــــ',
    sentAt: 'منذ ساعتين',
    actionLabel: 'مراجعة',
    licenseActivity: 'تطوير وتسويق عقاري',
    licenseExpiry: '24 نوفمبر 2027',
    createdAtTimestamp: 9000,
  },
  {
    id: 'req-2',
    name: 'المنار',
    email: 'almanar@gmail.com',
    accountType: 'مكتب عقاري',
    status: 'غير موثق',
    attachmentsText: '3 (الصورة، رقم الرخصة، تاريخ الانتهاء)',
    sentAt: 'منذ ساعتين',
    actionLabel: 'مراجعة',
    licenseNumber: '74978930863',
    licenseActivity: 'وساطة وإدارة أملاك',
    licenseExpiry: '17 مارس 2028',
    createdAtTimestamp: 8000,
  },
  {
    id: 'req-3',
    name: 'دار العقار الحديث',
    email: 'dar@gmail.com',
    accountType: 'شركة',
    status: 'غير موثق',
    attachmentsText: '3 (النشاط، الصورة، تاريخ الانتهاء)',
    sentAt: 'منذ ساعتين',
    actionLabel: 'عرض',
    licenseActivity: 'استشارات وبناء',
    licenseExpiry: '10 أغسطس 2026',
    createdAtTimestamp: 7000,
  },
  {
    id: 'req-4',
    name: 'دار العقار الحديث',
    email: 'dar@gmail.com',
    accountType: 'شركة',
    status: 'غير موثق',
    attachmentsText: '3 (النشاط، الصورة، تاريخ الانتهاء)',
    sentAt: 'منذ ساعتين',
    actionLabel: 'مراجعة',
    licenseActivity: 'إدارة وتطوير المشاريع',
    licenseExpiry: '05 مايو 2027',
    createdAtTimestamp: 6000,
  },
  {
    id: 'req-5',
    name: 'المنار',
    email: 'almanar@gmail.com',
    accountType: 'مكتب عقاري',
    status: 'غير موثق',
    attachmentsText: '4 (النشاط، الصورة، رقم الرخصة، تاريخ الانتهاء)',
    sentAt: 'منذ ساعتين',
    actionLabel: 'مراجعة',
    licenseNumber: '88392019482',
    licenseActivity: 'بيع وشراء وتأجير العقارات',
    licenseExpiry: '22 أكتوبر 2027',
    createdAtTimestamp: 5000,
  },
  {
    id: 'req-6',
    name: 'دار العقار الحديث',
    email: 'dar@gmail.com',
    accountType: 'شركة',
    status: 'مرفوض',
    attachmentsText: 'ــــــ',
    sentAt: 'منذ ساعتين',
    actionLabel: 'مراجعة',
    licenseActivity: 'مقاولات عامة',
    licenseExpiry: '15 يناير 2026',
    createdAtTimestamp: 4000,
  },
  {
    id: 'req-7',
    name: 'المنار',
    email: 'almanar@gmail.com',
    accountType: 'مكتب عقاري',
    status: 'غير موثق',
    attachmentsText: '1 (النشاط، الصورة)',
    sentAt: 'منذ ساعتين',
    actionLabel: 'مراجعة',
    licenseNumber: '99201948123',
    licenseActivity: 'تقييم واستشارات عقارية',
    licenseExpiry: '30 ديسمبر 2028',
    createdAtTimestamp: 3000,
  },
  {
    id: 'req-8',
    name: 'دار العقار الحديث',
    email: 'dar@gmail.com',
    accountType: 'شركة',
    status: 'مرفوض',
    attachmentsText: 'ــــــ',
    sentAt: 'منذ ساعتين',
    actionLabel: 'مراجعة',
    licenseActivity: 'تأجير وإدارة عقارات',
    licenseExpiry: '12 يوليو 2026',
    createdAtTimestamp: 2000,
  },
  {
    id: 'req-9',
    name: 'المنار',
    email: 'almanar@gmail.com',
    accountType: 'مكتب عقاري',
    status: 'غير موثق',
    attachmentsText: '1 (رقم الرخصة)',
    sentAt: 'منذ ساعتين',
    actionLabel: 'مراجعة',
    licenseNumber: '44501938291',
    licenseActivity: 'وساطة تجارية وسكنية',
    licenseExpiry: '19 سبتمبر 2027',
    createdAtTimestamp: 1000,
  },
]
