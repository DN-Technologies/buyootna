import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export interface MapPreviewProps {
  location: string;
  onPress?: () => void;
}

export default function MapPreview({ location, onPress }: MapPreviewProps) {
  return (
    <View className="mb-6 px-5">
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        className="h-[140px] w-full items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-200"
      >
        {/* Static Map Background Image */}
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
          }} // Using a top-down city placeholder
          style={StyleSheet.absoluteFillObject}
          blurRadius={1.5}
        />

        {/* Center Overlay Pill */}
        <View className="flex-row items-center rounded-full bg-white/95 px-5 py-2.5 shadow-sm">
          <Text className="mr-2 font-cairo-bold text-sm text-[#15304D]">
            الموقع على الخريطة
          </Text>
          <Feather name="map-pin" size={16} color="#15304D" />
        </View>

        {/* Expand Icon - Bottom Right */}
        <View className="absolute bottom-3 left-3 h-8 w-8 items-center justify-center rounded-lg bg-[#15304D] shadow-sm">
          <Feather name="maximize-2" size={18} color="#fff" />
        </View>
      </TouchableOpacity>
    </View>
  );
}
