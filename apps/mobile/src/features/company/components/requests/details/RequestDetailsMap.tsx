import { Image } from 'expo-image';
import React from 'react';
import { Linking, Platform, Text, TouchableOpacity, View } from 'react-native';

import { LocationPinSmallIcon } from '../icons';
import { MaximizeMapIcon } from './icons';

export interface RequestDetailsMapProps {
  location: string;
  latitude?: number;
  longitude?: number;
  onExpandPress?: () => void;
}

const STATIC_MAP_IMG =
  'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80';

export default function RequestDetailsMap({
  location,
  latitude = 29.3759,
  longitude = 47.9774,
  onExpandPress,
}: RequestDetailsMapProps) {
  const handleOpenMap = () => {
    if (onExpandPress) {
      onExpandPress();
      return;
    }

    const latLng = `${latitude},${longitude}`;
    const label = encodeURIComponent(location);
    const url = Platform.select({
      ios: `maps://?q=${label}&ll=${latLng}`,
      android: `geo:0,0?q=${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url).catch(() => {});
    }
  };

  return (
    <View className="mt-4">
      {/* Section Title */}
      <Text
        testID="request-details-map-title"
        className="mb-2.5 font-cairo-bold text-[14px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        الموقع على الخريطة
      </Text>

      {/* Map Preview Container */}
      <TouchableOpacity
        testID="request-details-map-container"
        activeOpacity={0.9}
        onPress={handleOpenMap}
        className="h-[143px] w-full overflow-hidden rounded-[10px] border border-[#ECECEC] bg-[#F5F7F9]"
      >
        {/* Background Map Graphic */}
        <Image
          source={{ uri: STATIC_MAP_IMG }}
          style={{ width: '100%', height: '100%', opacity: 0.85 }}
          contentFit="cover"
        />

        {/* Center Marker Pin */}
        <View className="absolute inset-0 items-center justify-center pointer-events-none">
          <View className="size-[36px] items-center justify-center rounded-full border-2 border-white bg-[#15304D] shadow-md shadow-black/20">
            <LocationPinSmallIcon size={18} color="#FFFFFF" />
          </View>
        </View>

        {/* Maximize Button (Visual Left in RTL) */}
        <TouchableOpacity
          testID="request-details-map-maximize-btn"
          activeOpacity={0.8}
          onPress={handleOpenMap}
          className="absolute bottom-2.5 end-2.5 size-[30px] items-center justify-center rounded-[6px] bg-[#15304D]"
          accessibilityLabel="تكبير الخريطة"
        >
          <MaximizeMapIcon size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}
