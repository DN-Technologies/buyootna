// Property categories and the fields each one has. Mirrors the API's
// apps/api/src/features/properties/property-category-fields.ts -- change both.

export type CategoryListingType = 'sell' | 'rent' | 'exchange';

export interface PropertyCategoryOption {
  id: string;
  // The API's PropertyCategory value
  apiValue: string;
  label: string;
}

export interface CategoryFields {
  rooms: boolean;
  baths: boolean;
  floors: boolean;
  propertyAge: boolean;
}

export const PROPERTY_CATEGORIES: PropertyCategoryOption[] = [
  { id: 'house', apiValue: 'HOUSE', label: 'بيت' },
  { id: 'apartment', apiValue: 'APARTMENT', label: 'شقة' },
  { id: 'commercial', apiValue: 'COMMERCIAL', label: 'تجاري' },
  { id: 'building', apiValue: 'BUILDING', label: 'عمارة' },
  { id: 'office', apiValue: 'OFFICE', label: 'مكتب' },
  { id: 'chalet', apiValue: 'CHALET', label: 'شاليه' },
  { id: 'farm', apiValue: 'FARM', label: 'مزرعة' },
  { id: 'land', apiValue: 'LAND', label: 'أرض' },
  // No longer offered for new ads; existing ads keep them
  { id: 'villa', apiValue: 'VILLA', label: 'فيلا' },
  { id: 'residential', apiValue: 'RESIDENTIAL', label: 'سكني' },
  { id: 'investment', apiValue: 'INVESTMENT', label: 'استثماري' },
  { id: 'industrial', apiValue: 'INDUSTRIAL', label: 'صناعي' },
  { id: 'coastal', apiValue: 'COASTAL', label: 'ساحلي' },
  { id: 'private', apiValue: 'PRIVATE', label: 'خاص' },
];

const SALE_AND_RENT_IDS = [
  'house',
  'apartment',
  'commercial',
  'building',
  'office',
  'chalet',
  'farm',
  'land',
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

const ROOMS_AND_BATHS: CategoryFields = {
  rooms: true,
  baths: true,
  floors: false,
  propertyAge: true,
};
const WITH_FLOORS: CategoryFields = { ...ROOMS_AND_BATHS, floors: true };
const BARE_LAND: CategoryFields = {
  rooms: false,
  baths: false,
  floors: false,
  propertyAge: false,
};

const CATEGORY_FIELDS: Record<string, CategoryFields> = {
  land: BARE_LAND,
  farm: BARE_LAND,
  apartment: WITH_FLOORS,
  building: WITH_FLOORS,
};

/**
 * Which fields an ad of this category has. Anything not listed (including
 * no category picked yet) has rooms and baths.
 */
export function getCategoryFields(
  categoryId: string | null | undefined,
): CategoryFields {
  return CATEGORY_FIELDS[categoryId ?? ''] ?? ROOMS_AND_BATHS;
}
