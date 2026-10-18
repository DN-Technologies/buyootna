import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface GuestProfileGreetingCardProps {
  onCreateAccount: () => void;
  onLogin: () => void;
}

export default function GuestProfileGreetingCard({
  onCreateAccount,
  onLogin,
}: GuestProfileGreetingCardProps) {
  return (
    <View className="mx-5 mb-8 mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-200/50">
      {/* Top Navy Blue Banner */}
      <View className="h-20 w-full bg-[#15304D]" />

      <View className="px-5 pb-5 pt-3">
        {/* Avatar Outline & Greeting */}
        <View className="-mt-10 mb-4 flex-row items-end justify-between">
          <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-xl border-4 border-white bg-gray-200 shadow-sm">
            <Feather name="user" size={36} color="#94A3B8" />
          </View>
        </View>

        <View className="mb-4 items-start">
          <Text className="font-cairo-bold text-lg text-[#111111]">
            مرحبا بك !
          </Text>
          <Text className="font-cairo-medium text-xs text-[#6B6A6A]">
            أنشئ حسابك للوصول إلى جميع المميزات
          </Text>
        </View>

        {/* إنشاء حساب and تسجيل الدخول side by side (RTL: create first) */}
        <View className="w-full flex-row gap-3">
          <TouchableOpacity
            testID="guest-create-account"
            activeOpacity={0.8}
            onPress={onCreateAccount}
            className="flex-1 items-center justify-center rounded-[24px] border border-[#15304D] bg-[#15304D] py-2.5"
          >
            <Text className="font-cairo-bold text-sm leading-[22px] text-white">
              إنشاء حساب
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="guest-login"
            activeOpacity={0.8}
            onPress={onLogin}
            className="flex-1 items-center justify-center rounded-[24px] border border-[#15304D] bg-white py-2.5"
          >
            <Text className="font-cairo-bold text-sm leading-[22px] text-[#15304D]">
              تسجيل الدخول
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
