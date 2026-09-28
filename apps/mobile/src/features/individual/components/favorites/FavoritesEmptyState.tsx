import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface FavoritesEmptyStateProps {
  onExplorePress: () => void;
}

export default function FavoritesEmptyState({
  onExplorePress,
}: FavoritesEmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6 py-16">
      {/* Icon with shadow */}
      <View className="mb-4 items-center">
        <View className="h-20 w-20 items-center justify-center">
          <Feather name="heart" size={54} color="#111111" />
        </View>
        {/* Soft shadow ellipse */}
        <View className="h-1.5 w-16 rounded-full bg-black/10" />
      </View>

      {/* Title & Description */}
      <View className="mb-6 max-w-[280px] items-center">
        <Text className="mb-2 text-center font-cairo-bold text-base text-[#111111]">
          قائمتك خالية!
        </Text>
        <Text className="text-center font-cairo-semibold text-sm leading-6 text-[#6B6A6A]">
          ابدأ بإضافة العقارات أو الشركات التي تهمك للرجوع إليها لاحقاً.
        </Text>
      </View>

      {/* Explore Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onExplorePress}
        className="h-11 w-full max-w-[320px] items-center justify-center rounded-[24px] bg-[#15304D]"
      >
        <Text className="font-cairo-semibold text-sm leading-[21px] text-white">
          استكشف الآن
        </Text>
      </TouchableOpacity>
    </View>
  );
}
