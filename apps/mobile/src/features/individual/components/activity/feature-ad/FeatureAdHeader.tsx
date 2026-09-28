import { Text, TouchableOpacity, View } from 'react-native';

import { CloseIcon } from '@/assets/icons/home/property';

interface FeatureAdHeaderProps {
  onClose: () => void;
}

// Title (right) and close button (left)
export default function FeatureAdHeader({ onClose }: FeatureAdHeaderProps) {
  return (
    <View className="mb-4 flex-row items-center justify-between">
      <Text className="font-cairo-semibold text-[18px] leading-[1.3] text-[#111111] text-right">
        تمييز الإعلان
      </Text>
      <TouchableOpacity
        onPress={onClose}
        activeOpacity={0.7}
        className="h-8 w-8 items-center justify-center rounded-full p-1"
        accessibilityLabel="إغلاق"
      >
        <CloseIcon />
      </TouchableOpacity>
    </View>
  );
}
