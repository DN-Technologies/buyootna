import { PropertyCategory } from '@prisma/client';

// Which counts an ad of each category has. Mirrors the mobile app's
// apps/mobile/src/shared/utils/data/propertyCategories.ts -- change both.
export interface CategoryFields {
  rooms: boolean;
  baths: boolean;
  floors: boolean;
  propertyAge: boolean;
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

export const CATEGORY_FIELDS: Record<PropertyCategory, CategoryFields> = {
  LAND: BARE_LAND,
  FARM: BARE_LAND,
  APARTMENT: WITH_FLOORS,
  BUILDING: WITH_FLOORS,
  HOUSE: ROOMS_AND_BATHS,
  CHALET: ROOMS_AND_BATHS,
  OFFICE: ROOMS_AND_BATHS,
  COMMERCIAL: ROOMS_AND_BATHS,
  // No longer offered for new ads
  VILLA: ROOMS_AND_BATHS,
  RESIDENTIAL: ROOMS_AND_BATHS,
  INVESTMENT: ROOMS_AND_BATHS,
  INDUSTRIAL: ROOMS_AND_BATHS,
  COASTAL: ROOMS_AND_BATHS,
  PRIVATE: ROOMS_AND_BATHS,
};

// Nulls for the counts this category doesn't have, to spread over what the
// client sent: the columns default to 1 and older apps still send them
export function categoryFieldOverrides(category?: PropertyCategory | null) {
  if (!category) return {};
  const fields = CATEGORY_FIELDS[category];
  return {
    ...(fields.rooms ? {} : { beds: null }),
    ...(fields.baths ? {} : { baths: null }),
    ...(fields.floors ? {} : { floors: null }),
    ...(fields.propertyAge ? {} : { propertyAge: null }),
  };
}
