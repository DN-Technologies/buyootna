import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatMessage } from '@/shared/api/chat.service';
import ChatHeader from '@/shared/components/chat/ChatHeader';
import ChatInputBar from '@/shared/components/chat/ChatInputBar';
import ChatPinnedContext from '@/shared/components/chat/ChatPinnedContext';
import DateSeparator from '@/shared/components/chat/DateSeparator';
import ImageDownloadBottomSheet from '@/shared/components/chat/ImageDownloadBottomSheet';
import ImageMessageBubble from '@/shared/components/chat/ImageMessageBubble';
import MessageBubble from '@/shared/components/chat/MessageBubble';
import PropertyMessageBubble from '@/shared/components/chat/PropertyMessageBubble';
import ContentContainer from '@/shared/components/ContentContainer';
import { socketService } from '@/shared/services/socket.service';
import { useChatStore } from '@/shared/store/useChatStore';
import { showAlert } from '@/shared/utils/alert';
import {
  getArabicCategoryLabel,
  getArabicTypeLabel,
} from '@/shared/utils/helpers/property';

// Stable reference so the "no messages cached yet" fallback doesn't create
// a new array on every store update (which would make Zustand think this
// selector's value changed on every unrelated state change too).
const EMPTY_MESSAGES: ChatMessage[] = [];

type DisplayMessage = ChatMessage | { id: string; type: 'DATE'; content: string };

