import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
  DimensionValue,
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Card width is screen width minus padding (approx 40px for left/right margins)
const CARD_WIDTH = SCREEN_WIDTH - 40;

// Make it highly reusable with strict TypeScript props
export interface PropertyCardProps {
  id: string;
  images: string[];
  price: number;
  companyName: string;
  isFeatured?: boolean;
  type?: string; // e.g., 'سكني'
  area: number;
  beds: number;
  baths: number;
  location: string;
  cardWidth?: DimensionValue; // Allow custom width for horizontal scrolling
  onPress?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
}

export default function PropertyCard({
  images,
  price,
  companyName,
  isFeatured = false,
  type = 'سكني',
  area,
  beds,
  baths,
  location,
  cardWidth = '100%',
  onPress,
  onFavorite,
  onShare,
}: PropertyCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Update pagination dots when scrolling images
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveIndex(Math.round(index));
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="mb-5 w-full overflow-hidden rounded-[24px] border border-gray-200 bg-white"
      style={{
        width: cardWidth, // Applies the 85% width when inside a horizontal list
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      }}
    >
      {/* --- 1. Image Carousel Section --- */}
      <View className="relative h-48 w-full">
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          //   className="h-full w-full"
        >
          {images.map((img, index) => (
            <Image
              key={index}
              source={{ uri: img }}
              style={{
                width: typeof cardWidth === 'number' ? cardWidth : 350,
                height: '100%',
              }}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        {/* Absolute Top Right: Badges */}
        <View className="absolute right-3 top-3 flex-row gap-2">
          {isFeatured && (
            <View className="rounded-full bg-[#F59E0B] px-3 py-1">
              <Text className="font-cairo-bold text-[10px] text-white">
                مميز
              </Text>
            </View>
          )}
          <View className="rounded-full bg-white/90 px-3 py-1">
            <Text className="font-cairo-bold text-[10px] text-[#111111]">
              {type}
            </Text>
          </View>
        </View>

        {/* Absolute Top Left: Actions (Heart & Share) */}
        <View className="absolute left-3 top-3 flex-row space-x-2 space-x-reverse">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onFavorite}
            className="h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <Feather name="heart" size={16} color="#111111" />
          </TouchableOpacity>
        </View>

        {/* Absolute Bottom: Pagination Dots */}
        <View className="absolute bottom-3 w-full flex-row items-center justify-center space-x-1.5 space-x-reverse">
          {images.map((_, index) => (
            <View
              key={index}
              className={`h-1.5 rounded-full ${activeIndex === index ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
            />
          ))}
        </View>
      </View>

      {/* --- 2. Content Info Section --- */}
      <View className="p-4">
        {/* Price & Company Row */}
        <View className="mb-3 flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="font-cairo-bold text-xl text-[#111111]">
              {price.toLocaleString()}{' '}
              <Text className="font-cairo-semibold text-sm text-[#6B6A6A]">
                د.ك
              </Text>
            </Text>
            <Text className="mt-1 font-cairo-semibold text-xs text-[#6B6A6A]">
              {companyName}
            </Text>
          </View>
          {/* Note: Left side is empty in design, but you could put a "Time ago" text here */}
        </View>

        {/* Specs Row (Area, Beds, Baths) */}
        <View className="mb-3 flex-row items-center gap-4">
          <View className="flex-row items-center gap-1">
            <FontAwesome5 name="ruler-combined" size={12} color="#94A3B8" />
            <Text className="font-cairo-semibold text-xs text-[#111111]">
              {area} م²
            </Text>
          </View>

          <View className="h-3 w-[1px] bg-gray-300" />

          <View className="flex-row items-center gap-1">
            <FontAwesome5 name="bed" size={12} color="#94A3B8" />
            <Text className="font-cairo-semibold text-xs text-[#111111]">
              {beds}
            </Text>
          </View>

          <View className="h-3 w-[1px] bg-gray-300" />

          <View className="flex-row items-center space-x-1 space-x-reverse">
            <FontAwesome5 name="bath" size={12} color="#94A3B8" />
            <Text className="font-cairo-semibold text-xs text-[#111111]">
              {baths}
            </Text>
          </View>
        </View>

        {/* Location Row */}
        <View className="mb-4 flex-row items-center gap-1.5">
          <Feather name="map-pin" size={12} color="#94A3B8" />
          <Text
            className="font-cairo-semibold text-xs text-[#6B6A6A]"
            numberOfLines={1}
          >
            {location}
          </Text>
        </View>

        {/* --- 3. Action Buttons Footer --- */}
        <View className="flex-row items-center justify-between gap-2 pt-2">
          {/* WhatsApp Button (Green Outline) */}
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center rounded-xl border border-green-500 bg-green-50/30 py-2.5"
            activeOpacity={0.7}
          >
            <FontAwesome5 name="whatsapp" size={16} color="#22C55E" />
          </TouchableOpacity>

          {/* Phone Button (Gray Outline) */}
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center rounded-xl border border-gray-300 py-2.5"
            activeOpacity={0.7}
          >
            <Feather name="phone" size={16} color="#64748B" />
          </TouchableOpacity>

          {/* Message/Chat Button (Gold Outline) */}
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center rounded-xl border border-[#EAB308] py-2.5"
            activeOpacity={0.7}
          >
            <Feather name="message-square" size={16} color="#EAB308" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
