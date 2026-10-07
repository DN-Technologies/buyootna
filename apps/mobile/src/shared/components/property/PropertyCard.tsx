import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  DimensionValue,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { HeartIcon, LocationIcon } from '@/assets/icons/home/cards';
import { AreaIcon, ShareIcon } from '@/assets/icons/home/property';
import { HomeIcon, PropertiesTabIcon } from '@/assets/icons/tab';
import { formatNumber } from '@/shared/utils/formatNumber';

export interface PropertyCardProps {
  id: string;
  images: (string | number)[];
  price: number | string;
  companyName?: string;
  isFeatured?: boolean;
  type?: string; // e.g., 'سكني', 'تجاري', 'استثماري'
  categoryLabel?: string; // e.g., 'عمارة', 'شقة', 'فيلا', 'بيت', 'أرض'
  category?: string;
  area: number;
  beds?: number;
  baths?: number;
  location: string;
  timeAgo?: string;
  propertyIncome?: number | null;
  cardWidth?: DimensionValue;
  isFavorited?: boolean;
  onPress?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
}

export default function PropertyCard({
  id,
  images,
  price,
  companyName,
  isFeatured = false,
  type = 'سكني',
  categoryLabel,
  category,
  area,
  beds,
  baths,
  location,
  timeAgo = 'منذ ساعتين',
  propertyIncome,
  cardWidth = '100%',
  isFavorited = false,
  onPress,
  onFavorite,
  onShare,
}: PropertyCardProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [measuredWidth, setMeasuredWidth] = useState(0);

  const fallbackWidth = windowWidth - 40;
  const imageWidth =
    typeof cardWidth === 'number' ? cardWidth : measuredWidth || fallbackWidth;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    if (slideSize > 0) {
      const index = event.nativeEvent.contentOffset.x / slideSize;
      setActiveIndex(Math.round(index));
    }
  };

  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/property/${id}`);
    }
  };

  const displayCategory = categoryLabel || category || type || 'عقار';
  const isHouseOrVilla =
    displayCategory.includes('بيت') || displayCategory.includes('فيلا');

  const formattedPrice =
    typeof price === 'number'
      ? formatNumber(price)
      : typeof price === 'string' && !isNaN(Number(price))
        ? formatNumber(Number(price))
        : price;

  const displayImages =
    images && images.length > 0
      ? images
      : [require('@/assets/images/no-image.png')];

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      testID={`property-card-${id}`}
      className="mb-5 w-full overflow-hidden rounded-md border border-gray-200/80 bg-white"
      onLayout={(e) => {
        const { width } = e.nativeEvent.layout;
        if (width > 0 && width !== measuredWidth) {
          setMeasuredWidth(width);
        }
      }}
      style={{
        width: cardWidth,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      }}
    >
      {/* --- 1. Image Carousel Section --- */}
      <View className="relative h-48 w-full overflow-hidden bg-gray-100">
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {displayImages.map((img, index) => (
            <Image
              key={index}
              source={typeof img === 'string' ? { uri: img } : img}
              style={{
                width: imageWidth,
                height: '100%',
              }}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        {/* Absolute Top Left: "مميز" Badge */}
        {isFeatured && (
          <View className="absolute right-3 top-3">
            <View className="items-center justify-center w-16 rounded-r-lg rounded-tl-lg bg-[#FFA800] px-3 py-1 shadow-sm">
              <Text className="font-cairo-bold text-xs leading-[18px] text-[#111111]">
                مميز
              </Text>
            </View>
          </View>
        )}

        {/* Absolute Top Right: Action Buttons (Share & Heart) */}
        <View className="absolute left-3 top-3 flex-row items-center gap-2">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onFavorite}
            className="h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-sm"
          >
            <HeartIcon
              color={isFavorited ? '#DC2626' : '#111111'}
              size={15}
              filled={isFavorited}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onShare}
            className="h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-sm"
          >
            <ShareIcon color="#111111" size={15} />
          </TouchableOpacity>
        </View>

        {/* Absolute Bottom Center: Pagination Dots */}
        {displayImages.length > 1 && (
          <View className="absolute bottom-3 w-full flex-row items-center justify-center space-x-1.5 space-x-reverse">
            {displayImages.map((_, index) => (
              <View
                key={index}
                className={`h-1.5 rounded-full ${
                  activeIndex === index ? 'w-5 bg-white' : 'w-1.5 bg-white/70'
                }`}
              />
            ))}
          </View>
        )}
      </View>

      {/* --- 2. Content Info Section --- */}
      <View className="px-4 py-3">
        {/* Row 1: Price & Relative Time */}
        <View
          className="mb-2 flex-row items-baseline justify-between"
        >
          {/* Price (Right in RTL) */}
          <View className="flex-row items-baseline gap-1">
            <Text className="font-cairo-bold text-2xl text-[#15304D]">
              {formattedPrice}
            </Text>
            <Text className="font-cairo-medium text-sm text-[#6B6A6A]">
              د.ك
            </Text>
          </View>

          {/* Time Ago (Left in RTL) */}
          <Text className="font-cairo text-xs text-[#8E8E93]">
            {timeAgo}
          </Text>
        </View>

        {/* Row 2: Category Badge, Location, Area */}
        <View
          className="flex-row items-center justify-between gap-2"
        >
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
              {area} م²
            </Text>
          </View>
        </View>

        {/* Row 3: Property Income (مدخول العقار) */}
        {typeof propertyIncome === 'number' && propertyIncome > 0 && (
          <View className="mt-2 flex-row items-center justify-between border-t border-gray-100 pt-2">
            <Text className="font-cairo-bold text-sm text-[#111111]">
              مدخول العقار
            </Text>
            <Text className="font-cairo-bold text-base text-[#10B981]">
              {formatNumber(propertyIncome)} د.ك
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
