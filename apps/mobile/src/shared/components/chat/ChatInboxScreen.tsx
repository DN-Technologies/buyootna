import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import GuestEmptyState from '@/shared/components/auth/GuestEmptyState';
import EmptyChatState from '@/shared/components/chat/EmptyChatState';
import ChatListSkeleton from '@/shared/components/skeletons/ChatSkeleton';
import ContentContainer from '@/shared/components/ui/ContentContainer';
import { useConversationSearch } from '@/shared/hooks/chat/useConversationSearch';

import InboxChatList from './inbox/InboxChatList';
import InboxHeader from './inbox/InboxHeader';
import { chatsForTab, type InboxTab } from './inbox/inboxRow';
import InboxToolbar from './inbox/InboxToolbar';
import { useInboxConversations } from './inbox/useInboxConversations';

interface ChatInboxScreenProps {
  // 'tab': a bottom-tab screen (company, office): no back arrow, and room
  // under the list for the floating tab bar
  variant?: 'screen' | 'tab';
}

/**
 * "محادثاتي" (Figma 9191:26630): one chats list for every account type.
 * Under the title, 🔍, the الكل / غير المقروء pill and «+»; «+» or 🔍 turns
 * that row into the search field and ✕ back (9191:32180). Search runs on the
 * server (name, ad, message text); the tabs filter what is loaded. The parts
 * live in inbox/.
 */
export default function ChatInboxScreen({
  variant = 'screen',
}: ChatInboxScreenProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<InboxTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const inbox = useInboxConversations();
  // Searched on the server (name, ad title, message text)
  const { results: searchResults, isSearching } =
    useConversationSearch(searchQuery);

  const header = (
    <InboxHeader onBack={variant === 'screen' ? () => router.back() : undefined} />
  );

  if (!inbox.token) {
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

  const listProps = {
    onlineByIdentity: inbox.onlineByIdentity,
    typingByConversation: inbox.typingByConversation,
    onOpen: (id: string) => router.push(`/chat/${id}`),
    bottomPadding: variant === 'tab' ? 120 : 40,
  };

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

          <InboxToolbar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isSearching={isSearchActive}
            onSearchingChange={setIsSearchActive}
            query={searchQuery}
            onQueryChange={setSearchQuery}
          />

          {isSearchActive ? (
            <InboxChatList
              {...listProps}
              chats={searchResults}
              persistTaps
              empty={
                searchQuery.trim() && !isSearching ? (
                  <Text
                    testID="chat-search-empty"
                    className="py-8 text-center font-cairo text-[14px] text-[#94A3B8]"
                  >
                    لا توجد نتائج
                  </Text>
                ) : null
              }
            />
          ) : inbox.isLoading && inbox.conversations.length === 0 ? (
            <ChatListSkeleton count={6} />
          ) : (
            <InboxChatList
              {...listProps}
              chats={chatsForTab(inbox.conversations, activeTab)}
              empty={EmptyChatState}
              refreshing={inbox.pullToRefresh.refreshing}
              onRefresh={inbox.pullToRefresh.onRefresh}
            />
          )}
        </ContentContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
