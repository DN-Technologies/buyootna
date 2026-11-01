import { Image } from 'expo-image';
import { ReactNode, useState } from 'react';
import {
  I18nManager,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

interface AdImageGalleryProps {
  images?: string[];
  // A tap on a photo (a swipe only scrolls)
  onPress?: () => void;
  // Badges drawn over the photos
  children?: ReactNode;
  testID?: string;
}

/**
 * The swipeable photo header of the ad cards on نشاطي. Each photo is its own
 * touchable inside the ScrollView (as in PropertyCardImageCarousel), so the
 * card's tap doesn't swallow the swipe.
 */
export default function AdImageGallery({
  images,
  onPress,
  children,
  testID = 'ad-image-gallery',
}: AdImageGalleryProps) {
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const sources = images?.length
    ? images.map((uri) => ({ uri }))
    : [require('@/assets/images/no-image.png')];
  const last = sources.length - 1;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = event.nativeEvent.layoutMeasurement.width;
    if (slide <= 0) return;
    const raw = Math.round(event.nativeEvent.contentOffset.x / slide);
    // In RTL the first photo sits at the largest raw offset
    const index = I18nManager.isRTL ? last - raw : raw;
    setActiveIndex(Math.min(Math.max(index, 0), last));
  };

  return (
    <View
      testID={testID}
      className="relative h-[210px] w-full bg-gray-50"
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <ScrollView
        testID={`${testID}-scroll`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={sources.length > 1}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        {sources.map((source, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.95}
            onPress={onPress}
            accessibilityRole="imagebutton">
            <Image
              source={source}
              // expo-image isn't a NativeWind-styled component: className
              // would be ignored and the image rendered at 0x0
              style={{ width, height: '100%' }}
              contentFit="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {children}

      {sources.length > 1 && (
        <View
          pointerEvents="none"
          className="absolute bottom-4 left-0 right-0 flex-row items-center justify-center gap-1.5">
          {sources.map((_, index) => (
            <View
              key={index}
              className={`h-1.5 rounded-full ${
                index === activeIndex ? 'w-4 bg-[#15304D]' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
}
