import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, TouchableOpacity, View } from 'react-native';

import { HeartIcon, LocationIcon, RulerIcon } from '@/assets/icons/home/cards';
import { ShareIcon } from '@/assets/icons/home/property';
import { formatNumber } from '@/shared/utils/formatNumber';

export interface FavoritePropertyCardProps {
  id: string;
  price: number | string;
  // SALE / RENT / EXCHANGE: an exchange ad has no price
  listingType?: string;
  categoryLabel?: string;
  location?: string;
  area?: number | string;
  propertyIncome?: number | string;
  isFeatured?: boolean;
  isExpired?: boolean;
  onPress?: () => void;
  onFavoriteToggle?: () => void;
  onShare?: () => void;
}

export default function FavoritePropertyCard({
  id: _id,
  price,
  listingType,
  categoryLabel = 'عمارة',
  location = 'شمال غرب صليبيخات',
  area = 200,
  propertyIncome = 0,
  isFeatured = true,
  isExpired = false,
  onPress,
  onFavoriteToggle,
  onShare,
}: FavoritePropertyCardProps) {
  const formattedPrice =
    typeof price === 'number' ? formatNumber(price) : price;
  // No price (an exchange ad): say so, not a lone "د.ك" (QA screenshot)
  const hasPrice = Number(price) > 0;
  const noPriceLabel =
    listingType?.toUpperCase() === 'EXCHANGE' ? 'للبدل' : 'السعر غير محدد';

  const hasIncome = Number(propertyIncome) > 0;
  const formattedIncome =
    typeof propertyIncome === 'number'
      ? formatNumber(propertyIncome)
      : propertyIncome;

  const areaText = typeof area === 'number' ? `${area} م2` : area;

  return (
    <View className="mb-3 w-full rounded-[16px] border border-[#ECECEC] bg-[#FEFEFE] p-3 shadow-xs">
      {/* Top Section: Price and Featured Badge */}
      <View className="flex-row items-center justify-between pb-1">
        {/* Right: Price */}
        <View className="flex-row items-baseline gap-1">
          <Text
            testID="favorite-card-price"
            className={`font-cairo-bold text-[22px] leading-[30px] ${
              isExpired ? 'text-[#A0AEC0]' : 'text-[#15304D]'
            }`}
          >
            {hasPrice ? formattedPrice : noPriceLabel}
          </Text>
          {hasPrice && (
            <Text
              className={`font-cairo text-xs ${
                isExpired ? 'text-[#A0AEC0]' : 'text-[#6B6A6A]'
              }`}
            >
              د.ك
            </Text>
          )}
        </View>

        {/* Left: Featured Badge */}
        {isFeatured && (
          <View>
            {isExpired ? (
              <View className="h-5 items-center justify-center rounded-br-[10px] rounded-tl-[4px] rounded-tr-[10px] bg-[#A0AEC0] px-2">
                <Text className="font-almarai text-xs text-white">مميز</Text>
              </View>
            ) : (
              <LinearGradient
                colors={['#FF8D28', '#FACC15']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="h-5 items-center justify-center rounded-br-[10px] rounded-tl-[4px] rounded-tr-[10px] px-2"
              >
                <Text className="font-almarai text-xs text-[#111111]">
                  مميز
                </Text>
              </LinearGradient>
            )}
          </View>
        )}
        {!isFeatured && <View />}
      </View>

      {/* Middle Section: Details Chips. The type and the size keep their
          width; the place takes what is left and is cut with … (QA: a long
          place pushed itself and the size out of the card) */}
      <View className="flex-row items-center gap-3.5 py-1.5">
        {/* Building Category Chip */}
        <View
          className={`shrink-0 flex-row items-center gap-1 rounded-[6px] px-2 py-0.5 ${
            isExpired ? 'bg-[#E2E8F0]' : 'bg-[#F5F7F9]'
          }`}
        >
          <MaterialCommunityIcons
            name="office-building-outline"
            size={14}
            color={isExpired ? '#A0AEC0' : '#111111'}
          />
          <Text
            className={`font-cairo-semibold leading-[22px] text-sm ${
              isExpired ? 'text-[#A0AEC0]' : 'text-[#111111]'
            }`}
          >
            {categoryLabel}
          </Text>
        </View>

        {/* Location */}
        <View
          testID="favorite-card-location"
          className="min-w-0 flex-1 shrink flex-row items-center gap-1"
        >
          <LocationIcon
            size={14}
            color={isExpired ? '#A0AEC0' : '#111111'}
          />
          <Text
            className={`shrink font-cairo text-sm leading-[22px] ${
              isExpired ? 'text-[#A0AEC0]' : 'text-[#111111]'
            }`}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {location}
          </Text>
        </View>

        {/* Area */}
        <View
          testID="favorite-card-area"
          className="shrink-0 flex-row items-center gap-1"
        >
          <RulerIcon
            size={14}
            color={isExpired ? '#A0AEC0' : '#111111'}
          />
          <Text
            className={`font-cairo leading-[22px] text-sm ${
              isExpired ? 'text-[#A0AEC0]' : 'text-[#111111]'
            }`}
          >
            {areaText}
          </Text>
        </View>
      </View>

      {/* Income Row: only for ads that have an income */}
      {hasIncome && (
        <View className="flex-row items-center gap-1.5 pb-2 pt-0.5">
          <Text
            className={`font-cairo text-sm ${
              isExpired ? 'text-[#A0AEC0]' : 'text-[#111111]'
            }`}
          >
            مدخول العقار
          </Text>
          <View className="flex-row items-baseline gap-1">
            <Text
              className={`font-cairo-bold text-base ${
                isExpired ? 'text-[#A0AEC0]' : 'text-[#018B1B]'
              }`}
            >
              {formattedIncome}
            </Text>
            <Text
              className={`font-cairo text-xs ${
                isExpired ? 'text-[#A0AEC0]' : 'text-[#018B1B]'
              }`}
            >
              د.ك
            </Text>
          </View>
        </View>
      )}

      {/* Action Row */}
      <View className="flex-row items-center justify-between gap-2.5 pt-2">
        {/* Details CTA Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={isExpired}
          onPress={onPress}
          className={`h-[32px] flex-1 items-center justify-center rounded-[14px] ${
            isExpired
              ? 'bg-[#A0AEC0]'
              : 'border border-[#E2E8F0]/60 bg-[#F9FAFE]'
          }`}
        >
          <Text
            className={`font-cairo-semibold leading-[21px] text-sm ${
              isExpired ? 'text-white' : 'text-[#15304D]'
            }`}
          >
            عرض تفاصيل
          </Text>
        </TouchableOpacity>
        <View className="flex-row items-center gap-2">
          {/* Share Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onShare}
            className="h-8 w-8 items-center justify-center rounded-lg"
          >
            <ShareIcon size={16} color="#111111" />
          </TouchableOpacity>

          {/* Favorite Heart Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onFavoriteToggle}
            className="h-8 w-8 items-center justify-center rounded-lg"
          >
            <HeartIcon size={18} color="#BA0003" filled={true} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
