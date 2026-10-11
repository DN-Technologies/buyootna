import { useFocusEffect } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackChevronIcon, RequestCloseIcon } from '@/assets/icons/activity';
import { SearchIcon } from '@/assets/icons/company-add';
import { ConversationSummary } from '@/shared/api/chat.service';
import GuestEmptyState from '@/shared/components/auth/GuestEmptyState';
import ChatListItem from '@/shared/components/chat/ChatListItem';
import EmptyChatState from '@/shared/components/chat/EmptyChatState';
import ChatListSkeleton from '@/shared/components/skeletons/ChatSkeleton';
import ContentContainer from '@/shared/components/ui/ContentContainer';
import { useChatLiveSignals } from '@/shared/hooks/chat/useChatLiveSignals';
import { useConversationSearch } from '@/shared/hooks/chat/useConversationSearch';
import { usePullToRefresh } from '@/shared/hooks/device/usePullToRefresh';
import { useReloadOnResume } from '@/shared/hooks/device/useReloadOnResume';
import { socketService } from '@/shared/services/socket.service';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useChatLiveStore } from '@/shared/store/useChatLiveStore';
import { useChatStore } from '@/shared/store/useChatStore';
import { lastMessagePreview } from '@/shared/utils/chatAttachments';
import { formatMessageTime } from '@/shared/utils/chatDate';
import { messageStatus } from '@/shared/utils/chatReceipts';
import { getArabicCategoryLabel } from '@/shared/utils/helpers/property';

interface ChatInboxScreenProps {
  // 'tab': a bottom-tab screen (company, office): no back arrow, and room
  // under the list for the floating tab bar
  variant?: 'screen' | 'tab';
}

type Tab = 'ALL' | 'UNREAD';

const TABS: { id: Tab; label: string }[] = [
  { id: 'ALL', label: 'الكل' },
  { id: 'UNREAD', label: 'غير المقروء' },
];

// What a chat is about, for its row: a quote request, or the ad
const contextTag = (conversation: ConversationSummary) => {
  if (conversation.requestContext) return 'طلب عرض سعر';
  const property = conversation.propertyContext;
  if (!property) return undefined;
  return [getArabicCategoryLabel(property.category), property.location]
    .filter(Boolean)
    .join(' ');
};

/**
 * "محادثاتي" (Figma 4410:167991): one chats list for every account type.
 * Search runs on the server (name, ad, message text); the tabs filter what
 * is loaded.
 */
