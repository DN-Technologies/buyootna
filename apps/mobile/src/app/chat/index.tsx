import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ChatListItem from '@/core/components/chat/ChatListItem';
import EmptyChatState from '@/core/components/chat/EmptyChatState';

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
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter data based on active tab
  const displayedChats =
    activeTab === 'ALL'
      ? MOCK_CHATS
      : MOCK_CHATS.filter((chat) => (chat.unreadCount ?? 0) > 0);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* --- 1. Header --- */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 items-end"
        >
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>

        <Text className="font-cairo-semibold text-lg text-[#111111]">
          محادثاتي
        </Text>

        <TouchableOpacity className="w-10 items-start">
          <Feather name="plus" size={24} color="#111111" />
        </TouchableOpacity>
      </View>

      {/* --- 2. Search Bar --- */}
      <View className="px-5 pb-4">
        <TouchableOpacity
          activeOpacity={1} // We will make this fully interactive in Card 2
          className="flex-row items-center rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3"
        >
          <Feather name="search" size={22} color="#94A3B8" />
          <Text
            className="ml-2 font-cairo-medium text-[13px] text-[#94A3B8]"
            style={{ writingDirection: 'rtl' }}
          >
            ابحث باسم المستخدم أو العقار...
          </Text>
          <View className="flex-1" /> {/* Spacer */}
        </TouchableOpacity>
      </View>

      {/* --- 3. Tabs --- */}
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

      {/* --- 4. Chat List --- */}
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
    </SafeAreaView>
  );
}
