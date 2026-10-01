import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

export default function QuoteRequestHeader({ onClose }: { onClose: () => void }) {
  return (
    <View className="flex-row items-center justify-between border-b border-gray-100 px-6 pb-3 pt-2">
      <Text className="font-cairo-semibold text-[18px] text-[#111111]">
        تقديم طلب سعر
      </Text>
      <TouchableOpacity
        onPress={onClose}
        className="h-8 w-8 items-center justify-center rounded-full"
      >
        <Feather name="x" size={20} color="#111111" />
      </TouchableOpacity>
    </View>
  );
}
