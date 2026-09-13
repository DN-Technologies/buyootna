import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface ActivityHeaderProps {
  onAddPress: () => void;
  onMenuPress: () => void;
}

export default function ActivityHeader({
  onAddPress,
  onMenuPress,
}: ActivityHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 py-4">
      {/* Plus Button (Right side in RTL) */}
      <TouchableOpacity
        onPress={onAddPress}
        className="h-10 w-10 items-center justify-center rounded-full"
        activeOpacity={0.7}
      >
        <Feather name="plus" size={24} color="#111111" />
      </TouchableOpacity>

      {/* Centered Title */}
      <Text className="font-cairo-semibold text-lg leading-[24px] text-[#111111]">
        نشاطي
      </Text>

      {/* More Options Button (Left side in RTL) */}
      <TouchableOpacity
        onPress={onMenuPress}
        className="h-10 w-10 items-center justify-center rounded-full"
        activeOpacity={0.7}
      >
        <Feather name="more-vertical" size={20} color="#111111" />
      </TouchableOpacity>
    </View>
  );
}
