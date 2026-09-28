import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

// Figma 1684:60146
export default function SettingsHeader({ onBack }: { onBack: () => void }) {
  return (
    <View className="flex-row items-center justify-between border-b border-gray-50 px-5 py-4">
      <TouchableOpacity
        testID="settings-back-button"
        onPress={onBack}
        className="w-8"
      >
        <Feather name="chevron-right" size={24} color="#111111" />
      </TouchableOpacity>
      <Text className="font-cairo-semibold text-lg leading-[24px] text-[#111111]">
        الإعدادات
      </Text>
      <View className="w-8" />
    </View>
  );
}
