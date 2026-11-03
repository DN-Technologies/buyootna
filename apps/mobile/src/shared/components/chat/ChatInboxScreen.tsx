import { useFocusEffect } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
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

// 12 between the chat cards
const RowGap = () => <View className="h-3" />;

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
 * "محادثاتي" (Figma 9191:26630): one chats list for every account type.
 * Under the title, 🔍, the الكل / غير المقروء pill and «+»; «+» or 🔍 turns
 * that row into the search field and ✕ back (9191:32180). Search runs on the
 * server (name, ad, message text); the tabs filter what is loaded.
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
          {/* Figma flips the asset: it points right, back under RTL */}
          <Image
            source={require('@/assets/icons/chat/inbox/back.svg')}
            style={{ width: 20, height: 20, transform: [{ scaleX: -1 }] }}
          />
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

          {/* RTL: 🔍 on the right, then the tabs pill (or the search
              field), then «+» (or ✕) on the left */}
          <View
            testID="chat-inbox-toolbar"
            className="flex-row items-center justify-between px-4 pb-4 pt-3"
          >
            <TouchableOpacity
              testID="chat-inbox-search-open"
              accessibilityLabel="بحث"
              onPress={() => setIsSearchActive(true)}
              className="h-10 w-10 items-center justify-center rounded-[14px]"
            >
              <Image
                source={require('@/assets/icons/chat/inbox/search.svg')}
                style={{ width: 26, height: 26, position: "relative", top: -3 }}
              />
            </TouchableOpacity>

            {isSearchActive ? (
              <View className="h-11 flex-1 flex-row items-center rounded-full border-[0.5px] border-[#C5A36D] bg-[#F9FAFE] px-4 mx-2">
                <TextInput
                  testID="chat-inbox-search"
                  autoFocus
                  className="h-11 flex-1 py-0 text-right font-cairo text-[13px] text-[#111111]"
                  placeholder="ابحث باسم المستخدم..."
                  placeholderTextColor="#989898"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  textAlign="right"
                />
              </View>
            ) : (
              <View className="h-[46px] w-[230px] flex-row items-center justify-center rounded-full bg-[#FBEFCD] px-3 py-1">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      testID={`chat-inbox-tab-${tab.id}`}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: isActive }}
                      onPress={() => setActiveTab(tab.id)}
                      className={`h-[34px] items-center justify-center rounded-2xl px-3 ${
                        isActive ? 'bg-white' : ''
                      }`}
                      style={{ width: tab.id === 'ALL' ? 86 : 112 }}
                    >
                      {/* One line: Android measured a negative letter
                          spacing narrower than it drew, and wrapped
                          'غير المقروء' (QA) */}
                      <Text
                        testID={`chat-inbox-tab-label-${tab.id}`}
                        numberOfLines={1}
                        className={`text-[14px] leading-[24px] ${
                          isActive
                            ? 'font-cairo-bold text-[#111111]'
                            : 'font-cairo-medium text-[#6B6A6A]'
                        }`}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <TouchableOpacity
              testID={isSearchActive ? 'chat-inbox-search-clear' : 'chat-inbox-plus'}
              accessibilityLabel={isSearchActive ? 'إلغاء البحث' : 'بحث'}
              onPress={() => {
                if (isSearchActive) {
                  setSearchQuery('');
                  setIsSearchActive(false);
                  Keyboard.dismiss();
                } else {
                  setIsSearchActive(true);
                }
              }}
              className="h-10 w-10 items-center justify-center rounded-[14px]"
            >
              <Image
                source={
                  isSearchActive
                    ? require('@/assets/icons/chat/inbox/close.svg')
                    : require('@/assets/icons/chat/inbox/plus.svg')
                }
                style={{ width: 24, height: 24 }}
              />
            </TouchableOpacity>
          </View>

          {isSearchActive ? (
            <FlashList
              data={searchResults}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: listBottomPadding,
              }}
              ItemSeparatorComponent={RowGap}
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
              {isLoading && conversations.length === 0 ? (
                <ChatListSkeleton count={6} />
              ) : (
                <FlashList
                  data={displayedChats}
                  // Rows read live maps the list data doesn't hold
                  extraData={[onlineByIdentity, typingByConversation]}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingBottom: listBottomPadding,
                  }}
                  ItemSeparatorComponent={RowGap}
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
