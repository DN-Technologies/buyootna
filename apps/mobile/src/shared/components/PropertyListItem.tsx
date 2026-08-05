import { DimensionValue, Text, TouchableOpacity, View } from 'react-native';

import { HeartIcon } from '@/assets/icons/home/cards';
import {
  AreaIcon,
  BedIcon,
  CompanyIcon,
  ShareIcon,
} from '@/assets/icons/home/property';
import { SafeLinearGradient } from '@/shared/components/SafeLinearGradient';

export interface PropertyListItemProps {
  id: string;
  price: number | string;
  companyName: string;
  isFeatured?: boolean;
  categoryLabel?: string; // e.g., 'عمارة', 'شقة', 'فيلا'
  beds?: number;
  area: number;
  location: string;
  propertyIncome?: number | null;
  onPress?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
  onShowDetails?: () => void;
  cardWidth?: DimensionValue;
}

export default function PropertyListItem({
  price,
  isFeatured = false,
  categoryLabel = 'عقار',
  beds,
  area,
  location,
  propertyIncome = 150_000,
  onPress,
  onFavorite,
  onShare,
  onShowDetails,
  cardWidth,
}: PropertyListItemProps) {
  const formattedPrice =
    typeof price === 'number' && price > 0 ? (
      <Text className="font-cairo-bold text-sm text-[#15304D]">
        {price.toLocaleString()}{' '}
        <Text className="font-cairo-bold text-[11px] text-[#15304D]">
          د.ك
        </Text>
      </Text>
    ) : (
      <Text className="font-cairo-semibold text-sm text-[#15304D]">
        السعر غير معلن
      </Text>
    );

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
        shadowOpacity: 0.03,
        shadowRadius: 6,
      }}
    >
      {/* Row 1: Type icon (right) + Title (right-aligned) + Featured badge (left) — RTL */}
      <View className="flex-row items-center justify-between">
        <View className="h-8 w-8 items-center justify-center rounded-md border border-[#ECECEC]">
          <CompanyIcon color="#111111" size={16} />
        </View>

        <Text
          className="mx-2 flex-1 font-cairo-semibold text-base text-[#111111]"
          style={{ writingDirection: 'rtl' }}
          numberOfLines={1}
        >
          {categoryLabel} {location}
        </Text>

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

      {/* Row 2: Stats — price, beds, area — RTL */}
      <View className="mt-3 flex-row items-center justify-between">
        {formattedPrice}

        {beds !== undefined && (
          <View className="flex-row items-center gap-1">
            <BedIcon color="#111111" size={16} />
            <Text className="font-cairo text-sm text-[#111111]">{beds}</Text>
          </View>
        )}

        <View className="flex-row items-center gap-1">
          <AreaIcon color="#111111" size={16} />
          <Text className="font-cairo text-sm text-[#111111]">
            {area ?? 200} م²
          </Text>
        </View>
      </View>

      {/* Row 3: Property Income */}
      {propertyIncome !== undefined && propertyIncome !== null && (
        <View className="mt-3 flex-row items-center gap-1">
          <Text className="font-cairo text-sm text-[#111111]">
            مدخول العقار
          </Text>
          <Text className="font-cairo-bold text-base text-[#018B1B]">
            {propertyIncome.toLocaleString()}
          </Text>
          <Text className="font-cairo-semibold text-[12px] text-[#018B1B]">
            د.ك
          </Text>
        </View>
      )}

      {/* Row 4: Actions — "عرض تفاصيل" button (right) + icons (left) */}
      <View className="mt-4 flex-row items-center justify-between">
        {/* View Details Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onShowDetails}
          className="flex-1 items-center justify-center rounded-[14px] bg-[#F9FAFE] px-4 py-2"
          style={{ marginLeft: 12 }}
        >
          <Text className="font-cairo-semibold text-sm text-[#15304D]">
            عرض تفاصيل
          </Text>
        </TouchableOpacity>

        {/* Heart & Share Icons */}
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onShare}
            className="h-9 w-9 items-center justify-center"
          >
            <ShareIcon color="#000000" size={16} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onFavorite}
            className="h-9 w-9 items-center justify-center"
          >
            <HeartIcon color="#BA0003" size={18} filled />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
