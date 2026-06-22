import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface SaveLoadingOverlayProps {
  visible: boolean;
}

export default function SaveLoadingOverlay({
  visible,
}: SaveLoadingOverlayProps) {
  if (!visible) return null;
  return (
    <View
      className="absolute inset-0 z-50 items-center justify-center bg-black/40"
      style={{ zIndex: 50 }}
    >
      <View className="items-center rounded-2xl bg-white px-10 py-8 shadow-xl">
        <ActivityIndicator size="large" color="#15304D" />
        <Text className="mt-4 font-cairo-semibold text-[15px] text-[#15304D]">
          جاري تحديث الإعلان...
        </Text>
      </View>
    </View>
  );
}
