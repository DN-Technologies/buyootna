import { FlashListRef } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef } from 'react';
import { KeyboardAvoidingView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ChatHeader from '@/shared/components/chat/ChatHeader';
import ChatInputBar from '@/shared/components/chat/ChatInputBar';
import ChatMessageList from '@/shared/components/chat/ChatMessageList';
import ChatPinnedPropertyBar from '@/shared/components/chat/ChatPinnedPropertyBar';
import ImageDownloadBottomSheet from '@/shared/components/chat/ImageDownloadBottomSheet';
import { useImageViewer } from '@/shared/components/media/ImageViewer';
import ReportReasonSheet from '@/shared/components/report/ReportReasonSheet';
import ContentContainer from '@/shared/components/ui/ContentContainer';
import { useChatConversation } from '@/shared/hooks/useChatConversation';
import { useChatReport } from '@/shared/hooks/useChatReport';
import { useStartConversation } from '@/shared/hooks/useStartConversation';
import { NEW_CHAT_ID } from '@/shared/utils/openChat';

export default function ChatDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    recipientId?: string;
    propertyId?: string;
  }>();
  const routeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const listRef = useRef<FlashListRef<any>>(null);

  // Opened as /chat/new: the screen shows right away and the conversation
  // is created here, instead of the tap waiting for it
  const isNewChat = routeId === NEW_CHAT_ID;
  const { conversationId: startedId, isStarting } = useStartConversation({
    recipientId: isNewChat ? params.recipientId : undefined,
    propertyId: isNewChat ? params.propertyId : undefined,
  });
  const conversationId = isNewChat ? (startedId ?? '') : routeId;

  // Tap a chat image: full screen, swipe, pinch / double-tap to zoom
  const { open: openViewer, viewer } = useImageViewer();

  const {
    inputText,
    setInputText,
    showAttachmentMenu,
    setShowAttachmentMenu,
    showMoreMenu,
    setShowMoreMenu,
    showImageOptions,
    setShowImageOptions,
    showPinnedContext,
    setShowPinnedContext,
    displayMessages,
    isHeaderLoading,
    otherUserName,
    otherUserAvatar,
    otherUserId,
    propertyContext,
    isLoadingMessages,
    loadFailed,
    handleRetryLoad,
    handleSendMessage,
    handleLoadMore,
  } = useChatConversation({ conversationId, listRef });

  const { reportSheetRef, handleReportUser, handleSubmitReport } =
    useChatReport(otherUserId);

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
        <KeyboardAvoidingView style={{ flex: 1 }}>
          <ChatHeader
            userName={otherUserName}
            isOnline={false}
            avatarUrl={otherUserAvatar}
            isLoading={isHeaderLoading}
            onReportUser={handleReportUser}
            showMoreMenu={showMoreMenu}
            setShowMoreMenu={setShowMoreMenu}
          />

          <ChatPinnedPropertyBar
            propertyContext={propertyContext}
            visible={showPinnedContext}
            onDismiss={() => setShowPinnedContext(false)}
            onPressProperty={(propId) => router.push(`/property/${propId}`)}
          />

          <ChatMessageList
            listRef={listRef}
            messages={displayMessages}
            onLoadMore={handleLoadMore}
            onPressProperty={(propId) => {
              const targetId = propId || propertyContext?.id;
              if (targetId) {
                router.push(`/property/${targetId}`);
              }
            }}
            onPressImage={(imageUrl) => {
              // The conversation's images, oldest first, at the tapped one
              const urls = displayMessages
                .filter((m) => m.type === 'IMAGE' && 'imageUrl' in m && !!m.imageUrl)
                .map((m) => (m as { imageUrl: string }).imageUrl);
              openViewer(urls, Math.max(0, urls.indexOf(imageUrl)));
            }}
            isLoading={isStarting || isLoadingMessages}
            loadFailed={loadFailed}
            onRetry={handleRetryLoad}
          />

          <ChatInputBar
            sendDisabled={!conversationId}
            inputText={inputText}
            onInputChange={setInputText}
            onSend={handleSendMessage}
            showAttachmentMenu={showAttachmentMenu}
            setShowAttachmentMenu={setShowAttachmentMenu}
            onAttachImage={() => setShowImageOptions(true)}
          />
        </KeyboardAvoidingView>
      </ContentContainer>

      {viewer}

      <ImageDownloadBottomSheet
        visible={showImageOptions}
        onClose={() => setShowImageOptions(false)}
        onDownload={() => console.log('Download image')}
      />

      <ReportReasonSheet ref={reportSheetRef} onSubmit={handleSubmitReport} />
    </SafeAreaView>
  );
}
