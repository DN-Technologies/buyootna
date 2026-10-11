import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

export default function ReviewsSortButton({ onPress }: { onPress: () => void }) {
  return (
    <View className="mt-4 px-5">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        className="w-[114px] flex-row items-center gap-2 rounded-[12px] bg-[#F9FAFE] px-3 py-2"
      >
        <Feather name="sliders" size={16} color="#111111" />
        <Text className="font-cairo-semibold text-sm text-[#111111]">
          الترتيب حسب
        </Text>
      </TouchableOpacity>
    </View>
  );
}
