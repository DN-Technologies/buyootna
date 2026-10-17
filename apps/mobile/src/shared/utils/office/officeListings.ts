import { GOVERNORATES } from '@/shared/utils/data/locations';
import { PropertyDto } from '@/types/feed';

export type OfficeDeal = 'SALE' | 'RENT' | 'EXCHANGE';

// بيع / ايجار / بدل, in the order the governorate screen's tabs show them
export const OFFICE_DEAL_TABS: { id: OfficeDeal; label: string }[] = [
  { id: 'SALE', label: 'بيع' },
  { id: 'RENT', label: 'ايجار' },
  { id: 'EXCHANGE', label: 'بدل' },
];

export interface OfficeGovernorateGroup {
  governorateId: string;
  // "محافظة العاصمة"
  title: string;
  count: number;
  // Distinct categories, newest ad's first
  categories: string[];
  latestAt: string;
}

export const governorateTitle = (governorateId: string) => {
  const label = GOVERNORATES.find((g) => g.id === governorateId)?.label;
  return label ? `محافظة ${label}` : 'مناطق أخرى';
};

const latestOf = (item: PropertyDto) => item.publishedAt || item.createdAt;

/**
 * An office's live ads as one card per governorate (the profile's الاعلانات
 * tab): how many, which categories, and when the newest went up. In the
 * order of the governorates list; ads without one come last.
 */
export function groupByGovernorate(
  properties: PropertyDto[],
): OfficeGovernorateGroup[] {
  const groups = new Map<string, PropertyDto[]>();
  for (const item of properties) {
    const key = item.governorateId || 'other';
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  const order = [...GOVERNORATES.map((g) => g.id), 'other'];
  return order
    .filter((id) => groups.has(id))
    .map((id) => {
      const items = [...groups.get(id)!].sort(
        (a, b) =>
          new Date(latestOf(b)).getTime() - new Date(latestOf(a)).getTime(),
      );
      const categories = [
        ...new Set(
          items
            .map((item) => item.categoryLabel)
            .filter((label): label is string => !!label),
        ),
      ];
      return {
        governorateId: id,
        title: governorateTitle(id),
        count: items.length,
        categories,
        latestAt: latestOf(items[0]),
      };
    });
}

/** The ads of one governorate and deal, newest first. */
export function officeListingsFor(
  properties: PropertyDto[],
  governorateId: string,
  deal: OfficeDeal,
): PropertyDto[] {
  return properties
    .filter(
      (item) =>
        (item.governorateId || 'other') === governorateId &&
        item.listingType === deal,
    )
    .sort(
      (a, b) =>
        new Date(latestOf(b)).getTime() - new Date(latestOf(a)).getTime(),
    );
}
