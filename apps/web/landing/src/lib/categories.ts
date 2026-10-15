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

// Which fields an ad of each category has, from the requirements document
// (المتغير حسب الفئة). Mirrors the API's property-category-fields.ts and the
// app's propertyCategories.ts -- change all three.
export interface CategoryFields {
  rooms: boolean
  baths: boolean
  // عدد الأدوار
  floors: boolean
  // رقم الدور (a flat's floor)
  floorNumber: boolean
  propertyAge: boolean
  // عدد الشقق، حالة التأجير، مدخول العقار (a building)
  apartments: boolean
  // نوع التخصيص، حالة التخصيص (land)
  landUse: boolean
  // عدد الوحدات أو المحلات، الدخل الشهري (commercial, investment)
  units: boolean
  // مزروعة، مبنية (a farm)
  farm: boolean
}

const NONE: CategoryFields = {
  rooms: false,
  baths: false,
  floors: false,
  floorNumber: false,
  propertyAge: false,
  apartments: false,
  landUse: false,
  units: false,
  farm: false,
}
const ROOMS_AND_BATHS: CategoryFields = {
  ...NONE,
  rooms: true,
  baths: true,
  propertyAge: true,
}

const CATEGORY_FIELDS: Record<string, CategoryFields> = {
  HOUSE: { ...ROOMS_AND_BATHS, floors: true },
  APARTMENT: { ...ROOMS_AND_BATHS, floorNumber: true },
  BUILDING: { ...NONE, propertyAge: true, floors: true, apartments: true },
  LAND: { ...NONE, landUse: true },
  COMMERCIAL: { ...NONE, propertyAge: true, units: true },
  INVESTMENT: { ...NONE, propertyAge: true, units: true },
  CHALET: ROOMS_AND_BATHS,
  FARM: { ...NONE, farm: true },
}

/** The fields of a category; the ones no longer offered keep rooms, baths and age. */
export const categoryFields = (category: string): CategoryFields =>
  CATEGORY_FIELDS[category] ?? ROOMS_AND_BATHS

// What a new ad can be listed as (OFFICE is no longer offered)
export const NEW_AD_CATEGORIES = [
  'HOUSE',
  'APARTMENT',
  'BUILDING',
  'LAND',
  'COMMERCIAL',
  'INVESTMENT',
  'CHALET',
  'FARM',
]

// نوع التخصيص of land (API LandUse)
export const LAND_USES: { id: string; label: string }[] = [
  { id: 'RESIDENTIAL', label: 'سكني' },
  { id: 'INVESTMENT', label: 'استثماري' },
  { id: 'COMMERCIAL', label: 'تجاري' },
  { id: 'CRAFT', label: 'حرفي' },
]

export const landUseLabel = (value?: string | null) =>
  LAND_USES.find((use) => use.id === value)?.label ?? null

// حالة التأجير of a building
export const RENTAL_STATUSES = ['مؤجرة بالكامل', 'مؤجرة جزئياً', 'غير مؤجرة']
