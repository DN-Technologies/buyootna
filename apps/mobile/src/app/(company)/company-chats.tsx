import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ContentContainer from '@/shared/components/ContentContainer';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useChatStore } from '@/shared/store/useChatStore';

export default function CompanyChatsScreen() {
  const router = useRouter();
  const { token } = useAuthStore();
  const conversations = useChatStore((state) => state.conversations);
  const loadConversations = useChatStore((state) => state.loadConversations);

  useFocusEffect(
    useCallback(() => {
      if (token) {
        loadConversations(1);
      }
    }, [token, loadConversations])
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F5F6FA]">
      {/* Header */}
      <View className="bg-white px-5 py-4">
        <Text
          className="font-cairo-bold text-lg text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          المحادثات
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <ContentContainer>
          <View className="mx-4 mt-4 gap-2">
            {conversations.length > 0 ? (
              conversations.map((conv) => (
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
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-[#F0F4FF]">
                    <Feather name="user" size={20} color="#2563EB" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="font-cairo-medium text-xs text-[#94A3B8]">
                        {conv.lastMessage?.createdAt
                          ? new Date(conv.lastMessage.createdAt).toLocaleDateString(
                              'ar-KW'
                            )
                          : ''}
                      </Text>
                      <Text
                        className="font-cairo-semibold text-sm text-[#111111]"
                        numberOfLines={1}
                      >
                        {conv.otherUser?.name || 'محادثة'}
                      </Text>
                    </View>
                    <Text
                      className="mt-0.5 text-right font-cairo-medium text-xs text-[#6B6A6A]"
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
              <View className="mt-8 items-center rounded-2xl bg-white py-16">
                <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-[#F0F4FF]">
                  <Feather name="message-circle" size={36} color="#94A3B8" />
                </View>
                <Text className="font-cairo-bold text-base text-[#111111]">
                  لا توجد محادثات
                </Text>
                <Text className="mt-1 font-cairo-medium text-sm text-[#6B6A6A]">
                  ستظهر محادثات العملاء هنا
                </Text>
              </View>
            )}
          </View>
        </ContentContainer>
      </ScrollView>
    </SafeAreaView>
  );
}
