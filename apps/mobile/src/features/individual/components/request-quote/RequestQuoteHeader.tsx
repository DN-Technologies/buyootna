import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

export interface RequestQuoteHeaderProps {
  onBack: () => void;
  title?: string;
}

export default function RequestQuoteHeader({
  onBack,
  title = 'تقديم طلب سعر',
}: RequestQuoteHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 py-4">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onBack}
        className="w-8 items-end"
      >
        <Feather name="chevron-right" size={24} color="#111111" />
      </TouchableOpacity>
      <Text className="font-cairo-semibold text-lg text-[#111111]">
        {title}
      </Text>
      <View className="w-8" />
    </View>
  );
}
