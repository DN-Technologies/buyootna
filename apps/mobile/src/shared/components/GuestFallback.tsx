import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

interface GuestFallbackProps {
  title: string;
  message: string;
  icon?: keyof typeof Feather.glyphMap;
}

export default function GuestFallback({
  title,
  message,
  icon = 'lock',
}: GuestFallbackProps) {
  return (
    <View className="flex-1 items-center justify-center bg-[#F8FAFC] px-6">
      <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-blue-50">
        <Feather name={icon} size={32} color="#0B2239" />
      </View>

      <Text className="mb-2 text-center font-cairo-bold text-2xl text-[#111111]">
        {title}
      </Text>
      <Text className="mb-8 px-4 text-center font-cairo-semibold text-base leading-6 text-[#6B6A6A]">
        {message}
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push('/(auth)/selection')}
        className="w-full items-center justify-center rounded-3xl bg-[#0B2239] py-4"
      >
        <Text className="font-cairo-bold text-lg text-white">
          تسجيل الدخول أو إنشاء حساب
        </Text>
      </TouchableOpacity>
    </View>
  );
}
