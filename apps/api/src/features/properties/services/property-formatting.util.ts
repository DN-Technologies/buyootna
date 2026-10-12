import { Prisma, PropertyCategory } from '@prisma/client';

// "عمارة للبيع": the listing type after the category label
export const LISTING_TYPE_LABELS: Record<string, string> = {
  SALE: 'للبيع',
  RENT: 'للإيجار',
  EXCHANGE: 'للبدل',
  AUCTION: 'في مزاد',
};

export const PROPERTY_CATEGORY_LABELS: Record<PropertyCategory, string> = {
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
};

export const propertyFeedPayload =
  Prisma.validator<Prisma.PropertyDefaultArgs>()({
    include: {
      identity: {
        select: {
          id: true,
          type: true,
          individualData: { select: { name: true } },
          companyData: { select: { name: true } },
          officeData: { select: { name: true } },
        },
      },
    },
  });

export type PropertyFeedPayload = Prisma.PropertyGetPayload<
  typeof propertyFeedPayload
>;
export const PROPERTY_FEED_INCLUDE = propertyFeedPayload.include;

export const companyFeedPayload =
  Prisma.validator<Prisma.IdentityDefaultArgs>()({
    include: {
      companyData: true,
    },
  });

export type CompanyFeedPayload = Prisma.IdentityGetPayload<
  typeof companyFeedPayload
>;
export const COMPANY_FEED_INCLUDE = companyFeedPayload.include;

export function generateReferenceNumber(): number {
  return Math.floor(1000000 + Math.random() * 9000000);
}

export function formatDateToMonthYear(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${year}`;
}

export function formatProperties(properties: PropertyFeedPayload[]) {
  return properties.map((p) => {
    const identity = p.identity;
    const displayName =
      identity?.companyData?.name ||
      identity?.officeData?.name ||
      identity?.individualData?.name ||
      'مستخدم';

    return {
      id: p.id,
      images: p.images,
      price: p.price,
      companyName: displayName,
      isFeatured: p.isFeatured,
      type:
        p.category === 'RESIDENTIAL'
          ? 'سكني'
          : p.category === 'COMMERCIAL'
            ? 'تجاري'
            : 'استثماري',
      categoryLabel: PROPERTY_CATEGORY_LABELS[p.category] || p.category,
      area: p.areaSize,
      // Shown on the cards as 'مدخول العقار' (only when above 0)
      propertyIncome: p.propertyIncome,
      beds: p.beds,
      baths: p.baths,
      location: p.location,
      createdAt: p.createdAt,
      publishedAt: p.publishedAt,
      phoneNumber: p.phoneNumber,
      whatsappNumber: p.whatsappNumber,
      identityId: identity?.id,
      identityType: identity?.type,
    };
  });
}

export function formatCompanies(
  identities: CompanyFeedPayload[],
  // Real rating/review count per identity (IdentityStatsService)
  stats: Map<string, { rating: number; reviewsCount: number }>,
  // Ads each company has posted, shown as its works count
  adsCount: Map<string, number>,
) {
  return identities
    .filter((i) => i.companyData !== null)
    .map((i) => ({
      id: i.id,
      name: i.companyData!.name,
      category: i.companyData!.services || '',
      rating: stats.get(i.id)?.rating ?? 0,
      reviewsCount: stats.get(i.id)?.reviewsCount ?? 0,
      projectsCount: String(adsCount.get(i.id) ?? 0),
      serviceArea: i.companyData!.serviceAreas,
      logoUrl: i.companyData!.logoUrl,
      isVerified: i.companyData!.isVerified,
    }));
}
