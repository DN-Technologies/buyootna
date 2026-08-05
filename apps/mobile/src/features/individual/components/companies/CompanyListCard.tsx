import { Feather, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { HeartIcon } from '@/assets/icons/home/cards';
import { formatTimeAgo } from '@/shared/utils/helpers/time';

export interface CompanyListCardProps {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewsCount: number;
  projectsCount: string;
  lastActivityAt: string;
  logoUrl: string;
  isVerified?: boolean;
  isFavorite?: boolean;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  onChatPress?: () => void;
  onQuotePress?: () => void;
}

export default function CompanyListCard({
  name,
  category,
  rating,
  reviewsCount,
  projectsCount,
  lastActivityAt,
  logoUrl,
  isVerified = false,
  isFavorite = false,
  onPress,
  onToggleFavorite,
  onChatPress,
  onQuotePress,
}: CompanyListCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="mb-4 w-full rounded-2xl border border-gray-100 bg-white p-4"
      style={{
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      }}
    >
      {/* --- 1. Header: Heart, Name & Logo --- */}
      <View className="mb-3 flex-row items-start">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onToggleFavorite}
          className="h-8 w-8 items-center justify-center"
        >
          <HeartIcon
            size={20}
            color={isFavorite ? '#BA0003' : '#94A3B8'}
            filled={isFavorite}
          />
        </TouchableOpacity>

        <View className="mx-3 flex-1">
          <View className="flex-row items-center gap-1">
            {isVerified && (
              <MaterialIcons name="verified" size={16} color="#3B82F6" />
            )}
            <Text
              className="flex-1 font-cairo-semibold text-base text-[#111111]"
              style={{ writingDirection: 'rtl' }}
              numberOfLines={1}
            >
              {name}
            </Text>
          </View>
          <Text
            className="mt-0.5 font-cairo-medium text-[11px] text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
            numberOfLines={1}
          >
            {category}
          </Text>
        </View>

        <View className="h-16 w-16 overflow-hidden rounded-lg bg-[#111111]">
          <Image
            source={typeof logoUrl === 'string' ? { uri: logoUrl } : logoUrl}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* --- 2. Stats Row --- */}
      <View className="mb-3 flex-row items-center border-t border-gray-100 pt-3">
        <View className="flex-1 items-center">
          <View className="flex-row items-center gap-1">
            <FontAwesome5 name="star" size={11} color="#F59E0B" solid />
            <Text className="font-cairo-bold text-xs text-[#111111]">
              {rating}
            </Text>
          </View>
          <Text className="mt-0.5 font-cairo-medium text-[10px] text-[#6B6A6A]">
            {reviewsCount}+ تقييم
          </Text>
        </View>

        <View className="h-8 w-[1px] bg-gray-100" />

        <View className="flex-1 items-center">
          <Text className="font-cairo-bold text-xs text-[#111111]">
            {projectsCount}+
          </Text>
          <Text className="mt-0.5 font-cairo-medium text-[10px] text-[#6B6A6A]">
            مشاريع مكتملة
          </Text>
        </View>

        <View className="h-8 w-[1px] bg-gray-100" />

        <View className="flex-1 items-center">
          <Text className="font-cairo-bold text-xs text-[#111111]">
            اخر نشاط
          </Text>
          <Text className="mt-0.5 font-cairo-medium text-[10px] text-[#6B6A6A]">
            {formatTimeAgo(lastActivityAt)}
          </Text>
        </View>
      </View>

      {/* --- 3. Actions --- */}
      <View className="flex-row items-center gap-3 border-t border-gray-100 pt-3">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onChatPress}
          className="h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white"
        >
          <Feather name="message-square" size={18} color="#111111" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onQuotePress}
          className="flex-1 flex-row items-center justify-center rounded-full bg-[#15304D] py-2.5"
        >
          <Text className="font-cairo-bold text-sm text-white">
            طلب عرض سعر
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
