import { Prisma, PropertyCategory } from '@prisma/client';

// --- Map a property's DB category to the Arabic label shown in the app ---
const PROPERTY_CATEGORY_LABELS: Record<PropertyCategory, string> = {
  APARTMENT: 'سكني',
  HOUSE: 'سكني',
  VILLA: 'سكني',
  RESIDENTIAL: 'سكني',
  CHALET: 'سكني',
  COMMERCIAL: 'تجاري',
  OFFICE: 'تجاري',
  INVESTMENT: 'استثماري',
  INDUSTRIAL: 'استثماري',
  COASTAL: 'استثماري',
  PRIVATE: 'استثماري',
  BUILDING: 'استثماري',
  LAND: 'استثماري',
};

export function mapPropertyCategoryToType(category: PropertyCategory): string {
  return PROPERTY_CATEGORY_LABELS[category];
}

// --- Split a free-text services string into individual service cards ---
export function formatServiceList(raw: string | null, ownerName: string) {
  const rawServices = raw
    ? raw
        .split(/[,،\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return rawServices.map((svc, idx) => ({
    id: String(idx + 1),
    title: svc,
    description: `خدمات ${svc} المقدمة من ${ownerName}`,
  }));
}

const officeListingProperty = Prisma.validator<Prisma.PropertyDefaultArgs>()({
  select: {
    id: true,
    images: true,
    price: true,
    isFeatured: true,
    category: true,
    location: true,
    areaSize: true,
    beds: true,
    baths: true,
    createdAt: true,
    phoneNumber: true,
    propertyIncome: true,
  },
});
export type OfficeListingProperty = Prisma.PropertyGetPayload<
  typeof officeListingProperty
>;
export const OFFICE_LISTING_PROPERTY_SELECT = officeListingProperty.select;

// --- Format an office's raw listings into the mobile app's PropertyDto shape ---
export function formatOfficeListings(
  properties: OfficeListingProperty[],
  companyName: string,
) {
  return properties.map((p) => ({
    id: p.id,
    images: p.images,
    price: p.price,
    companyName,
    isFeatured: p.isFeatured,
    type: mapPropertyCategoryToType(p.category),
    area: p.areaSize,
    beds: p.beds,
    baths: p.baths,
    location: p.location,
    createdAt: p.createdAt,
    phoneNumber: p.phoneNumber,
    phone: p.phoneNumber,
    propertyIncome: p.propertyIncome,
  }));
}
