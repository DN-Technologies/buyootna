import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import {
  categoryDetailEntries,
  CategoryDetailValues,
} from '@/shared/utils/categoryDetails';
import {
  findCategoryByApiValue,
  getCategoryFields,
} from '@/shared/utils/data/propertyCategories';
import { formatNumber } from '@/shared/utils/formatNumber';

interface PropertyCategoryFactsProps extends CategoryDetailValues {
  // The API's category (e.g. BUILDING) and deal type
  category?: string | null;
  type: 'SALE' | 'RENT' | 'EXCHANGE';
  propertyIncome?: number | null;
  // The advertiser declared they own it («أنا مالك العقار»)
  isOwner?: boolean | null;
}

/**
 * تفاصيل الفئة on the ad page: what the category adds (requirements doc) --
 * a flat's floor, a building's flats, rental status and income, land's use
 * and allocation, units and monthly income, a farm's مزروعة / مبنية -- and
 * «المعلن هو المالك» when the advertiser declared it.
 */
export default function PropertyCategoryFacts({
  category,
  type,
  propertyIncome,
  isOwner,
  ...values
}: PropertyCategoryFactsProps) {
  const fields = getCategoryFields(findCategoryByApiValue(category)?.id);
  const entries = categoryDetailEntries(fields, values);
  // A building's income on a rent / exchange ad (a sale shows it with the price)
  if (fields.apartments && type !== 'SALE' && (propertyIncome ?? 0) > 0) {
    entries.push({
      label: 'مدخول العقار',
      value: `${formatNumber(propertyIncome!)} د.ك`,
    });
  }

  if (entries.length === 0 && !isOwner) return null;

  return (
    <View testID="property-category-facts" className="mb-2 px-5">
      {entries.length > 0 && (
        <View className="flex-row flex-wrap" style={{ rowGap: 12 }}>
          {entries.map((entry) => (
            <View key={entry.label} className="w-1/2 pe-2" style={{ gap: 2 }}>
              <Text
                className="font-cairo-semibold text-sm text-[#6B6A6A]"
                style={{ writingDirection: 'rtl' }}
              >
                {entry.label}
              </Text>
              <Text
                className="font-cairo-bold text-sm text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                {entry.value}
              </Text>
            </View>
          ))}
        </View>
      )}
      {isOwner && (
        <View
          testID="property-owner-badge"
          className="mt-3 flex-row items-center self-start rounded-full bg-[#EEF4FB] px-3 py-1"
          style={{ gap: 6 }}
        >
          <Feather name="check-circle" size={14} color="#15304D" />
          <Text className="font-cairo-semibold text-xs text-[#15304D]">
            المعلن هو المالك
          </Text>
        </View>
      )}
    </View>
  );
}
