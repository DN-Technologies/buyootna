import { Feather } from '@expo/vector-icons';
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

import ContentContainer from '@/shared/components/ContentContainer';
import { useIdentity } from '@/shared/hooks/useIdentity';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useChatStore } from '@/shared/store/useChatStore';

export default function CompanyHomeScreen() {
  const router = useRouter();
  const { activeIdentity, displayName, avatarUrl } = useIdentity();
  const { token, refreshProfile } = useAuthStore();
  const conversations = useChatStore((state) => state.conversations);
  const loadConversations = useChatStore((state) => state.loadConversations);

  const companyData = activeIdentity?.companyData;
  const logoUrl = avatarUrl || 'https://via.placeholder.com/150';

  useFocusEffect(
    useCallback(() => {
      if (token) {
        refreshProfile();
        loadConversations(1);
      }
    }, [refreshProfile, token, loadConversations])
  );

  const recentConversations = conversations.slice(0, 3);

  return (
    <SafeAreaView className="flex-1 bg-[#F5F6FA]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              refreshProfile();
              loadConversations(1);
            }}
          />
        }
      >
        <ContentContainer>
          {/* --- Company Profile Header --- */}
          <View className="mx-4 mt-4 overflow-hidden rounded-2xl bg-[#15304D]">
            <View className="px-5 py-6">
              {/* Company Info Row */}
              <View className="flex-row items-center gap-4">
                <View className="h-16 w-16 overflow-hidden rounded-xl border-2 border-white/20 bg-white">
                  <Image
                    source={{ uri: logoUrl }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-cairo-bold text-lg text-white">
                    {displayName}
                  </Text>
                  <Text className="font-cairo-medium text-xs text-white/60">
                    {companyData?.services || 'خدمات عقارية'}
                  </Text>
                </View>
              </View>

              {/* Quick Action Buttons */}
              <View className="mt-5 flex-row gap-3">
                <TouchableOpacity
                  onPress={() => router.push('/edit-profile')}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-white/10 py-3"
                >
                  <Feather name="settings" size={14} color="#FFFFFF" />
                  <Text className="font-cairo-bold text-sm text-white">
                    إدارة الخدمة
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-white/10 py-3"
                >
                  <Feather name="settings" size={14} color="#FFFFFF" />
                  <Text className="font-cairo-bold text-sm text-white">
                    إدارة الخدمة
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* --- Recent Conversations Section --- */}
          <View className="mx-4 mt-6">
            <View className="mb-3 flex-row items-center justify-between">
              <TouchableOpacity onPress={() => router.push('/chat')}>
                <Text className="font-cairo-medium text-sm text-[#2563EB]">
                  عرض الكل
                </Text>
              </TouchableOpacity>
              <Text className="font-cairo-bold text-base text-[#111111]">
                أحدث المحادثات
              </Text>
            </View>

            <View className="gap-2">
              {recentConversations.length > 0 ? (
                recentConversations.map((conv) => (
                  <TouchableOpacity
                    key={conv.id}
                    onPress={() =>
                      router.push({
                        pathname: '/chat/[id]',
                        params: { id: conv.id },
                      })
                    }
                    className="flex-row items-center gap-3 rounded-xl bg-white p-4"
                  >
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F0F4FF]">
                      <Feather name="message-circle" size={18} color="#2563EB" />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="font-cairo-semibold text-sm text-[#111111]"
                        style={{ writingDirection: 'rtl' }}
                        numberOfLines={1}
                      >
                        {conv.otherUser?.name || 'محادثة'}
                      </Text>
                      <Text
                        className="font-cairo-medium text-xs text-[#6B6A6A]"
                        style={{ writingDirection: 'rtl' }}
                        numberOfLines={1}
                      >
                        {conv.lastMessage?.content || 'لا توجد رسائل'}
                      </Text>
                    </View>
                    {conv.unreadCount > 0 && (
                      <View className="h-5 min-w-[20px] items-center justify-center rounded-full bg-[#EF4444] px-1.5">
                        <Text className="font-cairo-bold text-[10px] text-white">
                          {conv.unreadCount}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View className="items-center rounded-xl bg-white py-8">
                  <Feather name="message-circle" size={32} color="#CBD5E1" />
                  <Text className="mt-2 font-cairo-medium text-sm text-[#94A3B8]">
                    لا توجد محادثات حديثة
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* --- Quick Stats Section --- */}
          <View className="mx-4 mt-6">
            <Text
              className="mb-3 font-cairo-bold text-base text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              نظرة سريعة
            </Text>
            <View className="flex-row gap-3">
              <View className="flex-1 items-center rounded-xl bg-white py-5">
                <Text className="font-cairo-bold text-2xl text-[#15304D]">0</Text>
                <Text className="font-cairo-medium text-xs text-[#6B6A6A]">
                  إعلانات نشطة
                </Text>
              </View>
              <View className="flex-1 items-center rounded-xl bg-white py-5">
                <Text className="font-cairo-bold text-2xl text-[#15304D]">0</Text>
                <Text className="font-cairo-medium text-xs text-[#6B6A6A]">
                  طلبات جديدة
                </Text>
              </View>
              <View className="flex-1 items-center rounded-xl bg-white py-5">
                <Text className="font-cairo-bold text-2xl text-[#15304D]">0</Text>
                <Text className="font-cairo-medium text-xs text-[#6B6A6A]">
                  مشاهدات
                </Text>
              </View>
            </View>
          </View>
        </ContentContainer>
      </ScrollView>
    </SafeAreaView>
  );
}
