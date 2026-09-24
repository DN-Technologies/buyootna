import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

export interface PlansHeaderProps {
  onBack: () => void;
}

export default function PlansHeader({ onBack }: PlansHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 py-4">
      <TouchableOpacity activeOpacity={0.7} onPress={onBack} className="w-8">
        <Feather name="chevron-right" size={24} color="#111111" />
      </TouchableOpacity>
      <Text className="font-cairo-semibold text-[18px] leading-[26px] text-[#111111]">
        الباقات
      </Text>
      <View className="w-8" />
    </View>
  );
}
