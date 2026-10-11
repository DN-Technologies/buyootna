import { useState } from 'react';
import {
  I18nManager,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { HeartIcon } from '@/assets/icons/home/cards';
import { ShareIcon } from '@/assets/icons/home/property';

interface PropertyCardImageCarouselProps {
  images: (string | number)[];
  imageWidth: number;
  isFeatured: boolean;
  isFavorited: boolean;
  onPress: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
}

export default function PropertyCardImageCarousel({
  images,
  imageWidth,
  isFeatured,
  isFavorited,
  onPress,
  onFavorite,
  onShare,
}: PropertyCardImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    if (slideSize > 0) {
      const raw = Math.round(event.nativeEvent.contentOffset.x / slideSize);
      // In RTL the first photo sits at the largest raw offset
      const last = images.length - 1;
      const index = I18nManager.isRTL ? last - raw : raw;
      setActiveIndex(Math.min(Math.max(index, 0), last));
    }
  };

  return (
    <View className="relative h-48 w-full overflow-hidden bg-gray-100">
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((img, index) => (
          // Each photo is its own touchable inside the ScrollView (same as
          // the sheet carousel), so a swipe scrolls and only a tap opens.
          <TouchableOpacity
            key={index}
            activeOpacity={0.95}
            onPress={onPress}
          >
            <Image
              source={typeof img === 'string' ? { uri: img } : img}
              style={{ width: imageWidth, height: '100%' }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isFeatured && (
        <View className="absolute right-3 top-3">
          <View className="w-16 items-center justify-center rounded-r-lg rounded-tl-lg bg-[#FFA800] px-3 py-1 shadow-sm">
            <Text className="font-cairo-bold text-xs leading-[18px] text-[#111111]">
              مميز
            </Text>
          </View>
        </View>
      )}

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

      {images.length > 1 && (
        <View className="absolute bottom-3 w-full flex-row items-center justify-center gap-1.5">
          {images.map((_, index) => (
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
  );
}
