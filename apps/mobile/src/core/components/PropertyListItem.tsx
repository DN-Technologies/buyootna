import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { DimensionValue, Text, TouchableOpacity, View } from 'react-native';

import { HeartIcon } from '@/assets/icons/home/cards';
import {
  AreaIcon,
  CompanyIcon,
  LocationIcon,
  ShareIcon,
} from '@/assets/icons/home/property';

export interface PropertyListItemProps {
  id: string;
  price: number | string;
  companyName: string;
  isFeatured?: boolean;
  type?: string; // e.g., 'سكني', 'تجاري'
  category?: string; // e.g., 'عمارة', 'أرض'
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
  category = 'عمارة',
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
      <Text className="font-cairo-semibold text-[22px] text-[#15304D]">
        {price.toLocaleString()}{' '}
        <Text className="font-cairo-bold text-[12px] text-[#15304D]">د.ك</Text>
      </Text>
    ) : (
      <Text className="font-cairo-semibold text-[18px] text-[#15304D]">
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
      {/* Row 1: Price (right) + Featured Badge (left) — RTL */}
      <View className="flex-row items-center justify-between">
        {formattedPrice}
        {isFeatured && (
          <LinearGradient
            colors={['#FF8D28', '#FACC15']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{
              width: 57,
              height: 20,
              borderTopLeftRadius: 4,
              borderTopRightRadius: 10,
              borderBottomRightRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text className="font-almarai text-[12px] leading-[120%] text-[#111111]">
              مميز
            </Text>
          </LinearGradient>
        )}
      </View>

      {/* Row 2: Category + Location + Area — horizontal RTL */}
      <View className="mt-3 flex-row items-center gap-x-4 gap-y-1.5">
        {/* Category */}
        <View className="flex-row items-center gap-1.5 rounded-md bg-[#F5F7F9] px-2 py-1">
          <CompanyIcon color="#000000" size={14} />
          <Text className="font-cairo-semibold text-sm leading-[22px] text-[#111111]">
            {category}
          </Text>
        </View>

        {/* Location */}
        <View
          className="flex-row items-center gap-1.5"
          style={{ maxWidth: '40%' }}
        >
          <LocationIcon color="#111111" size={14} />
          <Text
            className="flex-1 font-cairo-semibold text-sm leading-[22px] text-[#111111]"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {location}
          </Text>
        </View>

        {/* Area */}
        <View className="flex-row items-center gap-1.5">
          <AreaIcon color="#111111" size={16} />
          <Text className="font-cairo text-sm leading-[22px] text-[#111111]">
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
