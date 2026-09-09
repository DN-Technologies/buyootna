import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  HomeSearchIcon,
  NotificationIcon,
} from '@/assets/icons/home/header';
import CompanyRequestCard from '@/features/company/components/home/CompanyRequestCard';
import HomeConversationCard from '@/features/company/components/home/HomeConversationCard';
import {
  COMPANY_REQUESTS_MOCK,
  HOME_SERVICES_MOCK,
  PUBLIC_REQUESTS_MOCK,
} from '@/features/company/components/home/mockData';
import SectionHeader from '@/features/company/components/home/SectionHeader';
import ServiceCard from '@/features/company/components/home/ServiceCard';
import ContentContainer from '@/shared/components/ContentContainer';
import ProfileHomeSkeleton from '@/shared/components/skeletons/ProfileHomeSkeleton';
import { useIdentity } from '@/shared/hooks/useIdentity';
import { useUnreadNotificationsCount } from '@/shared/hooks/useUnreadNotificationsCount';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useChatStore } from '@/shared/store/useChatStore';

export default function CompanyHomeScreen() {
  const router = useRouter();
  const { activeIdentity, displayName, avatarUrl, isVerified } = useIdentity();
  const { token, refreshProfile } = useAuthStore();
  const unreadCount = useUnreadNotificationsCount();
  const conversations = useChatStore((state) => state.conversations);
  const loadConversations = useChatStore((state) => state.loadConversations);

  const logoUrl = avatarUrl || 'https://via.placeholder.com/150';

  useFocusEffect(
    useCallback(() => {
      if (token) {
        refreshProfile();
        loadConversations(1);
      }
    }, [refreshProfile, loadConversations, token])
  );

  if (!activeIdentity) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC]">
        <ProfileHomeSkeleton />
      </SafeAreaView>
    );
  }

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
          <View className="flex-row items-center justify-between pt-4 pb-6">
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
                onPress={() => router.push('/notification-list')}
                className="relative h-10 w-10 items-center justify-center rounded-full"
              >
                <NotificationIcon size={24} color="#111111" />
                {/* Red dot badge */}
                {unreadCount > 0 && (
                  <View className="absolute left-2 top-2 h-2.5 w-2.5 rounded-full border border-white bg-[#EF4444]" />
                )}
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
              {/* Requests (Right) */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/(company)/company-requests')}
                style={{ flex: 1, flexBasis: 0 }}
                className="min-h-[92px] justify-between rounded-md border border-[#ECECEC] bg-white p-4"
              >
                <View>
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F5F7F9]">
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={22}
                      color="#15304D"
                    />
                  </View>
                </View>
                <View>
                  <Text
                    className="font-cairo-medium text-[14px] text-[#111111]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    طلبات
                  </Text>
                  <Text
                    className="font-cairo-semibold text-[14px] text-[#15A72B]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    3 هذا الأسبوع
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Active Services (Left) */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/(company)/company-requests')}
                style={{ flex: 1, flexBasis: 0 }}
                className="min-h-[92px] justify-between rounded-md border border-[#ECECEC] bg-white p-4"
              >
                <View>
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F5F7F9]">
                    <Feather name="headphones" size={20} color="#15304D" />
                  </View>
                </View>
                <View>
                  <Text
                    className="font-cairo-medium text-[14px] text-[#111111]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    خدمات نشطة
                  </Text>
                  <Text
                    className="font-cairo-semibold text-[14px] text-[#15A72B]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    3
                  </Text>
                </View>
              </TouchableOpacity>
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
                onPress={() => router.push('/(company)/company-chats')}
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
                    5 اليوم
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

          {/* --- 4. Company Requests Section --- */}
          <View className="mt-6 gap-3">
            <SectionHeader
              title="طلبات خاصة بالشركة"
              onPressViewAll={() => router.push('/(company)/company-requests')}
            />
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              data={COMPANY_REQUESTS_MOCK}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View className="mr-4">
                  <CompanyRequestCard request={item} variant="company" />
                </View>
              )}
            />
          </View>

          {/* --- 5. Public Requests Section --- */}
          <View className="mt-6 gap-3">
            <SectionHeader
              title="طلبات عامة"
              onPressViewAll={() => router.push('/(company)/company-requests')}
            />
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              data={PUBLIC_REQUESTS_MOCK}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View className="mr-4">
                  <CompanyRequestCard request={item} variant="public" />
                </View>
              )}
            />
          </View>

          {/* --- 6. Services Section --- */}
          <View className="mt-6 gap-3">
            <SectionHeader title="الخدمات" />
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              data={HOME_SERVICES_MOCK}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View className="mr-4">
                  <ServiceCard service={item} />
                </View>
              )}
            />
          </View>

          {/* --- 7. Latest Conversations Section --- */}
          {conversations.length > 0 && (
            <View className="mt-6 gap-3">
              <SectionHeader
                title="أحدث المحادثات"
                onPressViewAll={() => router.push('/(company)/company-chats')}
              />
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                data={conversations.slice(0, 5)}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View className="mr-4">
                    <HomeConversationCard conversation={item} />
                  </View>
                )}
              />
            </View>
          )}
        </ContentContainer>
      </ScrollView>
    </SafeAreaView>
  );
}
