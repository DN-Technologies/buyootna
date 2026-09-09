import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import type { HomeServiceChip } from './mockData';

interface ServiceChipProps {
  service: HomeServiceChip;
  onPress?: () => void;
}

export default function ServiceChip({ service, onPress }: ServiceChipProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="items-center"
      disabled={!onPress}
    >
      <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#F5F7F9]">
        <Ionicons name={service.icon} size={28} color="#111111" />
      </View>
      <Text
        className="mt-3 text-center font-cairo-medium text-[14px] leading-[21px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
        numberOfLines={1}
      >
        {service.label}
      </Text>
    </TouchableOpacity>
  );
}
