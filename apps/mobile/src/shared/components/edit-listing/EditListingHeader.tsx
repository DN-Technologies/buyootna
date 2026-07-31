import { Image } from 'expo-image';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface EditListingHeaderProps {
  onBack: () => void;
}

export default function EditListingHeader({ onBack }: EditListingHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 py-4">
      <TouchableOpacity
        onPress={onBack}
        className="h-8 w-8 items-center justify-center"
      >
        <Image
          source={require('@/assets/icons/arrow-back.svg')}
          style={{ width: 12, height: 16 }}
        />
      </TouchableOpacity>
      <Text className="font-cairo-bold text-lg text-[#111111]">
        تعديل الاعلان
      </Text>
      <View className="w-8" />
    </View>
  );
}
