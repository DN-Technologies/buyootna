// Property categories and the fields each one has. Mirrors the API's
// apps/api/src/features/properties/property-category-fields.ts -- change both.

export type CategoryListingType = 'sell' | 'rent' | 'exchange';

export interface PropertyCategoryOption {
  id: string;
  // The API's PropertyCategory value
  apiValue: string;
  label: string;
}

// From the requirements document ("اضافات في المستقبل", المتغير حسب الفئة)
export interface CategoryFields {
  rooms: boolean;
  baths: boolean;
  // عدد الأدوار
  floors: boolean;
  // رقم الدور (a flat's floor)
  floorNumber: boolean;
  propertyAge: boolean;
  // عدد الشقق، حالة التأجير، مدخول العقار (a building)
  apartments: boolean;
  // نوع التخصيص، حالة التخصيص (land)
  landUse: boolean;
  // عدد الوحدات أو المحلات، الدخل الشهري (commercial, investment)
  units: boolean;
  // مزروعة، مبنية (a farm)
  farm: boolean;
}

export const PROPERTY_CATEGORIES: PropertyCategoryOption[] = [
  { id: 'house', apiValue: 'HOUSE', label: 'بيت' },
  { id: 'apartment', apiValue: 'APARTMENT', label: 'شقة' },
  { id: 'building', apiValue: 'BUILDING', label: 'عمارة' },
  { id: 'land', apiValue: 'LAND', label: 'أرض' },
  { id: 'commercial', apiValue: 'COMMERCIAL', label: 'تجاري' },
  { id: 'investment', apiValue: 'INVESTMENT', label: 'استثماري' },
  { id: 'chalet', apiValue: 'CHALET', label: 'شاليه' },
  { id: 'farm', apiValue: 'FARM', label: 'مزرعة' },
  // No longer offered for new ads; existing ads keep them
  { id: 'office', apiValue: 'OFFICE', label: 'مكتب' },
  { id: 'villa', apiValue: 'VILLA', label: 'فيلا' },
  { id: 'residential', apiValue: 'RESIDENTIAL', label: 'سكني' },
  { id: 'industrial', apiValue: 'INDUSTRIAL', label: 'صناعي' },
  { id: 'coastal', apiValue: 'COASTAL', label: 'ساحلي' },
  { id: 'private', apiValue: 'PRIVATE', label: 'خاص' },
];

// The requirements document's eight categories, in its order
const SALE_AND_RENT_IDS = [
  'house',
  'apartment',
  'building',
  'land',
  'commercial',
  'investment',
  'chalet',
  'farm',
];
const EXCHANGE_IDS = ['land', 'house'];

const byId = (id: string) => PROPERTY_CATEGORIES.find((c) => c.id === id)!;

/** The categories a new ad of this type can pick from, in display order. */
export function categoryOptionsFor(
  listingType: CategoryListingType,
): PropertyCategoryOption[] {
  return (listingType === 'exchange' ? EXCHANGE_IDS : SALE_AND_RENT_IDS).map(
    byId,
  );
}

export function isCategoryOffered(
  categoryId: string | null | undefined,
  listingType: CategoryListingType,
): boolean {
  return categoryOptionsFor(listingType).some((c) => c.id === categoryId);
}

export function findCategory(
  categoryId: string | null | undefined,
): PropertyCategoryOption | undefined {
  return PROPERTY_CATEGORIES.find((c) => c.id === categoryId);
}

export function findCategoryByApiValue(
  apiValue: string | null | undefined,
): PropertyCategoryOption | undefined {
  return PROPERTY_CATEGORIES.find((c) => c.apiValue === apiValue);
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
};
const ROOMS_AND_BATHS: CategoryFields = {
  ...NONE,
  rooms: true,
  baths: true,
  propertyAge: true,
};

const CATEGORY_FIELDS: Record<string, CategoryFields> = {
  // عمر العقار، الغرف، الحمامات، عدد الأدوار
  house: { ...ROOMS_AND_BATHS, floors: true },
  // عمر العقار، الغرف، الحمامات، رقم الدور (not the floors count)
  apartment: { ...ROOMS_AND_BATHS, floorNumber: true },
  // عمر العقار، عدد الأدوار، عدد الشقق، مدخول العقار، حالة التأجير
  building: { ...NONE, propertyAge: true, floors: true, apartments: true },
  // نوع التخصيص، حالة التخصيص
  land: { ...NONE, landUse: true },
  // عمر العقار، عدد الوحدات أو المحلات، الدخل الشهري
  commercial: { ...NONE, propertyAge: true, units: true },
  investment: { ...NONE, propertyAge: true, units: true },
  // عمر العقار، الغرف، الحمامات
  chalet: ROOMS_AND_BATHS,
  // مزروعة، مبنية
  farm: { ...NONE, farm: true },
};

/**
 * Which fields an ad of this category has. Anything not listed (no
 * category picked yet, or one no longer offered) has rooms, baths and age.
 */
export function getCategoryFields(
  categoryId: string | null | undefined,
): CategoryFields {
  return CATEGORY_FIELDS[categoryId ?? ''] ?? ROOMS_AND_BATHS;
}

/** نوع التخصيص of a land ad: the API's LandUse value and its label. */
export const LAND_USES = [
  { id: 'RESIDENTIAL', label: 'سكني' },
  { id: 'INVESTMENT', label: 'استثماري' },
  { id: 'COMMERCIAL', label: 'تجاري' },
  { id: 'CRAFT', label: 'حرفي' },
] as const;

export type LandUse = (typeof LAND_USES)[number]['id'];

export const landUseLabel = (value?: string | null) =>
  LAND_USES.find((use) => use.id === value)?.label ?? null;

/** حالة التأجير choices for a building. */
export const RENTAL_STATUSES = ['مؤجرة بالكامل', 'مؤجرة جزئياً', 'غير مؤجرة'];

