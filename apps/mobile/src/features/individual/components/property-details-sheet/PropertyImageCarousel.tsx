import { Image } from 'expo-image';
import { useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { SafeLinearGradient as LinearGradient } from '@/shared/components/ui/SafeLinearGradient';

interface PropertyImageCarouselProps {
  images: (string | number)[];
  isFeatured: boolean;
}

export default function PropertyImageCarousel({
  images,
  isFeatured,
}: PropertyImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    if (slideSize > 0) {
      const index = event.nativeEvent.contentOffset.x / slideSize;
      setActiveIndex(Math.round(index));
    }
  };

  return (
    <View
      onLayout={(e) => {
        const width = e.nativeEvent.layout.width;
        if (width > 0 && width !== containerWidth) {
          setContainerWidth(width);
        }
      }}
      className="relative mb-4 h-48 w-full overflow-hidden rounded-md bg-gray-100"
    >
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((img, index) => (
          <Image
            key={index}
            source={typeof img === 'string' ? { uri: img } : img}
            style={{
              width: containerWidth || 330,
              height: '100%',
            }}
            contentFit="cover"
          />
        ))}
      </ScrollView>

      {/* Featured Badge */}
      {isFeatured && (
        <View className="absolute right-3 top-3">
          <LinearGradient
            colors={['#FF8D28', '#FACC15']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{
              width: 48,
              paddingHorizontal: 8,
              height: 20,
              borderTopLeftRadius: 8,
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
        </View>
      )}

      {/* Pagination Dots Overlay */}
      {images.length > 1 && (
        <View className="absolute bottom-3 w-full flex-row items-center justify-center space-x-1.5 space-x-reverse">
          {images.map((_, index) => (
            <View
              key={index}
              className={`h-1.5 rounded-full ${
                activeIndex === index ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
}
