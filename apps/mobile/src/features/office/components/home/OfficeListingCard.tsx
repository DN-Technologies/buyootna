import { Feather, Ionicons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import SafeLinearGradient from '@/shared/components/ui/SafeLinearGradient';
import { formatNumber } from '@/shared/utils/formatNumber';

import { OfficeListing } from '../../types';

interface OfficeListingCardProps {
  listing: OfficeListing;
  onPress?: () => void;
  onManagePress?: () => void;
}

export default function OfficeListingCard({
  listing,
  onPress,
  onManagePress,
}: OfficeListingCardProps) {
  const firstImage =
    listing.images && listing.images.length > 0
      ? listing.images[0]
      : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';

  const formattedPrice =
    typeof listing.price === 'number'
      ? formatNumber(listing.price)
      : listing.price;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="w-[247px] overflow-hidden rounded-[6px] border border-[#ECECEC] bg-white shadow-sm"
      accessibilityRole="button"
      accessibilityLabel={listing.title}
    >
      {/* 1. Property Image Area */}
      <View className="relative h-[160px] w-full bg-gray-100">
        <Image
          source={{ uri: firstImage }}
          className="h-full w-full"
          resizeMode="cover"
        />

        {/* Top Feature Tag Badge */}
        {listing.tag && (
          <View className="absolute left-2.5 top-2">
            <SafeLinearGradient
              colors={['#FF8D28', '#FACC15']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="items-center justify-center rounded-br-[10px] rounded-tl-[8px] rounded-tr-[10px] px-2.5 py-1"
            >
              <Text
                className="font-cairo text-[11px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                {listing.tag}
              </Text>
            </SafeLinearGradient>
          </View>
        )}

        {/* Carousel Pagination Dots */}
        <View className="absolute bottom-2 left-0 right-0 flex-row items-center justify-center gap-1">
          <View className="h-1.5 w-4 rounded-full bg-white" />
          <View className="h-1.5 w-1.5 rounded-full bg-white/60" />
          <View className="h-1.5 w-1.5 rounded-full bg-white/60" />
          <View className="h-1.5 w-1.5 rounded-full bg-white/60" />
        </View>
      </View>

      {/* 2. Content Info */}
      <View className="p-3">
        {/* Title */}
        <Text
          className="font-cairo text-[14px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
          numberOfLines={1}
        >
          {listing.title}
        </Text>

        {/* Price Row */}
        <View className="mt-1 flex-row items-baseline justify-end gap-1">
          <Text
            className="font-cairo-bold text-[20px] leading-[28px] text-[#15304D]"
            style={{ writingDirection: 'rtl' }}
          >
            {formattedPrice}
          </Text>
          <Text
            className="font-cairo text-[12px] text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            {listing.currency || 'د.ك'}
          </Text>
        </View>

        {/* Stats Row (Views, Favorites, Chats) */}
        <View className="mt-2 flex-row items-center justify-end gap-4">
          {/* Views */}
          <View className="flex-row items-center gap-1">
            <Text
              className="font-cairo text-[13px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              {listing.viewsCount}
            </Text>
            <Ionicons name="eye-outline" size={14} color="#6B6A6A" />
          </View>

          {/* Favorites */}
          <View className="flex-row items-center gap-1">
            <Text
              className="font-cairo text-[13px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              {listing.favoritesCount}
            </Text>
            <Ionicons name="heart-outline" size={14} color="#6B6A6A" />
          </View>

          {/* Chats */}
          <View className="flex-row items-center gap-1">
            <Text
              className="font-cairo text-[13px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              {listing.chatsCount}
            </Text>
            <Feather name="message-square" size={13} color="#6B6A6A" />
          </View>
        </View>

        {/* Action Button: إدارة الإعلان */}
        <TouchableOpacity
          onPress={onManagePress || onPress}
          activeOpacity={0.8}
          className="mt-3 h-8 w-full items-center justify-center rounded-[8px] bg-[#F5F7F9]"
          accessibilityRole="button"
          accessibilityLabel="إدارة الإعلان"
        >
          <Text
            className="font-cairo-semibold text-[14px] text-[#15304D]"
            style={{ writingDirection: 'rtl' }}
          >
            إدارة الإعلان
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
