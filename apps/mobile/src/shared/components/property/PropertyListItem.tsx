import { Feather } from '@expo/vector-icons';
import { DimensionValue, Text, TouchableOpacity, View } from 'react-native';

import { HeartIcon, LocationIcon } from '@/assets/icons/home/cards';
import { AreaIcon, ShareIcon } from '@/assets/icons/home/property';
import { HomeIcon, PropertiesTabIcon } from '@/assets/icons/tab';
import { SafeLinearGradient } from '@/shared/components/ui/SafeLinearGradient';
import { formatNumber } from '@/shared/utils/formatNumber';

export interface PropertyListItemProps {
  id?: string;
  price: number | string;
  companyName?: string;
  isFeatured?: boolean;
  categoryLabel?: string; // e.g., 'عمارة', 'شقة', 'فيلا'
  category?: string;
  type?: string;
  beds?: number;
  area: number;
  location: string;
  propertyIncome?: number | null;
  // An exchange ad's two years: «طلب 2021 مع 2023»
  requestYear?: number | null;
  requiredYear?: number | null;
  isFavorited?: boolean;
  onPress?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
  onShowDetails?: () => void;
  cardWidth?: DimensionValue;
}

export default function PropertyListItem({
  price,
  isFeatured = false,
  categoryLabel,
  category,
  type,
  beds,
  area,
  location,
  propertyIncome,
  requestYear,
  requiredYear,
  isFavorited = false,
  onPress,
  onFavorite,
  onShare,
  onShowDetails,
  cardWidth,
}: PropertyListItemProps) {
  const displayCategory = categoryLabel || category || type || 'عمارة';
  const isHouseOrVilla =
    displayCategory.includes('بيت') || displayCategory.includes('فيلا');

  const formattedPrice =
    typeof price === 'number' && price > 0
      ? formatNumber(price)
      : typeof price === 'string' && !isNaN(Number(price))
        ? formatNumber(Number(price))
        : price;

  const hasPrice = Number(price) > 0;

  const handleDetailsPress = onShowDetails || onPress;

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onPress}
      className="mb-4 rounded-md border border-[#ECECEC] bg-[#FEFEFE] p-4"
      style={{
        width: cardWidth || '100%',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      }}
    >
      {/* Row 1: Price (Right) & "مميز" Badge (Left) */}
      <View className="flex-row items-center justify-between">
        {/* Right in RTL: Price */}
        {hasPrice ? (
          <View className="flex-row items-baseline gap-1">
            <Text className="font-cairo-bold text-2xl text-[#15304D]">
              {formattedPrice}
            </Text>
            <Text className="font-cairo-medium text-sm text-[#15304D]">
              د.ك
            </Text>
          </View>
        ) : (
          <Text className="font-cairo-semibold text-lg leading-[22px] text-[#15304D]">
            السعر غير معلن
          </Text>
        )}

        {/* Left in RTL: "مميز" Badge */}
        {isFeatured && (
          <SafeLinearGradient
            colors={['#FF8D28', '#FACC15']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{
              width: 57,
              height: 20,
              borderTopRightRadius: 4,
              borderBottomRightRadius: 4,
              borderTopLeftRadius: 10,
              borderBottomLeftRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text className="font-almarai text-[12px] leading-[120%] text-[#111111]">
              مميز
            </Text>
          </SafeLinearGradient>
        )}
      </View>

      {/* Row 2: Category Badge, Location, Area & Beds */}
      <View className="mt-3 flex-row items-center justify-between gap-2">
        {/* Right: Category Tag */}
        <View className="flex-row items-center gap-1.5 rounded-lg border border-gray-100/60 bg-[#F1F5F9] px-2.5 py-1">
          {isHouseOrVilla ? (
            <HomeIcon color="#15304D" size={13} />
          ) : (
            <PropertiesTabIcon color="#15304D" size={13} />
          )}
          <Text className="font-cairo-semibold text-xs leading-[16px] text-[#15304D]">
            {displayCategory}
          </Text>
        </View>

        {/* Middle: Location */}
        <View className="flex-1 flex-row items-center justify-center gap-1 px-1">
          <LocationIcon color="#6B6A6A" size={14} />
          <Text
            className="font-cairo-medium text-xs leading-[18px] text-[#111111]"
            numberOfLines={1}
          >
            {location}
          </Text>
        </View>

        {/* Left: Area & Beds */}
        <View className="flex-row items-center gap-1">
          <AreaIcon color="#6B6A6A" size={14} />
          <Text className="font-cairo-medium text-xs leading-[18px] text-[#111111]">
            {area ?? 200} م²
          </Text>
        </View>
      </View>

      {/* Row 3: Property Income (مدخول العقار) */}
      {propertyIncome !== undefined && propertyIncome !== null && propertyIncome > 0 && (
        <View className="mt-2.5 flex-row items-center justify-start gap-1.5">
          <Text className="font-cairo-bold text-sm text-[#111111]">
            مدخول العقار
          </Text>
          <Text className="font-cairo-bold text-base text-[#10B981]">
            {formatNumber(propertyIncome)} د.ك
          </Text>
        </View>
      )}

      {/* Exchange: the year it was requested with the year wanted */}
      {!!requestYear && !!requiredYear && (
        <View className="mt-2.5 flex-row items-center justify-start gap-1.5">
          <Feather name="calendar" size={14} color="#111111" />
          <Text className="font-cairo-medium text-sm text-[#111111]">
            طلب {requestYear}
          </Text>
          <Text className="font-cairo-medium text-sm text-[#111111]">مع</Text>
          <Feather name="calendar" size={14} color="#111111" />
          <Text className="font-cairo-medium text-sm text-[#111111]">
            {requiredYear}
          </Text>
        </View>
      )}

      {/* Row 4: Actions ("عرض تفاصيل" Button & Share/Heart Icons) */}
      <View className="mt-3.5 flex-row items-center justify-between gap-3">
        {/* Right in RTL: View Details Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleDetailsPress}
          className="flex-1 items-center justify-center rounded-[14px] bg-[#F9FAFE] px-4 py-2"
          style={{ marginLeft: 12 }}
        >
          <Text className="font-cairo-semibold text-sm text-[#15304D]">
            عرض تفاصيل
          </Text>
        </TouchableOpacity>

        {/* Left in RTL: Share & Heart Icons */}
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onShare}
            className="h-9 w-9 items-center justify-center"
          >
            <ShareIcon color="#111111" size={18} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onFavorite}
            className="h-9 w-9 items-center justify-center"
          >
            <HeartIcon
              color={isFavorited ? '#DC2626' : '#111111'}
              size={18}
              filled={isFavorited}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
