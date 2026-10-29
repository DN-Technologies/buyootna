import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { AreaIcon, LocationIcon } from '@/assets/icons/home/property';
import { hasExchangeYears } from '@/shared/components/property/ExchangeYears';
import { SafeLinearGradient } from '@/shared/components/ui/SafeLinearGradient';
import { formatNumber } from '@/shared/utils/formatNumber';
import { getArabicTypeLabel } from '@/shared/utils/helpers/property';
import { PropertyDto } from '@/types/feed';

interface MarketPropertyCardProps {
  property: PropertyDto;
  onPress?: () => void;
}

function Year({ value }: { value: string }) {
  return (
    <View className="flex-row items-center gap-1">
      <Feather name="calendar" size={14} color="#111111" />
      <Text
        className="font-cairo-medium text-[14px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        {value}
      </Text>
    </View>
  );
}

// عقارات السوق: a market ad, as the office home's "home card"
export default function MarketPropertyCard({
  property,
  onPress,
}: MarketPropertyCardProps) {
  const title = [
    property.categoryLabel,
    getArabicTypeLabel(property.listingType),
  ]
    .filter(Boolean)
    .join(' ');
  // The API sends null for an exchange/deal ad without a price
  const price = property.price as number | null;
  const showYears = hasExchangeYears(
    property.requestYear,
    property.requiredYear,
  );
  const income = property.propertyIncome ?? 0;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="w-[247px] justify-between gap-2.5 rounded-[6px] border border-[#ECECEC] bg-[#FEFEFE] p-3"
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View className="gap-1.5">
        <View className="gap-2 pb-1">
          {/* RTL: the title (first) on the right, the badge on the left */}
          <View className="min-h-5 flex-row items-center justify-between gap-2">
            <Text
              className="flex-1 font-cairo-semibold text-[14px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
              numberOfLines={1}
            >
              {title}
            </Text>
            {property.isFeatured ? (
              <SafeLinearGradient
                colors={['#FF8D28', '#FACC15']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="h-5 w-[57px] items-center justify-center rounded-br-[10px] rounded-tl-[4px] rounded-tr-[10px]"
              >
                <Text className="font-almarai text-[12px] text-[#111111]">
                  مميز
                </Text>
              </SafeLinearGradient>
            ) : null}
          </View>

          <View className="flex-row items-end gap-0.5">
            {price !== null && price !== undefined ? (
              <>
                <Text className="font-cairo-semibold text-[22px] leading-[26px] text-[#15304D]">
                  {formatNumber(price)}
                </Text>
                <Text className="font-cairo-bold text-[12px] text-[#15304D]">
                  د.ك
                </Text>
              </>
            ) : (
              <Text
                className="font-cairo-semibold text-[18px] leading-[26px] text-[#15304D]"
                style={{ writingDirection: 'rtl' }}
              >
                السعر غير معلن
              </Text>
            )}
          </View>
        </View>

        {showYears && (
          <View className="flex-row items-center gap-2">
            <Year value={`طلب ${property.requestYear}`} />
            <Text className="font-cairo-medium text-[14px] text-[#111111]">
              مع
            </Text>
            <Year value={String(property.requiredYear)} />
          </View>
        )}

        <View className="flex-row items-center gap-3">
          <View className="shrink flex-row items-center gap-0.5">
            <LocationIcon size={16} color="#111111" />
            <Text
              className="shrink font-cairo text-[14px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
              numberOfLines={1}
            >
              {property.location}
            </Text>
          </View>
          {!!property.area && (
            <View className="flex-row items-center gap-0.5">
              <AreaIcon size={16} color="#111111" />
              <Text
                className="font-cairo text-[14px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                {`${formatNumber(property.area)} م2`}
              </Text>
            </View>
          )}
        </View>

        {income > 0 && (
          <View className="mt-1 gap-2 border-t border-[#ECECEC] pt-2">
            <View className="flex-row items-center justify-between">
              <Text
                className="font-cairo text-[14px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                مدخول العقار
              </Text>
              <View className="flex-row items-end gap-0.5">
                <Text className="font-cairo-bold text-[16px] text-[#018B1B]">
                  {formatNumber(income)}
                </Text>
                <Text className="font-cairo-semibold text-[12px] text-[#018B1B]">
                  د.ك
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <View className="h-6 w-full items-center justify-center rounded-[4px] bg-[#F5F7F9]">
        <Text
          className="font-cairo-semibold text-[14px] text-[#15304D]"
          style={{ writingDirection: 'rtl' }}
        >
          تفاصيل
        </Text>
      </View>
    </TouchableOpacity>
  );
}
