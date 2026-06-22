import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface EditListingFooterProps {
  isButtonActive: boolean;
  onSave: () => void;
}

export default function EditListingFooter({
  isButtonActive,
  onSave,
}: EditListingFooterProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="absolute bottom-[-40px] w-full bg-white px-5 pt-4"
      style={{ paddingBottom: Math.max(insets.bottom, 20) }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onSave}
        disabled={!isButtonActive}
        className={`h-[48px] w-full items-center justify-center rounded-[24px] py-4 ${isButtonActive ? 'bg-[#15304D]' : 'bg-[#A6A6A6]'}`}
      >
        <Text className="font-cairo-semibold text-[14px] leading-[22px] text-white">
          تعديل الاعلان
        </Text>
      </TouchableOpacity>
    </View>
  );
}
