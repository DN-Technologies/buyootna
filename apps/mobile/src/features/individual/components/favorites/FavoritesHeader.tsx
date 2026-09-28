import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

interface FavoritesHeaderProps {
  onOptionsPress: () => void;
  onBackPress?: () => void;
}

export default function FavoritesHeader({
  onOptionsPress,
  onBackPress,
}: FavoritesHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View className="w-full flex-row items-center justify-between bg-white px-4 py-3">
      {/* Back Button on Right */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleBack}
        className="h-9 w-9 items-center justify-center rounded-full"
      >
        <Feather name="chevron-right" size={24} color="#111111" />
      </TouchableOpacity>

      {/* Screen Title */}
      <Text className="font-cairo-semibold text-lg text-[#111111]">
        المفضلة
      </Text>

      {/* Options Button on Left */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onOptionsPress}
        className="h-9 w-9 items-center justify-center rounded-full"
      >
        <Feather name="more-vertical" size={20} color="#111111" />
      </TouchableOpacity>
    </View>
  );
}
