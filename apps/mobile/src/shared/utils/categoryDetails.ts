import {
  CategoryFields,
  landUseLabel,
} from '@/shared/utils/data/propertyCategories';
import { formatNumber } from '@/shared/utils/formatNumber';

/** The per-category values of an ad (requirements doc), as they are stored. */
export interface CategoryDetailValues {
  floorNumber?: number | null;
  apartmentsCount?: number | null;
  rentalStatus?: string | null;
  landUse?: string | null;
  allocationStatus?: string | null;
  unitsCount?: number | null;
  monthlyIncome?: number | string | null;
  isCultivated?: boolean | null;
  isBuilt?: boolean | null;
}

export interface CategoryDetailEntry {
  label: string;
  value: string;
}

const yesNo = (value?: boolean | null) => (value ? 'نعم' : 'لا');
const amount = (value?: number | string | null) => {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return n ? `${formatNumber(n)} د.ك` : null;
};

/**
 * What an ad shows for its category: a flat's floor, a building's flats and
 * rental status, land's use and allocation, the units and monthly income of
 * commercial / investment property, a farm's مزروعة / مبنية. Only the
 * category's own fields, and only those with a value (a farm always says
 * yes or no).
 */
export function categoryDetailEntries(
  fields: CategoryFields,
  values: CategoryDetailValues,
): CategoryDetailEntry[] {
  const entries: CategoryDetailEntry[] = [];
  const add = (label: string, value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === '') return;
    entries.push({ label, value: String(value) });
  };

  if (fields.floorNumber) {
    add(
      'رقم الدور',
      values.floorNumber === 0 ? 'الأرضي' : values.floorNumber,
    );
  }
  if (fields.apartments) {
    add('عدد الشقق', values.apartmentsCount || null);
    add('حالة التأجير', values.rentalStatus);
  }
  if (fields.landUse) {
    add('نوع التخصيص', landUseLabel(values.landUse));
    add('حالة التخصيص', values.allocationStatus);
  }
  if (fields.units) {
    add('عدد الوحدات أو المحلات', values.unitsCount || null);
    add('الدخل الشهري', amount(values.monthlyIncome));
  }
  if (fields.farm) {
    add('مزروعة', yesNo(values.isCultivated));
    add('مبنية', yesNo(values.isBuilt));
  }
  return entries;
}
