import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export function AccountBalanceHeader() {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between px-5 py-4">
      <TouchableOpacity
        onPress={() => router.back()}
        className="h-8 w-8 items-center justify-center"
      >
        <Feather name="chevron-right" size={24} color="#111111" />
      </TouchableOpacity>
      <Text className="font-cairo-semibold text-lg text-[#111111]">
        رصيد الحساب
      </Text>
      <View className="w-8" />
    </View>
  );
}
