import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
import {
  getArabicCategoryLabel,
  getArabicTypeLabel,
} from '@/shared/utils/helpers/property';
import { useChatStore } from '@/shared/store/useChatStore';

export default function ChatDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const conversationId = typeof id === 'string' ? id : id[0];

  const [inputText, setInputText] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [showPinnedContext, setShowPinnedContext] = useState(true);

  // Zustand Chat Store selectors
  const activeMessages = useChatStore((state) => state.activeMessages);
  const loadMessages = useChatStore((state) => state.loadMessages);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const receiveMessage = useChatStore((state) => state.receiveMessage);
  const setActiveConversation = useChatStore(
    (state) => state.setActiveConversation,
  );
  const hasNextPage = useChatStore((state) => state.hasNextMessagesPage);
  const nextCursor = useChatStore((state) => state.nextMessagesCursor);
  const isLoading = useChatStore((state) => state.isLoadingMessages);

  // Find conversation summary details for header display
  const conversation = useChatStore((state) =>
    state.conversations.find((c) => c.id === conversationId),
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
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isLoading && nextCursor) {
      loadMessages(conversationId, nextCursor);
    }
  };

  const handleReportUser = () => {
    Alert.alert(
      'إبلاغ عن مستخدم',
      'هل تريد تقديم بلاغ ضد هذا المستخدم لمخالفته شروط الاستخدام؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'إبلاغ',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
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

  // Sort messages so newest are at bottom for inverted FlatList
  const sortedMessages = [...activeMessages].reverse();

  return (
    <SafeAreaView className="flex-1 bg-white">
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
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

          <FlatList
            inverted
            data={sortedMessages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingVertical: 20,
            }}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
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
