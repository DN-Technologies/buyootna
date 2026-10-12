import type { ListingType } from './types'

export const LISTING_TYPES: { id: ListingType; label: string; tab: string }[] =
  [
    { id: 'SALE', label: 'بيع', tab: 'للبيع' },
    { id: 'RENT', label: 'ايجار', tab: 'للايجار' },
    { id: 'EXCHANGE', label: 'بدل', tab: 'للبدل' },
  ]

// What a search can narrow by (API PropertyCategory): the design's list,
// plus land and farms, which ads can also be listed under
export const PROPERTY_CATEGORIES: { id: string; label: string }[] = [
  { id: 'INVESTMENT', label: 'استثماري' },
  { id: 'HOUSE', label: 'بيت' },
  { id: 'APARTMENT', label: 'شقة' },
  { id: 'COMMERCIAL', label: 'تجاري' },
  { id: 'BUILDING', label: 'عمارة' },
  { id: 'OFFICE', label: 'مكتب' },
  { id: 'CHALET', label: 'شاليه' },
  { id: 'RESIDENTIAL', label: 'سكني' },
  { id: 'LAND', label: 'أرض' },
  { id: 'FARM', label: 'مزرعة' },
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

// التخصص of a service company, the same list the mobile app registers with
export const COMPANY_SPECIALTIES: string[] = [
  'مكتب هندسي',
  'دار استشارية',
  'التثمين العقاري',
  'مقاول عام / مقاول بناء',
  'مقاول ترميم وإضافة',
  'الهدم',
  'العوازل',
  'التشطيب',
  'التصميم الداخلي',
  'الديكور والجبس بورد',
  'الأصباغ (الصبغ)',
  'الأرضيات',
  'البلاط والانترلوك',
  'النجارة والأبواب',
  'المطابخ',
  'الألمنيوم والزجاج',
  'الحدادة والمظلات',
  'الستائر والتنجيد',
  'التكييف',
  'التهوية والشفط المركزي',
  'الأعمال الكهربائية',
  'الأعمال الصحية والسباكة',
  'المصاعد (اصنصيرات)',
  'أنظمة الإطفاء والإنذار',
  'الأنظمة الذكية والمراقبة',
  'إدارة الاملاك',
  'صيانة المباني',
  'التنظيف',
  'نقل العفش',
  'مكافحة الحشرات',
  'المسابح',
  'تنسيق الحدائق',
]

// An exchange ad is only ever land or a house, so its filter offers just those
const EXCHANGE_CATEGORY_IDS = ['LAND', 'HOUSE']

/** The categories the filter offers for a listing type. */
export function categoriesFor(type?: ListingType) {
  return type === 'EXCHANGE'
    ? EXCHANGE_CATEGORY_IDS.map((id) =>
        PROPERTY_CATEGORIES.find((category) => category.id === id)!,
      )
    : PROPERTY_CATEGORIES
}

// Every category an ad can carry, including ones no longer offered for new
// ads. Mirrors the API's PROPERTY_CATEGORY_LABELS.
export const CATEGORY_LABELS: Record<string, string> = {
  COMMERCIAL: 'تجاري',
  INVESTMENT: 'استثماري',
  INDUSTRIAL: 'صناعي',
  COASTAL: 'ساحلي',
  OFFICE: 'مكتب',
  PRIVATE: 'خاص',
  HOUSE: 'بيت',
  APARTMENT: 'شقة',
  VILLA: 'فيلا',
  BUILDING: 'عمارة',
  LAND: 'أرض',
  CHALET: 'شاليه',
  RESIDENTIAL: 'سكني',
  FARM: 'مزرعة',
}

// Which counts a category has: land and farms have none, and only flats and
// buildings count floors. Mirrors the API's property-category-fields.ts.
const NO_COUNTS = ['LAND', 'FARM']
const WITH_FLOORS = ['APARTMENT', 'BUILDING']

export const categoryCounts = (category: string) => ({
  rooms: !NO_COUNTS.includes(category),
  baths: !NO_COUNTS.includes(category),
  floors: WITH_FLOORS.includes(category),
})
