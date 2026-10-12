import type { ListingType } from './types'

export const LISTING_TYPES: { id: ListingType; label: string; tab: string }[] =
  [
    { id: 'SALE', label: 'بيع', tab: 'للبيع' },
    { id: 'RENT', label: 'ايجار', tab: 'للايجار' },
    { id: 'EXCHANGE', label: 'بدل', tab: 'للبدل' },
  ]

// The property categories new ads can be listed under (API PropertyCategory)
export const PROPERTY_CATEGORIES: { id: string; label: string }[] = [
  { id: 'HOUSE', label: 'بيت' },
  { id: 'APARTMENT', label: 'شقة' },
  { id: 'COMMERCIAL', label: 'تجاري' },
  { id: 'BUILDING', label: 'عمارة' },
  { id: 'OFFICE', label: 'مكتب' },
  { id: 'CHALET', label: 'شاليه' },
  { id: 'FARM', label: 'مزرعة' },
  { id: 'LAND', label: 'أرض' },
]

// Upper price bounds offered by the search, in KWD
export const PRICE_CEILINGS: { id: string; label: string }[] = [
  { id: '500', label: 'حتى 500 د.ك' },
  { id: '1000', label: 'حتى 1,000 د.ك' },
  { id: '50000', label: 'حتى 50,000 د.ك' },
  { id: '100000', label: 'حتى 100,000 د.ك' },
  { id: '250000', label: 'حتى 250,000 د.ك' },
  { id: '500000', label: 'حتى 500,000 د.ك' },
  { id: '1000000', label: 'حتى 1,000,000 د.ك' },
]

// Service-company categories, the same list the mobile app filters by
export const COMPANY_CATEGORIES: string[] = [
  'تشطيب',
  'ادوات صحية',
  'شبكات نت',
  'ديكورات',
  'مقاولين',
  'شركات مباني',
  'الأثاث',
  'ملاحات كهربائية',
  'التكييف والشفطات المركزية',
  'تصميم داخلي',
  'معلم سيراميك ومحلات سيراميك',
  'مكاتب هندسية',
  'حداد',
  'اصنصيرات',
  'سخانات',
  'شركات أبواب ومعلم نجارة',
  'شركات المنيوم',
  'شركات الاصباغ',
  'المساح والحدائق الخارجية',
  'شركات البلاط',
]
