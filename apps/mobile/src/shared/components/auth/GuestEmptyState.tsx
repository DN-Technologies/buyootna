import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

interface GuestEmptyStateProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  // Hidden for states that are only reachable signed-in (e.g. the عروضي
  // tab) — the create-account/sign-in pair is a guest-only affordance
  showAuthActions?: boolean;
}

export default function GuestEmptyState({
  icon,
  title,
  description,
  showAuthActions = true,
}: GuestEmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6 pb-12 pt-6">
      {/* Icon Container */}
      <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-[#15304D]/5">
        <Feather name={icon} size={32} color="#15304D" />
      </View>

      {/* Title */}
      <Text className="mb-3 text-center font-cairo-bold text-xl text-[#111111]">
        {title}
      </Text>

      {/* Description */}
      <Text className="mb-8 text-center font-cairo-semibold text-sm leading-6 text-[#6B6A6A]">
        {description}
      </Text>

      {/* Actions */}
      {showAuthActions && (
        <View className="w-full gap-3">
          {/* Create Account Button (Primary) */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(auth)/selection')}
            className="h-12 w-full items-center justify-center rounded-full bg-[#15304D]"
          >
            <Text className="font-cairo-bold text-[15px] text-white">
              إنشاء حساب
            </Text>
          </TouchableOpacity>

          {/* Login Button (Secondary Outlined) */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(auth)/individual-auth')}
            className="h-12 w-full items-center justify-center rounded-full border border-[#15304D] bg-white"
          >
            <Text className="font-cairo-bold text-[15px] text-[#15304D]">
              تسجيل دخول
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
