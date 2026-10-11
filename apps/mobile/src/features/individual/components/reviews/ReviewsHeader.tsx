import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

export default function ReviewsHeader({ onBack }: { onBack: () => void }) {
  return (
    <View className="flex-row items-center justify-between border-b border-gray-50 px-5 py-4">
      <TouchableOpacity
        onPress={onBack}
        className="h-8 w-8 items-center justify-center"
      >
        <Feather name="chevron-right" size={24} color="#111111" />
      </TouchableOpacity>
      <Text className="font-cairo-semibold text-lg text-[#111111]">
        التقييمات
      </Text>
      <View className="w-8" />
    </View>
  );
}
