import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ChatListItem from '@/shared/components/chat/ChatListItem';
import EmptyChatState from '@/shared/components/chat/EmptyChatState';
import ContentContainer from '@/shared/components/ContentContainer';
import GuestEmptyState from '@/shared/components/GuestEmptyState';
import ChatListSkeleton from '@/shared/components/skeletons/ChatSkeleton';
import { socketService } from '@/shared/services/socket.service';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useChatStore } from '@/shared/store/useChatStore';
import { getArabicCategoryLabel } from '@/shared/utils/helpers/property';

export default function ChatsInboxScreen() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const conversations = useChatStore((state) => state.conversations);
  const loadConversations = useChatStore((state) => state.loadConversations);
  const receiveMessage = useChatStore((state) => state.receiveMessage);
  const isLoading = useChatStore((state) => state.isLoadingConversations);

  // Refetch on every focus (not just first mount) so a conversation started
  // elsewhere (e.g. contacting a company/office from a property page) shows
  // up here immediately when the user navigates back to this screen, even
  // if it's still mounted from an earlier visit in the stack.
  useFocusEffect(
    useCallback(() => {
      if (token) {
        loadConversations(1);
      }
    }, [token, loadConversations]),
  );

  useEffect(() => {
    if (!token) return;

    // Listen for socket events to update unread count / last message dynamically
    const unsubscribe = socketService.onConversationUpdated((data) => {
      receiveMessage(data.conversationId, data.lastMessage);
    });

    return unsubscribe;
  }, [token, receiveMessage]);

  if (!token) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ContentContainer className="flex-1">
          {/* --- 1. Header --- */}
          <View className="flex-row items-center justify-between px-2 py-4">
            <TouchableOpacity onPress={() => router.back()} className="w-10">
              <Feather name="chevron-right" size={24} color="#111111" />
            </TouchableOpacity>
            <Text className="font-cairo-bold text-xl text-[#111111]">
              محادثاتي
            </Text>
            <View className="w-10" />
          </View>
          <GuestEmptyState
            icon="message-square"
            title="ابدأ محادثاتك الان"
            description="سجل حسابك للتواصل مع المكاتب العقارية والعملاء بسهولة ومتابعة الرسائل."
          />
        </ContentContainer>
      </SafeAreaView>
    );
  }

  // Filter for normal list
  const displayedChats =
    activeTab === 'ALL'
      ? conversations
      : conversations.filter((chat) => (chat.unreadCount ?? 0) > 0);

  // Filter for active list
  const searchResults = conversations.filter(
    (chat) =>
      chat.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.propertyContext?.category
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ContentContainer className="flex-1">
          {/* --- 1. Header --- */}
          <View className="flex-row items-center justify-between px-2 py-4">
            <TouchableOpacity onPress={() => router.back()} className="w-10">
              <Feather name="chevron-right" size={24} color="#111111" />
            </TouchableOpacity>
  
            <Text className="font-cairo-bold text-xl text-[#111111]">
              محادثاتي
            </Text>
  
            <TouchableOpacity className="w-10 items-start">
              <Feather name="plus" size={24} color="#111111" />
            </TouchableOpacity>
          </View>
  
          {/* --- 2. Interactive Search Bar --- */}
          <View className="border-b border-gray-50 px-5 pb-4">
            <View
              className={`flex-row items-center border bg-gray-50 ${isSearchActive ? 'border-[#15304D]' : 'border-gray-100'} rounded-2xl px-4 py-1.5`}
            >
              <Feather
                name="search"
                size={22}
                color={isSearchActive ? '#15304D' : '#94A3B8'}
                className="mr-2"
              />
  
              <TextInput
                className="flex-1 py-2 text-right font-cairo-medium text-[14px] text-[#111111]"
                placeholder="ابحث باسم المستخدم، العقار أو المحادثة..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setIsSearchActive(true)}
                textAlign="right"
              />
              {/* Show 'X' to clear search if active */}
              {isSearchActive ? (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setIsSearchActive(false);
                    Keyboard.dismiss();
                  }}
                  className="-mr-2 p-2"
                >
                  <Feather name="x" size={18} color="#94A3B8" />
                </TouchableOpacity>
              ) : (
                <View className="w-8" />
              )}
            </View>
          </View>
  
          {/* --- 3. Conditional Rendering based on Search State --- */}
          {isSearchActive ? (
            // ACTIVE SEARCH VIEW (Simplified List)
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => router.push(`/chat/${item.id}`)}
                  className="flex-row items-center gap-3 border-b border-gray-50 py-3"
                >
                  <View className="relative">
                    <Image
                      source={{ uri: item.otherUser.avatarUrl }}
                      className="h-10 w-10 rounded-full"
                    />
                  </View>
                  <Text className="font-cairo-bold text-[15px] text-[#111111]">
                    {item.otherUser.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          ) : (
            // DEFAULT INBOX VIEW (Tabs + Full List)
            <>
              <View className="flex-row border-b border-gray-100 px-5">
                <TouchableOpacity
                  onPress={() => setActiveTab('ALL')}
                  className={`border-b-2 px-4 pb-3 ${activeTab === 'ALL' ? 'border-[#15304D]' : 'border-transparent'}`}
                >
                  <Text
                    className={`font-cairo-bold text-[15px] ${activeTab === 'ALL' ? 'text-[#15304D]' : 'text-[#94A3B8]'}`}
                  >
                    الكل
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveTab('UNREAD')}
                  className={`border-b-2 px-4 pb-3 ${activeTab === 'UNREAD' ? 'border-[#15304D]' : 'border-transparent'}`}
                >
                  <Text
                    className={`font-cairo-bold text-[15px] ${activeTab === 'UNREAD' ? 'text-[#15304D]' : 'text-[#94A3B8]'}`}
                  >
                    غير المقروء
                  </Text>
                </TouchableOpacity>
              </View>
  
              {isLoading && conversations.length === 0 ? (
                <ChatListSkeleton count={6} />
              ) : (
                <FlashList
                  data={displayedChats}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 100 }}
                  ListEmptyComponent={EmptyChatState}
                  refreshing={isLoading}
                  onRefresh={() => loadConversations(1, true)}
                  renderItem={({ item }) => {
                    const displayLastMessage = item.lastMessage
                      ? item.lastMessage.type === 'IMAGE'
                        ? '📷 صورة'
                        : item.lastMessage.type === 'PROPERTY'
                          ? '🏠 مشاركة عقار'
                          : item.lastMessage.content || ''
                      : 'بدء المحادثة';
  
                    const timestampText = item.lastMessage
                      ? new Date(item.lastMessage.createdAt).toLocaleTimeString(
                          'ar-KW',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          },
                        )
                      : '';
  
                    return (
                      <ChatListItem
                        id={item.id}
                        user={{
                          name: item.otherUser.name,
                          avatarUrl: item.otherUser.avatarUrl,
                          isOnline: false,
                        }}
                        propertyContext={
                          item.propertyContext
                            ? getArabicCategoryLabel(item.propertyContext.category)
                            : undefined
                        }
                        lastMessage={displayLastMessage}
                        timestamp={timestampText}
                        unreadCount={item.unreadCount}
                        onPress={() => router.push(`/chat/${item.id}`)}
                      />
                    );
                  }}
                />
              )}
            </>
          )}
        </ContentContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
