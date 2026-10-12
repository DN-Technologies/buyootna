import { Feather, Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface OfficeAddTopBarProps {
  onBack: () => void;
  onMapPress: () => void;
}

/** إضافة إعلان's top bar: map button, title, back button. */
export default function OfficeAddTopBar({
  onBack,
  onMapPress,
}: OfficeAddTopBarProps) {
  return (
    <View className="h-[52px] w-full flex-row items-center justify-between border-b border-[#ECECEC] px-4 py-1.5">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onMapPress}
        className="h-8 w-8 items-center justify-center rounded-full bg-[#F5F7F9]"
        testID="top-map-button"
        accessibilityLabel="الخريطة"
      >
        <Ionicons name="map-outline" size={18} color="#15304D" />
      </TouchableOpacity>

      <Text className="font-cairo-semibold text-lg text-[#111111]">
        إضافة إعلان
      </Text>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onBack}
        className="h-8 w-8 items-center justify-center rounded-full bg-[#F5F7F9]"
        testID="top-back-button"
        accessibilityLabel="رجوع"
      >
        <Feather name="arrow-right" size={20} color="#111111" />
      </TouchableOpacity>
    </View>
  );
}
