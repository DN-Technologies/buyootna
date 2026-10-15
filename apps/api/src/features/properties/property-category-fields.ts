import { ListingType, PropertyCategory } from '@prisma/client';

// Which fields an ad of each category has, from the requirements document
// ("اضافات في المستقبل", المتغير حسب الفئة). Mirrors the mobile app's
// apps/mobile/src/shared/utils/data/propertyCategories.ts -- change both.
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

export const CATEGORY_FIELDS: Record<PropertyCategory, CategoryFields> = {
  // عمر العقار، الغرف، الحمامات، عدد الأدوار
  HOUSE: { ...ROOMS_AND_BATHS, floors: true },
  // عمر العقار، الغرف، الحمامات، رقم الدور (not the floors count)
  APARTMENT: { ...ROOMS_AND_BATHS, floorNumber: true },
  // عمر العقار، عدد الأدوار، عدد الشقق، مدخول العقار، حالة التأجير
  BUILDING: { ...NONE, propertyAge: true, floors: true, apartments: true },
  // نوع التخصيص، حالة التخصيص
  LAND: { ...NONE, landUse: true },
  // عمر العقار، عدد الوحدات أو المحلات، الدخل الشهري
  COMMERCIAL: { ...NONE, propertyAge: true, units: true },
  INVESTMENT: { ...NONE, propertyAge: true, units: true },
  // عمر العقار، الغرف، الحمامات
  CHALET: ROOMS_AND_BATHS,
  // مزروعة، مبنية
  FARM: { ...NONE, farm: true },
  // No longer offered for new ads; existing ads keep what they had
  OFFICE: ROOMS_AND_BATHS,
  VILLA: ROOMS_AND_BATHS,
  RESIDENTIAL: ROOMS_AND_BATHS,
  INDUSTRIAL: ROOMS_AND_BATHS,
  COASTAL: ROOMS_AND_BATHS,
  PRIVATE: ROOMS_AND_BATHS,
};

/**
 * Nulls for the fields this category doesn't have, to spread over what the
 * client sent: the counts default to 1, older apps still send them, and a
 * category changed while editing must not keep the old one's fields.
 *
 * حالة التخصيص stays on every exchange ad (the deal type's own field) and
 * on land; مدخول العقار stays on a sale ad and on a building.
 */
export function categoryFieldOverrides(
  category?: PropertyCategory | null,
  listingType?: ListingType | null,
) {
  if (!category) return {};
  const fields = CATEGORY_FIELDS[category];
  return {
    ...(fields.rooms ? {} : { beds: null }),
    ...(fields.baths ? {} : { baths: null }),
    ...(fields.floors ? {} : { floors: null }),
    ...(fields.floorNumber ? {} : { floorNumber: null }),
    ...(fields.propertyAge ? {} : { propertyAge: null }),
    ...(fields.apartments ? {} : { apartmentsCount: null, rentalStatus: null }),
    ...(fields.landUse ? {} : { landUse: null }),
    ...(fields.landUse || listingType === ListingType.EXCHANGE
      ? {}
      : { allocationStatus: null }),
    ...(fields.units ? {} : { unitsCount: null, monthlyIncome: null }),
    ...(fields.farm ? {} : { isCultivated: null, isBuilt: null }),
    ...(fields.apartments || listingType === ListingType.SALE
      ? {}
      : { propertyIncome: null }),
  };
}

// --- The price must be clear (Ministry of Commerce, December 2024) ---

// «حد» (a floor price), «سوم» (open to offers), «مراجعة» (price on
// request), as whole words with or without the article or a preposition.
// They count only next to a price -- «سعر», a currency, «ألف» or a number
// within a few words -- so «الحد الشمالي» of a plot or «مراجعة البلدية» is
// left alone.
const QUALIFIER_WORD =
  /(^|[^\u0621-\u064A])(?:[وبلف]?ال|[وبلف])?(حد|حده|سوم|مراجعه|مراجعة)(?=$|[^\u0621-\u064A])/g;
const PRICE_NEARBY = /سعر|د\.?\s?ك|دينار|ال?ف|[0-9\u0660-\u0669]/;
const NEARBY_CHARS = 25;

// Hamza forms, diacritics and tatweel folded, so «الـسوم» still matches
const normalize = (text: string) =>
  text
    .replace(/\u0640/g, '')
    .replace(/[\u064B-\u0652]/g, '')
    .replace(/[أإآ]/g, 'ا');

/** Whether the ad's text qualifies its price with a forbidden word. */
export function qualifiesPrice(text?: string | null): boolean {
  if (!text) return false;
  const plain = normalize(text);
  for (const match of plain.matchAll(QUALIFIER_WORD)) {
    const start = match.index ?? 0;
    const around = plain.slice(
      Math.max(0, start - NEARBY_CHARS),
      start + match[0].length + NEARBY_CHARS,
    );
    if (PRICE_NEARBY.test(around)) return true;
  }
  return false;
}

export const PRICE_QUALIFIER_MESSAGE =
  'وفق قرار وزارة التجارة (ديسمبر 2024) يجب أن يكون السعر واضحاً ومحدداً، ولا يجوز إضافة كلمات مثل «حد» أو «سوم» أو «مراجعة» إليه. احذفها من تفاصيل الإعلان.';
