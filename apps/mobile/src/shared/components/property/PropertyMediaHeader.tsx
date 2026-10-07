import  { useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';

import { HeartIcon } from '@/assets/icons/home/cards';
import { ArrowBackIcon, ShareIcon } from '@/assets/icons/home/property';
import { useImageViewer } from '@/shared/components/media/ImageViewer';
import { SafeImage } from '@/shared/components/ui/SafeImage';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HEADER_HEIGHT = 350;

export interface PropertyMediaHeaderProps {
  images: string[];
  insets: EdgeInsets;
  onBack: () => void;
  isFavorite?: boolean;
  onFavorite?: () => void;
  onShare?: () => void;
}

export default function PropertyMediaHeader({
  images,
  insets,
  onBack,
  isFavorite = true,
  onFavorite,
  onShare,
}: PropertyMediaHeaderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  // Tap a photo: full screen, swipe, pinch / double-tap to zoom
  const { open: openViewer, viewer } = useImageViewer();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveIndex(index);
  };

  return (
    <View
      style={{ height: HEADER_HEIGHT, width: '100%', position: 'relative' }}
    >
      {/* Header Action Buttons */}
      <View
        className="absolute top-0 z-10 w-full flex-row justify-between px-5"
        style={{
          paddingTop: Math.max(insets.top, 20) + 10,
        }}
      >
        {/* Right Action: Back */}
        <TouchableOpacity activeOpacity={0.8} onPress={onBack}>
          <View
            style={{
              height: 32,
              minWidth: 32,
              paddingHorizontal: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
              borderBottomLeftRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ArrowBackIcon color="#15304D" size={14} />
          </View>
        </TouchableOpacity>
        {/* Left Actions: Share & Heart */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onFavorite}
            className="h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm"
          >
            <HeartIcon
              size={18}
              color={isFavorite ? '#DC2626' : '#111111'}
              filled={isFavorite}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onShare}
            className="h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm"
          >
            <ShareIcon color="#111111" size={17} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Media Content Carousel or Fallback */}
      {images.length > 0 ? (
        <>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {images.map((img, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.95}
                testID={`property-media-photo-${index}`}
                accessibilityRole="imagebutton"
                accessibilityLabel={`عرض الصورة ${index + 1} بالحجم الكامل`}
                onPress={() => openViewer(images, index)}
              >
                <SafeImage
                  source={{ uri: img }}
                  style={{ width: SCREEN_WIDTH, height: HEADER_HEIGHT, backgroundColor: '#E2E8F0' }}
                  resizeMode="cover"
                  transition={300}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View className="absolute bottom-6 w-full flex-row items-center justify-center gap-1.5">
            {images.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full ${activeIndex === index ? 'w-6 bg-white' : 'w-2 bg-white/60'}`}
              />
            ))}
          </View>
        </>
      ) : (
        // --- Fallback State (No Images provided) ---
        <SafeImage
          source={require('@/assets/images/no-image.png')}
          style={{ width: SCREEN_WIDTH, height: HEADER_HEIGHT }}
          resizeMode="cover"
        />
      )}

      {viewer}
    </View>
  );
}
