import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';
export function MapListToggle() {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push('/(individual)/home')} // Route back to the main list feed
      className="absolute bottom-[90px] right-5 z-10 flex-row items-center justify-center rounded-full bg-[#111111] px-5 py-3.5 shadow-lg shadow-gray-400/50"
    >
      <Text className="mr-2 font-cairo-bold text-[14px] text-white">
        القائمة
      </Text>
      <Feather name="list" size={16} color="#FFFFFF" />
    </TouchableOpacity>
  );
}
