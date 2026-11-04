import { AREAS, GOVERNORATES } from '@/shared/utils/data/locations';

/** تصفية البحث's tabs (Figma 5550:138840 بيع, 5550:138765 ايجار, 5550:138675 بدل). */
export type HomeFilterTab = 'sale' | 'rent' | 'exchange' | 'offices';

export const HOME_FILTER_TABS: { id: HomeFilterTab; label: string }[] = [
  { id: 'sale', label: 'بيع' },
  { id: 'rent', label: 'ايجار' },
  { id: 'exchange', label: 'بدل' },
  { id: 'offices', label: 'مكاتب' },
];

export interface HomeFilters {
  // Location ids (the API's governorate and area ids)
  governorateId: string;
  areaId: string;
  // فئة العقار (بيع / ايجار), several at once: PropertyCategory values
  categories: string[];
  // الحالة (بدل): مبنى is a house, أرض a plot
  exchangeCategory: '' | 'HOUSE' | 'LAND';
  // سنة الطلب / السنة المطلوبة (بدل)
  requestYear: string;
  requiredYear: string;
  // السعر: the most the user would pay, in KWD digits
  maxPrice: string;
}

export const EMPTY_HOME_FILTERS: HomeFilters = {
  governorateId: '',
  areaId: '',
  categories: [],
  exchangeCategory: '',
  requestYear: '',
  requiredYear: '',
  maxPrice: '',
};

export type HomeFiltersByTab = Record<HomeFilterTab, HomeFilters>;

export const EMPTY_FILTERS_BY_TAB: HomeFiltersByTab = {
  sale: EMPTY_HOME_FILTERS,
  rent: EMPTY_HOME_FILTERS,
  exchange: EMPTY_HOME_FILTERS,
  offices: EMPTY_HOME_FILTERS,
};

/** فئة العقار on بيع and ايجار, in the design's order (Figma 5550:138897). */
export const SALE_RENT_CATEGORIES = [
  { id: 'CHALET', label: 'شاليه' },
  { id: 'APARTMENT', label: 'شقة' },
  { id: 'HOUSE', label: 'بيت' },
  { id: 'COMMERCIAL', label: 'تجاري' },
  { id: 'BUILDING', label: 'عمارة' },
  { id: 'OFFICE', label: 'مكتب' },
];

/** الحالة on بدل: a swap is a house or a plot (the add form offers those two). */
export const EXCHANGE_CATEGORIES = [
  { id: 'LAND' as const, label: 'أرض' },
  { id: 'HOUSE' as const, label: 'مبنى' },
];

const digits = (value: string) => value.replace(/[^\d]/g, '');

/** The fields a tab shows; what's set on the others doesn't count there. */
export function hasHomeFilters(tab: HomeFilterTab, f: HomeFilters): boolean {
  if (f.governorateId || f.areaId) return true;
  if (tab === 'offices') return false;
  if (digits(f.maxPrice)) return true;
  if (tab === 'exchange') {
    return !!(f.exchangeCategory || digits(f.requestYear) || digits(f.requiredYear));
  }
  return f.categories.length > 0;
}

/** Query params for GET /properties (governorateId, areaId, category, …). */
export function toPropertyFilterParams(
  tab: Exclude<HomeFilterTab, 'offices'>,
  f: HomeFilters,
): Record<string, string> {
  const params: Record<string, string> = {};
  if (f.governorateId) params.governorateId = f.governorateId;
  if (f.areaId) params.areaId = f.areaId;
  const maxPrice = digits(f.maxPrice);
  if (maxPrice) params.maxPrice = maxPrice;
  if (tab === 'exchange') {
    if (f.exchangeCategory) params.category = f.exchangeCategory;
    const requestYear = digits(f.requestYear);
    const requiredYear = digits(f.requiredYear);
    if (requestYear) params.requestYear = requestYear;
    if (requiredYear) params.requiredYear = requiredYear;
  } else if (f.categories.length) {
    params.category = f.categories.join(',');
  }
  return params;
}

/**
 * GET /users/offices matches places by name in an office's address: the
 * area's name when one is picked, else the governorate's.
 */
export function toOfficeLocation(f: HomeFilters): string | undefined {
  const area = (AREAS[f.governorateId] ?? []).find((a) => a.id === f.areaId);
  if (area) return area.label;
  return GOVERNORATES.find((g) => g.id === f.governorateId)?.label;
}
