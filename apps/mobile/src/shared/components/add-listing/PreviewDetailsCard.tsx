import { Text, View } from 'react-native';

import type { ListingStateData } from '@/shared/store/useListingStore';

const PreviewItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined | null;
}) => (
  <View className="flex-1 items-start">
    <Text className="text-right font-cairo-medium text-[12px] text-[#A0A0A0]">
      {label}
    </Text>
    <Text className="text-right font-cairo-bold text-[14px] text-[#15304D]">
      {value || '-'}
    </Text>
  </View>
);

interface PreviewDetailsCardProps {
  draftData: ListingStateData;
}

export default function PreviewDetailsCard({
  draftData,
}: PreviewDetailsCardProps) {
  const listingTypeLabel =
    draftData.listingType === 'sell'
      ? 'بيع'
      : draftData.listingType === 'rent'
        ? 'إيجار'
        : 'بدل';

  const adLevelLabel =
    draftData.adLevel === 'premium' ? 'إعلان مميز' : 'إعلان عادي';

  return (
    <View className="mb-6 rounded-xl border border-gray-100 bg-[#FAFAFA] p-4">
      {/* Row 1: نوع الاعلان */}
      <View className="mb-4 flex-row">
        <PreviewItem label="نوع الاعلان" value={listingTypeLabel} />
      </View>

      {/* Row 2: فئة العقار & المساحة */}
      <View className="mb-4 flex-row gap-4" style={{ gap: 16 }}>
        <PreviewItem
          label="فئة العقار"
          value={draftData.propertyCategory?.label}
        />
        <PreviewItem
          label="المساحة"
          value={draftData.areaSize ? `${draftData.areaSize} م²` : '-'}
        />
      </View>

      {/* Row 3: عمر العقار / سنة الطلب */}
      {draftData.listingType === 'exchange' ? (
        <View className="mb-4 flex-row gap-4" style={{ gap: 16 }}>
          <PreviewItem label="سنة الطلب" value={draftData.requestYear} />
          <PreviewItem label="السنة المطلوبة" value={draftData.requiredYear} />
        </View>
      ) : (
        <View className="mb-4 flex-row gap-4" style={{ gap: 16 }}>
          <PreviewItem
            label="عمر العقار"
            value={
              draftData.propertyAge ? `${draftData.propertyAge} سنوات` : '-'
            }
          />
          <PreviewItem
            label="الرقم الالي للعقار"
            value={draftData.automatedNumber}
          />
        </View>
      )}

      {/* Row 4: الحمامات & الغرف & الأدوار */}
      <View className="mb-4 flex-row gap-4" style={{ gap: 16 }}>
        {draftData.listingType !== 'sell' && (
          <PreviewItem label="عدد الادوار" value={draftData.floors} />
        )}
        <PreviewItem label="عدد الحمامات" value={draftData.baths} />
        <PreviewItem label="عدد الغرف" value={draftData.rooms} />
      </View>

      {/* Row 5: المزايا & رقم الهاتف */}
      <View className="mb-4 flex-row gap-4" style={{ gap: 16 }}>
        <PreviewItem
          label="المزايا"
          value={draftData.features?.join('، ') || '-'}
        />
        <PreviewItem label="رقم الهاتف" value={draftData.phoneNumber} />
      </View>

      {/* Row 6: Pricing / Rent / Allocation Details */}
      {draftData.listingType === 'rent' ? (
        <View className="mb-4 flex-row gap-4" style={{ gap: 16 }}>
          <PreviewItem
            label="الايجار الشهري"
            value={
              draftData.monthlyRent
                ? `${draftData.monthlyRent} د.ك`
                : 'غير محدد'
            }
          />
          {draftData.additionalExpenses ? (
            <PreviewItem
              label="المصاريف الاضافية"
              value={draftData.additionalExpenses}
            />
          ) : null}
        </View>
      ) : draftData.listingType === 'exchange' ? (
        draftData.allocationState ? (
          <View className="mb-4 items-start">
            <Text className="mb-1 text-right font-cairo-medium text-[12px] text-[#A0A0A0]">
              حالة التخصيص
            </Text>
            <Text className="text-right font-cairo-bold text-[14px] text-[#15304D]">
              {draftData.allocationState}
            </Text>
          </View>
        ) : null
      ) : draftData.showPrice && draftData.price ? (
        <View className="mb-4 flex-row">
          <PreviewItem label="السعر" value={`${draftData.price} د.ك`} />
        </View>
      ) : null}

      {/* Row 7: الموقع */}
      <View className="mb-4 items-start">
        <Text className="mb-1 text-right font-cairo-medium text-[12px] text-[#A0A0A0]">
          الموقع
        </Text>
        <Text className="text-right font-cairo-semibold text-[14px] text-[#15304D]">
          {draftData.mapLocationLabel
            ? draftData.mapLocationLabel
            : `${draftData.governorate?.label || ''} - ${draftData.area?.label || ''}`}
        </Text>
      </View>

      {/* Row 8: تفاصيل الاعلان */}
      <View className="mb-4 w-full items-start">
        <Text className="mb-1 text-right font-cairo-medium text-[12px] text-[#A0A0A0]">
          تفاصيل الاعلان
        </Text>
        <Text
          className="font-cairo-semibold text-[13px] leading-6 text-[#15304D]"
          style={{ writingDirection: 'rtl' }}
        >
          {draftData.adDetails || 'لا يوجد تفاصيل.'}
        </Text>
      </View>

      {/* Row 9: نوع الاعلان */}
      <View className="items-start">
        <Text className="mb-1 text-right font-cairo-medium text-[12px] text-[#A0A0A0]">
          نوع الاعلان
        </Text>
        <Text className="text-right font-cairo-bold text-[14px] text-[#15304D]">
          {adLevelLabel}
        </Text>
      </View>
    </View>
  );
}
