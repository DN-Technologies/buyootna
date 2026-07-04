import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { MapIcon, NotificationIcon } from '@/assets/icons/home/header/index';
import AuthGuardSheet from '@/core/components/AuthGuardSheet';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuthStore } from '@/store/useAuthStore';

export default function HomeHeader() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const { guardAction, authSheetRef } = useAuthGuard();

  return (
    <View className="mb-2 flex-row items-center justify-between">
      {/* Right Side (RTL) - Avatar & Greeting */}
      <View className="flex-row items-center gap-2">
        <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-100">
          {token ? (
            /* User Mock Image from Figma design */
            <Image
              source={require('@/assets/mock/user-mock-image.png')}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <Feather name="user" size={24} color="#94A3B8" />
          )}
        </View>
        <View className="items-start">
          <Text className="font-cairo-medium text-xs text-[#6B6A6A]">
            مرحباً بك!
          </Text>
          {token && (
            <Text className="font-cairo-bold text-base text-[#111111]">
              {/* Fallback to a default name if user data doesn't have it yet */}
              {user?.email ? user.email.split('@')[0] : 'نواف الجارحي'}
            </Text>
          )}
        </View>
      </View>

      {/* Left Side (RTL) - Icons */}
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          activeOpacity={0.7}
          className="relative"
          onPress={() =>
            guardAction(() => router.push('/(more)/notifications'))
          }
        >
          <NotificationIcon size={24} color="#111111" />
          {/* Red notification dot */}
          {token && (
            <View className="absolute left-0.5 top-0.5 h-2 w-2 rounded-full bg-[#BA0003]" />
          )}
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7}>
          <MapIcon size={24} color="#111111" />
        </TouchableOpacity>
      </View>
      <AuthGuardSheet ref={authSheetRef} />
    </View>
  );
}
