import { Text, View } from 'react-native';

import type { ListingStateData } from '@/shared/store/useListingStore';
import { getCategoryFields } from '@/shared/utils/data/propertyCategories';

interface PreviewEntry {
  label: string;
  value: string | number;
}

const PreviewItem = ({ label, value }: PreviewEntry) => (
  <View className="flex-1 items-start" style={{ gap: 4 }}>
    <Text className="font-cairo-medium text-xs text-[#979797]">{label}</Text>
    <Text
      className="font-cairo-bold text-sm text-[#15304D]"
      style={{ writingDirection: 'rtl' }}
    >
      {value === '' ? '-' : value}
    </Text>
  </View>
);

const LISTING_TYPE_LABELS = { sell: 'بيع', rent: 'إيجار', exchange: 'بدل' };

/** The two-per-row facts of the ad; a field the category lacks is left out. */
function pairedEntries(draft: ListingStateData): PreviewEntry[] {
  const fields = getCategoryFields(draft.propertyCategory?.id);
  const entries: PreviewEntry[] = [
    { label: 'فئة العقار', value: draft.propertyCategory?.label ?? '' },
    { label: 'المساحة', value: draft.areaSize ? `${draft.areaSize} م²` : '' },
  ];

  if (draft.listingType === 'exchange') {
    entries.push(
      { label: 'سنة الطلب', value: draft.requestYear },
      { label: 'السنة المطلوبة', value: draft.requiredYear },
    );
  } else {
    if (fields.propertyAge) {
      entries.push({
        label: 'عمر العقار',
        value: draft.propertyAge ? `${draft.propertyAge} سنوات` : '',
      });
    }
    entries.push({ label: 'الرقم الالي للعقار', value: draft.automatedNumber });
  }

  if (fields.baths) entries.push({ label: 'عدد الحمامات', value: draft.baths });
  if (fields.rooms) entries.push({ label: 'عدد الغرف', value: draft.rooms });
  if (fields.floors) entries.push({ label: 'عدد الادوار', value: draft.floors });

  entries.push({ label: 'المزايا', value: draft.features?.join('، ') ?? '' });
  if (draft.showPhone) {
    entries.push({ label: 'رقم الهاتف', value: draft.phoneNumber });
  }
  if (draft.showWhatsapp) {
    entries.push({ label: 'رقم الواتساب', value: draft.whatsappNumber });
  }

  const isRent = draft.listingType === 'rent';
  const price = isRent ? draft.monthlyRent : draft.price;
  if (draft.showPrice && price) {
    entries.push({
      label: isRent ? 'الايجار الشهري' : 'السعر',
      value: `${price} د.ك`,
    });
  }
  if (draft.listingType === 'sell' && draft.showIncome && draft.propertyIncome) {
    entries.push({
      label: 'مدخول العقار',
      value: `${draft.propertyIncome} د.ك`,
    });
  }
  return entries;
}

/** The full-width text blocks under the paired facts. */
function wideEntries(draft: ListingStateData): PreviewEntry[] {
  const entries: PreviewEntry[] = [
    {
      label: 'الموقع',
      value:
        draft.mapLocationLabel ||
        [draft.governorate?.label, draft.area?.label]
          .filter(Boolean)
          .join(' - '),
    },
  ];
  if (draft.listingType === 'rent') {
    if (draft.additionalExpenses) {
      entries.push({
        label: 'المصاريف الاضافية',
        value: draft.additionalExpenses,
      });
    }
    if (draft.rentConditions) {
      entries.push({ label: 'شروط الايجار', value: draft.rentConditions });
    }
  }
  if (draft.listingType === 'exchange' && draft.allocationState) {
    entries.push({ label: 'حالة التخصيص', value: draft.allocationState });
  }
  entries.push(
    { label: 'تفاصيل الاعلان', value: draft.adDetails || 'لا يوجد تفاصيل.' },
    {
      label: 'نوع الاعلان',
      value: draft.adLevel === 'premium' ? 'اعلان مميز' : 'اعلان عادي',
    },
  );
  return entries;
}

interface PreviewDetailsCardProps {
  draftData: ListingStateData;
}

export default function PreviewDetailsCard({
  draftData,
}: PreviewDetailsCardProps) {
  const paired = pairedEntries(draftData);
  const rows: PreviewEntry[][] = [];
  for (let i = 0; i < paired.length; i += 2) rows.push(paired.slice(i, i + 2));

  return (
    <View className="mb-5 w-full" style={{ gap: 20 }}>
      <View className="flex-row">
        <PreviewItem
          label="نوع الاعلان"
          value={LISTING_TYPE_LABELS[draftData.listingType]}
        />
      </View>

      {rows.map((row) => (
        <View key={row[0].label} className="flex-row" style={{ gap: 16 }}>
          {row.map((entry) => (
            <PreviewItem key={entry.label} {...entry} />
          ))}
          {/* Keep a lone last fact in its own half */}
          {row.length === 1 && <View className="flex-1" />}
        </View>
      ))}

      {wideEntries(draftData).map((entry) => (
        <View key={entry.label} className="flex-row">
          <PreviewItem {...entry} />
        </View>
      ))}
    </View>
  );
}