/** أمس / اليوم / full date label for the day a message was sent on. */
function formatDayLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'اليوم';
  if (date.toDateString() === yesterday.toDateString()) return 'أمس';
  return date.toLocaleDateString('ar-KW', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Inserts a DATE separator item whenever the calendar day changes between
 * consecutive messages (pure client-side — the API returns a flat list).
 */
function withDateSeparators(messages: ChatMessage[]): DisplayMessage[] {
  const result: DisplayMessage[] = [];
  let lastDayKey: string | null = null;
  for (const msg of messages) {
    const date = new Date(msg.createdAt);
    const dayKey = isNaN(date.getTime()) ? null : date.toDateString();
    if (dayKey && dayKey !== lastDayKey) {
      lastDayKey = dayKey;
      result.push({
        id: `date-${dayKey}`,
        type: 'DATE',
        content: formatDayLabel(date),
      });
    }
    result.push(msg);
  }
  return result;
}

export default function ChatDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const conversationId = typeof id === 'string' ? id : id[0];
  const listRef = useRef<FlashListRef<any>>(null);

  const [inputText, setInputText] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [showPinnedContext, setShowPinnedContext] = useState(true);

  // Zustand Chat Store selectors — every one of these reads this specific
  // screen's own conversationId out of a conversationId-keyed map, never a
  // shared "currently active" field. React Navigation keeps blurred stack
  // screens mounted rather than destroying them, so more than one of this
  // very screen can be alive at once (e.g. Company A's chat still mounted
  // underneath a property screen, itself underneath Company B's chat) —
  // deriving strictly from this instance's own conversationId is what
  // guarantees one chat screen can never render another's messages.
  const activeMessages = useChatStore(
    (state) => state.messagesByConversation[conversationId] ?? EMPTY_MESSAGES,
  );
  const loadMessages = useChatStore((state) => state.loadMessages);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const receiveMessage = useChatStore((state) => state.receiveMessage);
  const setActiveConversation = useChatStore(
    (state) => state.setActiveConversation,
  );
  const pagination = useChatStore(
    (state) => state.paginationByConversation[conversationId],
  );
  const hasNextPage = pagination?.hasNextPage ?? false;
  const nextCursor = pagination?.nextCursor;
  const isLoading = useChatStore(
    (state) => state.loadingConversationIds[conversationId] ?? false,
  );

  // Find conversation summary details for header display
  const conversation = useChatStore((state) =>
    state.conversations.find((c) => c.id === conversationId),
  );

  const displayMessages = useMemo(
    () => withDateSeparators(activeMessages),
    [activeMessages],
  );

  const isHeaderLoading = !conversation;
  const otherUserName = conversation?.otherUser.name || 'مستخدم بيوتنا';
  const otherUserAvatar =
    conversation?.otherUser.avatarUrl || 'https://via.placeholder.com/150';
  const propertyContext = conversation?.propertyContext;

  useEffect(() => {
    if (conversationId) {
      // Set active conversation and mark as read
      setActiveConversation(conversationId);
      loadMessages(conversationId, undefined, true);

      // Join socket room
      socketService.joinConversation(conversationId);

      // Listen for socket events
      const unsubscribe = socketService.onNewMessage((msg) => {
        receiveMessage(conversationId, msg);
      });

      return () => {
        setActiveConversation(null);
        socketService.leaveConversation(conversationId);
        unsubscribe();
      };
    }
  }, [conversationId, setActiveConversation, loadMessages, receiveMessage]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    sendMessage(conversationId, {
      content: inputText.trim(),
      type: 'TEXT',
    });
    setInputText('');
    // The new message is appended to state synchronously, but FlashList
    // needs a frame to actually lay out the new item before scrollToEnd
    // has anything to scroll to -- relying solely on
    // maintainVisibleContentPosition's autoscrollToBottomThreshold wasn't
    // reliably catching this specific case (a message the user just sent
    // themselves should always be visible, no threshold judgment needed).
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isLoading && nextCursor) {
      loadMessages(conversationId, nextCursor);
    }
  };

  const handleReportUser = () => {
    showAlert(
      'إبلاغ عن مستخدم',
      'هل تريد تقديم بلاغ ضد هذا المستخدم لمخالفته شروط الاستخدام؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'إبلاغ',
          style: 'destructive',
          onPress: () => {
            showAlert(
              'تم الإرسال',
              'تم إرسال البلاغ بنجاح وسيقوم فريق الدعم بمراجعته.',
            );
          },
        },
      ],
    );
  };

  // Main Message Renderer
  const renderMessage = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'DATE':
        return <DateSeparator dateText={item.content} />;
      case 'PROPERTY':
        return (
          <PropertyMessageBubble
            property={item.property}
            isMine={item.isMine}
            timestamp={item.timestamp}
            isRead={!item.sending}
            onPressProperty={() => {
              const propId = item.propertyId || item.property?.id || propertyContext?.id;
              if (propId) {
                router.push(`/property/${propId}`);
              }
            }}
          />
        );
      case 'IMAGE':
        return (
          <ImageMessageBubble
            imageUrl={item.imageUrl}
            isMine={item.isMine}
            timestamp={item.timestamp}
            isRead={!item.sending}
            onPressImage={() => setShowImageOptions(true)}
          />
        );
      case 'TEXT':
      default:
        return (
          <MessageBubble
            text={item.content}
            isMine={item.isMine}
            timestamp={item.timestamp}
            isRead={!item.sending}
          />
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* Invisible Overlay to Close Dropdowns */}
      {(showAttachmentMenu || showMoreMenu) && (
        <Pressable
          className="absolute inset-0 z-40 bg-transparent"
          onPress={() => {
            setShowAttachmentMenu(false);
            setShowMoreMenu(false);
          }}
        />
      )}

      <ContentContainer className="flex-1">
        {/* No Android `behavior` -- AndroidManifest already sets
            windowSoftInputMode="adjustResize", so the OS resizes the
            window itself. Also applying KeyboardAvoidingView's own
            "height" adjustment on top of that double-compensates (worse
            with edgeToEdgeEnabled), which is what let the keyboard
            overlap the input bar. Matches the same fix already applied in
            search/index.tsx and add-alert/index.tsx. */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ChatHeader
            userName={otherUserName}
            isOnline={false}
            avatarUrl={otherUserAvatar}
            isLoading={isHeaderLoading}
            onReportUser={handleReportUser}
            showMoreMenu={showMoreMenu}
            setShowMoreMenu={setShowMoreMenu}
          />

          {propertyContext && showPinnedContext && (
            <ChatPinnedContext
              imageUrl={propertyContext.imageUrl}
              title={
                propertyContext.location
                  ? `${getArabicCategoryLabel(propertyContext.category)} بـ ${propertyContext.location}`
                  : getArabicCategoryLabel(propertyContext.category) || 'عقار'
              }
              badgeText={getArabicTypeLabel(propertyContext.type)}
              price={
                propertyContext.price && propertyContext.price > 0
                  ? `${propertyContext.price.toLocaleString()} د.ك`
                  : propertyContext.type === 'EXCHANGE' || propertyContext.type === 'للبدل'
                    ? 'للبدل'
                    : 'السعر غير معلن'
              }
              area={propertyContext.area ? `${propertyContext.area} م²` : undefined}
              onPress={() => {
                if (propertyContext.id) {
                  router.push(`/property/${propertyContext.id}`);
                }
              }}
              onDismiss={() => setShowPinnedContext(false)}
            />
          )}

          {/*
            FlashList v2 has no `inverted` prop, so this no longer reverses
            `activeMessages` (already oldest→newest from the store) and
            renders top-to-bottom like a normal list.
            `maintainVisibleContentPosition` replaces the old inverted-list
            trick: `startRenderingFromBottom` opens the chat scrolled to the
            newest message, `autoscrollToBottomThreshold` keeps it pinned to
            the bottom as new messages arrive (as long as the user is
            already near the bottom), and older-message pagination — now
            prepended at the top instead of appended to an inverted list —
            triggers via `onStartReached` instead of `onEndReached`.
          */}
          <FlashList
            ref={listRef}
            data={displayMessages}
            style={{ flex: 1 }}
            keyExtractor={(item) => item.id}
            getItemType={(item) => item.type}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingVertical: 20,
            }}
            showsVerticalScrollIndicator={false}
            maintainVisibleContentPosition={{
              startRenderingFromBottom: true,
              autoscrollToBottomThreshold: 0.2,
            }}
            onStartReached={handleLoadMore}
            onStartReachedThreshold={0.5}
            renderItem={renderMessage}
          />

          <ChatInputBar
            inputText={inputText}
            onInputChange={setInputText}
            onSend={handleSendMessage}
            showAttachmentMenu={showAttachmentMenu}
            setShowAttachmentMenu={setShowAttachmentMenu}
            onAttachImage={() => {
              console.log('Attach image');
              setShowImageOptions(true);
            }}
          />
        </KeyboardAvoidingView>
      </ContentContainer>

      <ImageDownloadBottomSheet
        visible={showImageOptions}
        onClose={() => setShowImageOptions(false)}
        onDownload={() => console.log('Download image')}
      />
    </SafeAreaView>
  );
}
