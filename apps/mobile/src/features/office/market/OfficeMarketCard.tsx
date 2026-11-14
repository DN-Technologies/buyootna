import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

import { HeartIcon } from '@/assets/icons/home/cards';
import { AreaIcon, LocationIcon } from '@/assets/icons/home/property';
import { hasExchangeYears } from '@/shared/components/property/ExchangeYears';
import { SafeLinearGradient } from '@/shared/components/ui/SafeLinearGradient';
import { formatNumber } from '@/shared/utils/formatNumber';
import { getArabicCategoryLabel } from '@/shared/utils/helpers/property';
import { PropertyDto } from '@/types/feed';

interface OfficeMarketCardProps {
  property: PropertyDto;
  isFavorited: boolean;
  onPress: () => void;
  onFavorite: () => void;
  onShare: () => void;
  onSuggest: () => void;
}

const BUILDING_ICON = require('@/assets/icons/office-market/building.svg');
const YEAR_ICON = require('@/assets/icons/office-market/year.svg');
const SHARE_ICON = require('@/assets/icons/office-market/share.svg');

const rtl = { writingDirection: 'rtl' as const };

// A year of an exchange: the icon on the right of its text (Figma)
function ExchangeYear({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-1">
      <Image source={YEAR_ICON} style={{ width: 16, height: 16 }} />
      <Text
        className="font-cairo-medium text-[14px] leading-[21px] text-[#111111]"
        style={rtl}
      >
        {label}
      </Text>
    </View>
  );
}

/**
 * عقارات السوق's card, as a list (Figma 4494:147645 بيع, 4494:147837 ايجار,
 * 4494:147888 بدل): the price and «مميز», the category, place and size,
 * then a sale's «مدخول العقار» or an exchange's years, and «عرض تفاصيل»,
 * «اقتراح لعميل», share and the heart.
 */
export default function OfficeMarketCard({
  property,
  isFavorited,
  onPress,
  onFavorite,
  onShare,
  onSuggest,
}: OfficeMarketCardProps) {
  // The API sends null for an exchange/deal ad without a price
  const price = property.price as number | null;
  const category =
    property.categoryLabel ||
    getArabicCategoryLabel((property as { category?: string }).category);
  const income = property.propertyIncome ?? 0;
  // Only an exchange ad has them
  const showYears = hasExchangeYears(
    property.requestYear,
    property.requiredYear,
  );

  return (
    <TouchableOpacity
      testID={`office-market-card-${property.id}`}
      activeOpacity={0.9}
      onPress={onPress}
      accessibilityRole="button"
      className="w-full gap-2.5 rounded-[6px] border border-[#ECECEC] bg-[#FEFEFE] p-3"
    >
      <View className="gap-1.5">
        {/* The price on the right, «مميز» on the left */}
        <View className="h-5 flex-row items-center justify-between">
          {price !== null && price !== undefined ? (
            <View className="flex-row items-end gap-0.5">
              <Text className="font-cairo-semibold text-[22px] leading-[24px] text-[#15304D]">
                {formatNumber(price)}
              </Text>
              <Text className="font-cairo-bold text-[12px] leading-[15px] text-[#15304D]">
                د.ك
              </Text>
            </View>
          ) : (
            <Text
              className="font-cairo-semibold text-[18px] leading-[22px] text-[#15304D]"
              style={rtl}
            >
              السعر غير معلن
            </Text>
          )}
          {property.isFeatured ? (
            <SafeLinearGradient
              testID={`office-market-featured-${property.id}`}
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

        {/* The category, the place, the size: right to left */}
        <View className="mt-1 flex-row items-center gap-4">
          {!!category && (
            <View className="flex-row items-center gap-1 rounded-[6px] bg-[#F5F7F9] px-2 py-1">
              <View className="h-[14px] w-[14px] items-center justify-center">
                <Image
                  source={BUILDING_ICON}
                  style={{ width: 9.75, height: 12.67 }}
                />
              </View>
              <Text
                className="font-cairo-semibold text-[14px] leading-[18px] text-[#111111]"
                style={rtl}
              >
                {category}
              </Text>
            </View>
          )}
          <View className="shrink flex-row items-center gap-0.5">
            <LocationIcon size={14} color="#111111" />
            <Text
              className="shrink font-cairo text-[14px] leading-[18px] text-[#111111]"
              style={rtl}
              numberOfLines={1}
            >
              {property.location}
            </Text>
          </View>
          {!!property.area && (
            <View className="flex-row items-center gap-0.5">
              <AreaIcon size={16} color="#111111" />
              <Text
                className="font-cairo text-[14px] leading-[18px] text-[#111111]"
                style={rtl}
              >
                {`${formatNumber(property.area)} م2`}
              </Text>
            </View>
          )}
        </View>

        {/* بيع: what the property earns */}
        {income > 0 && (
          <View
            testID={`office-market-income-${property.id}`}
            className="flex-row items-center gap-1.5 pt-[5px]"
          >
            <Text
              className="font-cairo text-[14px] leading-[18px] text-[#111111]"
              style={rtl}
            >
              مدخول العقار
            </Text>
            <View className="flex-row items-end gap-0.5">
              <Text className="font-cairo-bold text-[16px] leading-[20px] text-[#018B1B]">
                {formatNumber(income)}
              </Text>
              <Text className="font-cairo-semibold text-[12px] leading-[15px] text-[#018B1B]">
                د.ك
              </Text>
            </View>
          </View>
        )}

        {/* بدل: «طلب 2021 مع 2023» */}
        {showYears && (
          <View
            testID={`office-market-years-${property.id}`}
            className="flex-row items-center gap-1.5 pt-0.5"
          >
            <ExchangeYear label={`طلب ${property.requestYear}`} />
            <Text
              className="font-cairo-medium text-[14px] leading-[21px] text-[#111111]"
              style={rtl}
            >
              مع
            </Text>
            <ExchangeYear label={String(property.requiredYear)} />
          </View>
        )}
      </View>

      {/* «عرض تفاصيل» on the right, then «اقتراح لعميل», share, the heart */}
      <View className="flex-row items-center pt-1" style={{ gap: 10 }}>
        <TouchableOpacity
          testID={`office-market-details-${property.id}`}
          accessibilityRole="button"
          activeOpacity={0.8}
          onPress={onPress}
          className="h-8 flex-1 items-center justify-center rounded-[14px] bg-[#15304D] px-4"
        >
          <Text className="font-cairo-semibold text-[14px] leading-[18px] text-white">
            عرض تفاصيل
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID={`office-market-suggest-${property.id}`}
          accessibilityRole="button"
          activeOpacity={0.8}
          onPress={onSuggest}
          className="h-8 flex-1 items-center justify-center rounded-[14px] bg-[#F9FAFE] px-4"
        >
          <Text className="font-cairo-semibold text-[14px] leading-[18px] text-[#15304D]">
            اقتراح لعميل
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID={`office-market-share-${property.id}`}
          accessibilityRole="button"
          accessibilityLabel="مشاركة"
          onPress={onShare}
          className="h-8 w-8 items-center justify-center rounded-[8px]"
        >
          <Image source={SHARE_ICON} style={{ width: 18, height: 18 }} />
        </TouchableOpacity>
        <TouchableOpacity
          testID={`office-market-favorite-${property.id}`}
          accessibilityRole="button"
          accessibilityLabel={isFavorited ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
          accessibilityState={{ selected: isFavorited }}
          onPress={onFavorite}
          className="h-8 w-8 items-center justify-center"
        >
          <HeartIcon
            size={20}
            color={isFavorited ? '#BA0003' : '#111111'}
            filled={isFavorited}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
