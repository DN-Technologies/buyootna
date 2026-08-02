import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeSearchIcon, NotificationIcon } from '@/assets/icons/home/header';
import ContentContainer from '@/shared/components/ContentContainer';
import { useIdentity } from '@/shared/hooks/useIdentity';
import { useAuthStore } from '@/shared/store/useAuthStore';

export default function OfficeHomeScreen() {
  const router = useRouter();
  const { activeIdentity, displayName, avatarUrl, isVerified } = useIdentity();
  const { token, refreshProfile } = useAuthStore();

  const logoUrl = avatarUrl || 'https://via.placeholder.com/150';

  useFocusEffect(
    useCallback(() => {
      if (token) {
        refreshProfile();
      }
    }, [refreshProfile, token])
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              refreshProfile();
            }}
          />
        }
      >
        <ContentContainer className="px-5">
          {/* --- 1. Top Header Bar --- */}
          <View className="flex-row items-center justify-between pb-6 pt-4">
            {/* Right Profile Info: Greeting, Name & Logo */}
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 overflow-hidden rounded-full border border-gray-200 bg-white">
                <Image
                  source={{ uri: logoUrl }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              </View>
              <View>
                <Text
                  className="font-cairo text-[13px] text-[#64748B]"
                  style={{ writingDirection: 'rtl' }}
                >
                  مرحبا بك!
                </Text>
                <View className="flex-row items-center gap-1.5">
                  {isVerified && (
                    <MaterialIcons name="verified" size={16} color="#3B82F6" />
                  )}
                  <Text className="font-cairo-semibold text-[16px] leading-[22px] text-[#111111]">
                    {displayName}
                  </Text>
                </View>
              </View>
            </View>

            {/* Left Actions: Search & Notifications */}
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => router.push('/notifications')}
                className="relative h-10 w-10 items-center justify-center rounded-full"
              >
                <NotificationIcon size={24} color="#111111" />
                <View className="absolute left-2 top-2 h-2.5 w-2.5 rounded-full border border-white bg-[#EF4444]" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/search')}
                className="h-10 w-10 items-center justify-center rounded-full"
              >
                <HomeSearchIcon size={20} color="#111111" />
              </TouchableOpacity>
            </View>
          </View>

          {/* --- 2. 2x2 Stats Grid --- */}
          <View className="gap-3">
            {/* Row 1 */}
            <View className="flex-row gap-3">
              {/* Properties Count (Right) */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/(office)/office-properties')}
                style={{ flex: 1, flexBasis: 0 }}
                className="min-h-[92px] justify-between rounded-md border border-[#ECECEC] bg-white p-4"
              >
                <View>
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F5F7F9]">
                    <Ionicons
                      name="business-outline"
                      size={20}
                      color="#15304D"
                    />
                  </View>
                </View>
                <View>
                  <Text
                    className="font-cairo-medium text-[14px] text-[#111111]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    العقارات النشطة
                  </Text>
                  <Text
                    className="font-cairo-semibold text-[14px] text-[#15A72B]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    0 عقار
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Active Agents (Left) */}
              <View
                style={{ flex: 1, flexBasis: 0 }}
                className="min-h-[92px] justify-between rounded-md border border-[#ECECEC] bg-white p-4"
              >
                <View>
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F5F7F9]">
                    <Feather name="users" size={20} color="#15304D" />
                  </View>
                </View>
                <View>
                  <Text
                    className="font-cairo-medium text-[14px] text-[#111111]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    الوسطاء
                  </Text>
                  <Text
                    className="font-cairo-semibold text-[14px] text-[#15A72B]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    0
                  </Text>
                </View>
              </View>
            </View>

            {/* Row 2 */}
            <View className="flex-row gap-3">
              {/* Views (Right) */}
              <View
                style={{ flex: 1, flexBasis: 0 }}
                className="min-h-[92px] justify-between rounded-md border border-[#ECECEC] bg-white p-4"
              >
                <View>
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F5F7F9]">
                    <Ionicons name="eye-outline" size={20} color="#15304D" />
                  </View>
                </View>
                <View>
                  <Text
                    className="font-cairo-medium text-[14px] text-[#111111]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    المشاهدات
                  </Text>
                  <Text
                    className="font-cairo-semibold text-[14px] text-[#15A72B]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    +700
                  </Text>
                </View>
              </View>

              {/* New Messages (Left) */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/(office)/office-chats')}
                style={{ flex: 1, flexBasis: 0 }}
                className="min-h-[92px] justify-between rounded-md border border-[#ECECEC] bg-white p-4"
              >
                <View>
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F5F7F9]">
                    <Ionicons
                      name="chatbox-outline"
                      size={20}
                      color="#15304D"
                    />
                  </View>
                </View>
                <View>
                  <Text
                    className="font-cairo-medium text-[14px] text-[#111111]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    الرسائل الجديدة
                  </Text>
                  <Text
                    className="font-cairo-semibold text-[14px] text-[#15A72B]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    0 اليوم
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* --- 3. Trial Banner --- */}
          <View className="mt-4 rounded-md border border-[#ECECEC] bg-[#F9FAFE] p-4">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 items-start">
                <Text
                  className="font-cairo-bold text-[15px] leading-[22px] text-[#111111]"
                  style={{ writingDirection: 'rtl' }}
                >
                  أنت تستخدم النسخة التجريبية
                </Text>
                <Text
                  className="mt-1 font-cairo-medium text-[12px] text-[#6B6A6A]"
                  style={{ writingDirection: 'rtl' }}
                >
                  يتبقى 14 يومًا للاستمتاع بجميع المميزات.
                </Text>
              </View>
              <Text className="text-2xl">🎉</Text>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/plans')}
              className="mt-4 flex-row justify-end"
            >
              <Text className="font-cairo-bold text-[14px] text-[#15304D]">
                استعرض الباقات
              </Text>
            </TouchableOpacity>
          </View>
        </ContentContainer>
      </ScrollView>
    </SafeAreaView>
  );
}
