import { Image } from 'expo-image';
import React, { useState } from 'react';
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
            <Image
              source={require('@/assets/icons/arrow-back.svg')}
              style={{ width: 10, height: 14 }}
            />
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
              color={isFavorite ? '#BA0003' : '#94A3B8'}
              filled={isFavorite}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onShare}
            className="h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm"
          >
            <Image
              source={require('@/assets/icons/home/property/share-icon.svg')}
              style={{ width: 17, height: 14 }}
            />
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
              <Image
                key={index}
                source={{ uri: img }}
                style={{ width: SCREEN_WIDTH, height: HEADER_HEIGHT, backgroundColor: '#E2E8F0' }}
                resizeMode="cover"
                transition={300}
              />
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
        // --- Fallback State (Exchange / No Images) ---
        <View
          className="items-center justify-center bg-[#15304D]"
          style={{
            height: HEADER_HEIGHT,
            width: '100%',
            paddingTop: insets.top,
          }}
        >
          {/* Simulating the BUYOOTN Logo block from Figma */}
          <View className="items-center">
            <Image
              source={require('@/assets/icons/fallback-logo.svg')}
              style={{ width: 155, height: 165 }}
              resizeMode="contain"
            />
          </View>
        </View>
      )}
    </View>
  );
}
