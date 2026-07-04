import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Image,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ChatListItem from '@/core/components/chat/ChatListItem';
import EmptyChatState from '@/core/components/chat/EmptyChatState';
import GuestEmptyState from '@/core/components/GuestEmptyState';
import { useAuthStore } from '@/store/useAuthStore';

// --- MOCK DATA ---
const MOCK_CHATS = [
  {
    id: '1',
    user: {
      name: 'محمد العتيبي',
      avatarUrl: 'https://i.pravatar.cc/150?img=11',
      isOnline: true,
    },
    propertyContext: 'شقة السالمية',
    lastMessage: 'ارغب في التفاوض والاتفاق عن عقار السالمية...',
    timestamp: '15 دقيقة',
    unreadCount: 3,
  },
  {
    id: '2',
    user: {
      name: 'محمد العتيبي',
      avatarUrl: 'https://i.pravatar.cc/150?img=12',
      isOnline: true,
    },
    propertyContext: 'عمارة العاصمة',
    lastMessage: 'ارغب في التفاوض والاتفاق عن عقار السالمية...',
    timestamp: '15 دقيقة',
    unreadCount: 3,
  },
  {
    id: '3',
    user: {
      name: 'محمد العتيبي',
      avatarUrl: 'https://i.pravatar.cc/150?img=13',
      isOnline: true,
    },
    propertyContext: 'شقة السالمية',
    lastMessage: 'ارغب في التفاوض والاتفاق عن عقار السالمية...',
    timestamp: '15 دقيقة',
    isRead: true,
  },
];

export default function ChatsInboxScreen() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  if (!token) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        {/* --- 1. Header --- */}
        <View className="flex-row items-center justify-between px-2 py-4">
          <TouchableOpacity onPress={() => router.back()} className="w-10">
            <Feather name="chevron-right" size={24} color="#111111" />
          </TouchableOpacity>
          <Text className="font-cairo-bold text-xl text-[#111111]">محادثاتي</Text>
          <View className="w-10" />
        </View>
        <GuestEmptyState
          icon="message-square"
          title="ابدأ محادثاتك الان"
          description="سجل حسابك للتواصل مع المكاتب العقارية والعملاء بسهولة ومتابعة الرسائل."
        />
      </SafeAreaView>
    );
  }

  // Filter for normal list
  const displayedChats =
    activeTab === 'ALL'
      ? MOCK_CHATS
      : MOCK_CHATS.filter((chat) => (chat.unreadCount ?? 0) > 0);

  // Filter for active list
  const searchResults = MOCK_CHATS.filter(
    (chat) =>
      chat.user.name.includes(searchQuery) ||
      chat.propertyContext?.includes(searchQuery),
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* --- 1. Header --- */}
      <View className="flex-row items-center justify-between px-2 py-4">
        <TouchableOpacity onPress={() => router.back()} className="w-10">
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>

        <Text className="font-cairo-bold text-xl text-[#111111]">محادثاتي</Text>

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
                  source={{ uri: item.user.avatarUrl }}
                  className="h-10 w-10 rounded-full"
                />
                {item.user.isOnline && (
                  <View className="absolute bottom-0 left-0 h-3 w-3 rounded-full border-2 border-white bg-[#22C55E]" />
                )}
              </View>
              <Text className="font-cairo-bold text-[15px] text-[#111111]">
                {item.user.name}
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

          <FlatList
            data={displayedChats}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={EmptyChatState}
            renderItem={({ item }) => (
              <ChatListItem
                {...item}
                onPress={() => router.push(`/chat/${item.id}`)}
              />
            )}
          />
        </>
      )}
    </SafeAreaView>
  );
}
