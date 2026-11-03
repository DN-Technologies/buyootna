import { ActivityItem } from '@/shared/hooks/properties/useMyActivity';
import { AREAS, GOVERNORATES } from '@/shared/utils/data/locations';
import { getArabicCategoryLabel } from '@/shared/utils/helpers/property';
import {
  governorateTitle,
  type OfficeDeal,
} from '@/shared/utils/office/officeListings';

/** The office's own ads, as its عقارات tab splits them. */
export type OfficeTab = 'ads' | 'drafts' | 'archived';

// Expired or marked as done (تم البيع): what «إعادة النشر» can bring back
const ARCHIVED: ActivityItem['status'][] = ['EXPIRED', 'CLOSED'];

export function splitByTab(items: ActivityItem[]) {
  return {
    ads: items.filter((item) => item.status === 'ACTIVE'),
    drafts: items.filter((item) => item.status === 'DRAFT'),
    archived: items.filter((item) => ARCHIVED.includes(item.status)),
  };
}

const governorateOf = (item: ActivityItem) => item.governorateId || 'other';

export interface OwnerGovernorateSummary {
  governorateId: string;
  title: string;
  count: number;
  featuredCount: number;
  // Distinct category labels, as the card's chips
  categories: string[];
}

/**
 * One card per governorate, all six even when empty (Figma 4494:145517 shows
 * «0 عقارات»), then ads with no governorate, if any.
 */
export function governorateSummaries(
  ads: ActivityItem[],
): OwnerGovernorateSummary[] {
  const ids = [...GOVERNORATES.map((g) => g.id)];
  if (ads.some((ad) => governorateOf(ad) === 'other')) ids.push('other');
  return ids.map((id) => {
    const inIt = ads.filter((ad) => governorateOf(ad) === id);
    return {
      governorateId: id,
      title: governorateTitle(id),
      count: inIt.length,
      featuredCount: inIt.filter((ad) => ad.isPremium).length,
      categories: [
        ...new Set(
          inIt.map((ad) => getArabicCategoryLabel(ad.category)).filter(Boolean),
        ),
      ],
    };
  });
}

export type GovernorateAdFilter = 'ALL' | 'ACTIVE' | 'FEATURED' | 'HIDDEN';
export type GovernorateAdSort =
  | 'ALL'
  | 'NEWEST'
  | 'OLDEST'
  | 'PRICE_ASC'
  | 'PRICE_DESC';

// Figma 4494:146425
export const GOVERNORATE_FILTER_OPTIONS = [
  { label: 'الكل', value: 'ALL' },
  { label: 'نشطة', value: 'ACTIVE' },
  { label: 'مميزة', value: 'FEATURED' },
  { label: 'الاعلانات المخفية', value: 'HIDDEN' },
];

// Figma 4494:146395
export const GOVERNORATE_SORT_OPTIONS = [
  { label: 'الكل', value: 'ALL' },
  { label: 'الأحدث أولاً', value: 'NEWEST' },
  { label: 'الأقدم أولاً', value: 'OLDEST' },
  { label: 'السعر (من الأقل للأعلى)', value: 'PRICE_ASC' },
  { label: 'السعر (من الأعلى للأقل)', value: 'PRICE_DESC' },
];

const publishedAt = (item: ActivityItem) =>
  new Date(item.publishedAt || item.createdAt || item.updatedAt).getTime();

/** One governorate's ads, before the deal tab. */
export function governorateAds(
  ads: ActivityItem[],
  governorateId: string,
  areaId: string | null,
) {
  return ads.filter(
    (ad) =>
      governorateOf(ad) === governorateId && (!areaId || ad.areaId === areaId),
  );
}

export function dealCounts(ads: ActivityItem[]): Record<OfficeDeal, number> {
  return {
    SALE: ads.filter((ad) => ad.listingType === 'SALE').length,
    RENT: ads.filter((ad) => ad.listingType === 'RENT').length,
    EXCHANGE: ads.filter((ad) => ad.listingType === 'EXCHANGE').length,
  };
}

/** One deal tab's cards, filtered and sorted. */
export function visibleAds(
  ads: ActivityItem[],
  deal: OfficeDeal,
  filter: GovernorateAdFilter,
  sort: GovernorateAdSort,
): ActivityItem[] {
  const shown = ads.filter((ad) => {
    if (ad.listingType !== deal) return false;
    if (filter === 'ACTIVE') return !ad.isHidden;
    if (filter === 'FEATURED') return !!ad.isPremium;
    if (filter === 'HIDDEN') return !!ad.isHidden;
    return true;
  });
  const price = (ad: ActivityItem) => ad.price ?? 0;
  switch (sort) {
    case 'NEWEST':
      return [...shown].sort((a, b) => publishedAt(b) - publishedAt(a));
    case 'OLDEST':
      return [...shown].sort((a, b) => publishedAt(a) - publishedAt(b));
    case 'PRICE_ASC':
      return [...shown].sort((a, b) => price(a) - price(b));
    case 'PRICE_DESC':
      return [...shown].sort((a, b) => price(b) - price(a));
    default:
      // «الكل»: featured first, then newest (the market's own order)
      return [...shown].sort(
        (a, b) =>
          Number(!!b.isPremium) - Number(!!a.isPremium) ||
          publishedAt(b) - publishedAt(a),
      );
  }
}

/** The المنطقة dropdown's choices for a governorate. */
export const areasOf = (governorateId: string) => AREAS[governorateId] ?? [];

/** «تم البيع» / «تم التأجير» / «تمت المبادلة», for the ad's deal. */
export function markDoneLabel(item: Pick<ActivityItem, 'listingType'>) {
  if (item.listingType === 'RENT') return 'تم التأجير';
  if (item.listingType === 'EXCHANGE') return 'تمت المبادلة';
  return 'تم البيع';
}

/** «1.4K»: the total views tile (Figma 4494:145538). */
export function compactCount(value: number): string {
  if (value < 1000) return String(value);
  const thousands = value / 1000;
  return `${thousands >= 10 ? Math.floor(thousands) : Math.floor(thousands * 10) / 10}K`;
}
