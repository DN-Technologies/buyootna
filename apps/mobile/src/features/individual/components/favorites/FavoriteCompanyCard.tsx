import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

import { ChatIcon, HeartIcon } from '@/assets/icons/home/cards';

export interface FavoriteCompanyCardProps {
  id: string;
  name: string;
  category: string;
  rating?: number;
  reviewsCount?: number;
  projectsCount?: string;
  lastActivity?: string;
  logoUrl?: string | any;
  isVerified?: boolean;
  onPress?: () => void;
  onFavoriteToggle?: () => void;
  onQuoteRequest?: () => void;
  onChatPress?: () => void;
}

export default function FavoriteCompanyCard({
  name,
  category,
  rating = 3.5,
  reviewsCount = 40,
  projectsCount = '+85',
  lastActivity = 'منذ ساعة',
  logoUrl,
  isVerified = true,
  onPress,
  onFavoriteToggle,
  onQuoteRequest,
  onChatPress,
}: FavoriteCompanyCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      className="mb-3 w-full rounded-[16px] border border-[#ECECEC] bg-white p-4 shadow-xs"
    >
      {/* Top Section */}
      <View className="flex-row items-start justify-between">
        {/* Company Info & Logo on Right */}
        <View className="flex-row items-center gap-3 pl-2">
          {/* Logo */}
          <View className="h-[64px] w-[64px] items-center justify-center overflow-hidden rounded-sm bg-[#111111]">
            {logoUrl ? (
              <Image
                source={typeof logoUrl === 'string' ? { uri: logoUrl } : logoUrl}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            ) : (
              <MaterialIcons name="business" size={24} color="#D4AF37" />
            )}
          </View>

          {/* Shrinks with a long name so the badge never runs onto the heart */}
          <View className="shrink">
            <View className="flex-row items-center gap-1">
              <Text
                className="shrink font-cairo-bold text-[15px] text-[#111111]"
                numberOfLines={1}
              >
                {name}
              </Text>
              {isVerified && (
                <MaterialIcons
                  name="verified"
                  size={16}
                  color="#0284C7"
                  style={{ flexShrink: 0 }}
                />
              )}
            </View>
            <Text
              className="font-cairo text-xs text-[#6B6A6A]"
              numberOfLines={1}
              style={{ writingDirection: "rtl" }}
            >
              {category}
            </Text>
          </View>
        </View>

        {/* Heart Icon Button on Left */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onFavoriteToggle}
          className="p-1"
        >
          <HeartIcon size={20} color="#BA0003" filled={true} />
        </TouchableOpacity>
      </View>

      {/* Middle Stats Section */}
      <View className="my-3 flex-row items-center justify-between border-y border-gray-100 py-2.5">
        {/* Last Activity Column (Right) */}
        <View className="flex-1 items-center">
          <Text className="font-cairo-medium text-xs text-[#111111]">
            اخر نشاط
          </Text>
          <Text className="font-cairo text-[11px] text-[#6B6A6A]">
            {lastActivity}
          </Text>
        </View>

        {/* Divider */}
        <View className="h-6 w-[1px] bg-gray-200" />

        {/* Projects Column (Center) */}
        <View className="flex-1 items-center">
          <Text className="font-cairo-medium text-xs text-right text-[#111111]">
            {projectsCount}
          </Text>
          <Text className="font-cairo text-[11px] text-[#6B6A6A]">
            مشاريع مكتملة
          </Text>
        </View>

        {/* Divider */}
        <View className="h-6 w-[1px] bg-gray-200" />

        {/* Rating Column (Left) */}
        <View className="flex-1 items-center">
          <View className="flex-row items-center gap-1">
            <FontAwesome5 name="star" size={11} color="#F59E0B" solid />
            <Text className="font-cairo-medium leading-[22px] text-xs text-[#111111]">
              {rating}
            </Text>
          </View>
          <Text className="font-cairo text-[11px] text-[#6B6A6A]">
            +{reviewsCount} تقييم
          </Text>
        </View>
      </View>

      {/* Bottom Action Section */}
      <View className="flex-row items-center gap-2.5">
        {/* Request Quote Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onQuoteRequest}
          className="h-10 w-1/2 items-center justify-center rounded-[24px] bg-[#15304D]"
        >
          <Text className="font-cairo-bold leading-[22px] text-sm text-white">
            طلب عرض سعر
          </Text>
        </TouchableOpacity>
        {/* Chat Outline Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onChatPress}
          className="h-10 w-1/2 items-center justify-center rounded-[24px] border border-[#E2E8F0] px-5"
        >
          <ChatIcon size={18} color="#15304D" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