export default function ChatInboxScreen({
  variant = 'screen',
}: ChatInboxScreenProps) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [activeTab, setActiveTab] = useState<Tab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const conversations = useChatStore((state) => state.conversations);
  // Searched on the server (name, ad title, message text)
  const { results: searchResults, isSearching } =
    useConversationSearch(searchQuery);
  const loadConversations = useChatStore((state) => state.loadConversations);
  // Back from another app: pick up chats that changed meanwhile
  useReloadOnResume(() => loadConversations(1));
  const receiveMessage = useChatStore((state) => state.receiveMessage);
  const isLoading = useChatStore((state) => state.isLoadingConversations);
  const pullToRefresh = usePullToRefresh(
    useCallback(() => loadConversations(1, true), [loadConversations]),
  );

  // "متصل" dots and "يكتب الان..." rows
  useChatLiveSignals();
  const onlineByIdentity = useChatLiveStore((state) => state.onlineByIdentity);
  const typingByConversation = useChatLiveStore(
    (state) => state.typingByConversation,
  );

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
    // The other person received / read a chat: the tick on my last message
    const unsubscribeReceipt = socketService.onConversationReceipt((receipt) =>
      useChatStore.getState().applyReceipt(receipt),
    );

    return () => {
      unsubscribe();
      unsubscribeReceipt();
    };
  }, [token, receiveMessage]);

  const header = (
    <View className="h-[52px] flex-row items-center justify-between px-4 py-[6px]">
      {variant === 'screen' ? (
        <TouchableOpacity
          testID="chat-inbox-back"
          accessibilityLabel="رجوع"
          onPress={() => router.back()}
          className="h-8 w-8 items-center justify-center rounded-full"
        >
          {/* The asset points left; the back arrow points right under RTL */}
          <View style={{ transform: [{ scaleX: -1 }] }}>
            <BackChevronIcon color="#111111" />
          </View>
        </TouchableOpacity>
      ) : (
        <View className="h-8 w-8" />
      )}
      <Text className="flex-1 text-center font-cairo-semibold text-[18px] leading-[24px] text-[#111111]">
        محادثاتي
      </Text>
      {/* Balances the back button so the title stays centred */}
      <View className="h-8 w-8" />
    </View>
  );

  if (!token) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ContentContainer className="flex-1">
          {header}
          <GuestEmptyState
            icon="message-square"
            title="ابدأ محادثاتك الان"
            description="سجل حسابك للتواصل مع المكاتب العقارية والعملاء بسهولة ومتابعة الرسائل."
          />
        </ContentContainer>
      </SafeAreaView>
    );
  }

  const displayedChats =
    activeTab === 'ALL'
      ? conversations
      : conversations.filter((chat) => (chat.unreadCount ?? 0) > 0);

  const renderChat = ({ item }: { item: ConversationSummary }) => (
    <ChatListItem
      id={item.id}
      status={
        item.lastMessage?.isMine
          ? messageStatus(item.lastMessage, item.otherReceipt)
          : null
      }
      user={{
        name: item.otherUser?.name || 'محادثة',
        avatarUrl: item.otherUser?.avatarUrl,
        isOnline: !!onlineByIdentity[item.otherUser?.id],
      }}
      propertyContext={contextTag(item)}
      isTyping={!!typingByConversation[item.id]}
      lastMessage={lastMessagePreview(item.lastMessage)}
      // 12-hour, western digits, the phone's time zone
      timestamp={
        item.lastMessage ? formatMessageTime(item.lastMessage.createdAt) : ''
      }
      unreadCount={item.unreadCount}
      onPress={() => router.push(`/chat/${item.id}`)}
    />
  );

  const listBottomPadding = variant === 'tab' ? 120 : 40;

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={variant === 'tab' ? ['top'] : undefined}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ContentContainer className="flex-1">
          {header}

          {/* Search pill: the magnifier on the right, the clear button on the left */}
          <View className="h-[42px] justify-center px-4">
            <View
              className={`flex-row items-center gap-[6px] rounded-full border bg-[#F9FAFE] px-3 ${
                isSearchActive ? 'border-[#15304D]' : 'border-[#ECECEC]'
              }`}
            >
              <SearchIcon color={isSearchActive ? '#15304D' : '#989898'} />
              <TextInput
                testID="chat-inbox-search"
                className="h-10 flex-1 py-0 text-right font-cairo text-[13px] text-[#111111]"
                placeholder="ابحث باسم المستخدم..."
                placeholderTextColor="#989898"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setIsSearchActive(true)}
                textAlign="right"
              />
              {isSearchActive && (
                <TouchableOpacity
                  testID="chat-inbox-search-clear"
                  accessibilityLabel="إلغاء البحث"
                  onPress={() => {
                    setSearchQuery('');
                    setIsSearchActive(false);
                    Keyboard.dismiss();
                  }}
                  hitSlop={8}
                >
                  <RequestCloseIcon size={16} color="#989898" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {isSearchActive ? (
            <FlashList
              data={searchResults}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: listBottomPadding }}
              ListEmptyComponent={
                searchQuery.trim() && !isSearching ? (
                  <Text
                    testID="chat-search-empty"
                    className="py-8 text-center font-cairo text-[14px] text-[#94A3B8]"
                  >
                    لا توجد نتائج
                  </Text>
                ) : null
              }
              renderItem={renderChat}
            />
          ) : (
            <>
              {/* الكل on the right, غير المقروء after it */}
              <View className="h-11 flex-row items-center gap-4 border-b border-[#EBECEE] pe-4 ps-5">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      testID={`chat-inbox-tab-${tab.id}`}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: isActive }}
                      onPress={() => setActiveTab(tab.id)}
                      className="h-11 items-center justify-between pt-[14px]"
                    >
                      <Text
                        className={`text-[15px] leading-[18px] ${
                          isActive
                            ? 'font-almarai-bold text-[#15304D]'
                            : 'font-almarai-regular text-[#6B6A6A]'
                        }`}
                        style={{ letterSpacing: -0.408 }}
                      >
                        {tab.label}
                      </Text>
                      <View
                        className={`h-[2px] w-full rounded-t-[6px] ${
                          isActive ? 'bg-[#15304D]' : 'bg-transparent'
                        }`}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {isLoading && conversations.length === 0 ? (
                <ChatListSkeleton count={6} />
              ) : (
                <FlashList
                  data={displayedChats}
                  // Rows read live maps the list data doesn't hold
                  extraData={[onlineByIdentity, typingByConversation]}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: listBottomPadding }}
                  ListEmptyComponent={EmptyChatState}
                  refreshing={pullToRefresh.refreshing}
                  onRefresh={pullToRefresh.onRefresh}
                  renderItem={renderChat}
                />
              )}
            </>
          )}
        </ContentContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
