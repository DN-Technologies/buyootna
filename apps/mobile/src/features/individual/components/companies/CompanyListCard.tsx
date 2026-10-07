import { Feather, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

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
      className="mb-4 w-full rounded-[4px] border border-[#ECECEC] bg-white p-4"
      style={{
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      }}
    >
      {/* --- 1. Header: Logo, Name & Heart --- */}
      <View className="mb-3 flex-row items-start">
        <View className="h-16 w-16 overflow-hidden rounded-lg bg-[#111111]">
          <Image
            source={typeof logoUrl === 'string' ? { uri: logoUrl } : logoUrl}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        </View>

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

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onToggleFavorite}
          className="h-8 w-8 items-center justify-center"
        >
          <HeartIcon
            size={20}
            color={isFavorite ? '#BA0003' : '#111111'}
            filled={isFavorite}
          />
        </TouchableOpacity>
      </View>

      {/* --- 2. Stats Row --- */}
      <View className="mb-3 flex-row items-center border-t border-gray-100 pt-3">
        <View className="flex-1 items-center">
          <Text className="font-cairo-medium text-[12px] text-[#111111]">
            اخر نشاط
          </Text>
          <Text className="font-cairo text-[10px] text-[#6B6A6A]">
            {formatTimeAgo(lastActivityAt)}
          </Text>
        </View>

        <View className="h-8 w-[1px] bg-gray-100" />

        <View className="flex-1 items-center">
          <Text className="font-cairo-bold text-[12px] text-[#111111]">
            {projectsCount}+
          </Text>
          <Text className="font-cairo text-[10px] text-[#6B6A6A]">
            مشاريع مكتملة
          </Text>
        </View>

        <View className="h-8 w-[1px] bg-gray-100" />

        <View className="flex-1 items-center">
          {reviewsCount > 0 ? (
            <>
              <View className="flex-row items-center gap-1">
                <FontAwesome5 name="star" size={11} color="#F59E0B" solid />
                <Text className="font-cairo text-[12px] text-[#111111]">
                  {rating}
                </Text>
              </View>
              <Text className="font-cairo-medium text-[10px] text-[#6B6A6A]">
                {reviewsCount}+ تقييم
              </Text>
            </>
          ) : (
            <Text className="font-cairo-medium text-[10px] text-[#6B6A6A]">
              لا تقييمات
            </Text>
          )}
        </View>
      </View>

      {/* --- 3. Actions --- */}
      <View className="flex-row items-center gap-3 border-t border-gray-100 pt-3">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onQuotePress}
          className="flex-row flex-1 items-center h-[40px] justify-center rounded-full bg-[#15304D] py-2.5"
        >
          <Text className="font-cairo-semibold leading-[22px] text-[14px] text-white">
            طلب عرض سعر
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onChatPress}
          className="items-center flex-1 h-[40px] justify-center rounded-full border border-gray-200 bg-white"
        >
          <Feather name="message-square" size={20} color="#111111" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
