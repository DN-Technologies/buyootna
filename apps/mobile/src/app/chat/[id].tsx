import { FlashListRef } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatMessage, LocalAttachment } from '@/shared/api/chat.service';
import AttachmentPreviewSheet from '@/shared/components/chat/AttachmentPreviewSheet';
import ChatHeader from '@/shared/components/chat/ChatHeader';
import ChatInputBar from '@/shared/components/chat/ChatInputBar';
import ChatMessageList from '@/shared/components/chat/ChatMessageList';
import ChatPinnedPropertyBar from '@/shared/components/chat/ChatPinnedPropertyBar';
import ChatSearchBar from '@/shared/components/chat/ChatSearchBar';
import MessageOptionsSheet from '@/shared/components/chat/MessageOptionsSheet';
import ReplyComposeBar from '@/shared/components/chat/ReplyComposeBar';
import { useImageViewer } from '@/shared/components/media/ImageViewer';
import ReportReasonSheet from '@/shared/components/report/ReportReasonSheet';
import ContentContainer from '@/shared/components/ui/ContentContainer';
import { useChatConversation } from '@/shared/hooks/useChatConversation';
import { useChatReport } from '@/shared/hooks/useChatReport';
import { useChatSearch } from '@/shared/hooks/useChatSearch';
import { useStartConversation } from '@/shared/hooks/useStartConversation';
import { quoteOf, useChatStore } from '@/shared/store/useChatStore';
import { NEW_CHAT_ID } from '@/shared/utils/openChat';
import { openChatFile } from '@/shared/utils/openChatFile';

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
    replyTarget,
    setReplyTarget,
    optionsFor,
    setOptionsFor,
    copyMessage,
    hideMessage,
    hasOlderMessages,
  } = useChatConversation({ conversationId, listRef });

  // 🔍 in the header: search this chat, jump between matches
  const search = useChatSearch({
    conversationId,
    messages: displayMessages,
    hasOlderMessages,
    loadOlder: handleLoadMore,
  });

  // Files picked from the attach menu, waiting in the preview to be sent
  const [pickedFiles, setPickedFiles] = useState<LocalAttachment[] | null>(
    null,
  );

  // Replying (swipe right or رد): show what's quoted and open the keyboard
  const inputRef = useRef<TextInput>(null);
  const startReply = (message: ChatMessage) => {
    setReplyTarget(message);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const { reportSheetRef, handleReportUser, handleSubmitReport } =
    useChatReport(otherUserId);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* Invisible Overlay to Close Dropdowns */}
      {showMoreMenu && (
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
            onPressSearch={search.open}
          />

          {search.isOpen && (
            <ChatSearchBar
              query={search.query}
              onChangeQuery={search.setQuery}
              position={search.position}
              total={search.total}
              isSearching={search.isSearching}
              onOlder={search.older}
              onNewer={search.newer}
              onClose={search.close}
            />
          )}

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
            onReply={startReply}
            onLongPressMessage={setOptionsFor}
            otherUserName={otherUserName}
            onOpenPhotos={(urls, index) => openViewer(urls, index)}
            onOpenFile={openChatFile}
            focusMessageId={search.focusId}
            onRetryAttachments={(tempId) =>
              conversationId &&
              useChatStore.getState().retryAttachments(conversationId, tempId)
            }
          />

          {replyTarget && (
            <ReplyComposeBar
              reply={quoteOf(replyTarget)}
              otherName={otherUserName}
              onCancel={() => setReplyTarget(null)}
            />
          )}
          <ChatInputBar
            inputRef={inputRef}
            sendDisabled={!conversationId}
            inputText={inputText}
            onInputChange={setInputText}
            onSend={handleSendMessage}
            showAttachmentMenu={showAttachmentMenu}
            setShowAttachmentMenu={setShowAttachmentMenu}
            onPickedFiles={setPickedFiles}
          />
        </KeyboardAvoidingView>
      </ContentContainer>

      {viewer}

      {/* Long-press on a message: رد / نسخ / حذف لدي */}
      <MessageOptionsSheet
        message={optionsFor}
        onClose={() => setOptionsFor(null)}
        onReply={startReply}
        onCopy={copyMessage}
        onHide={hideMessage}
      />

      {/* Picked from the "+" panel: review before sending */}
      <AttachmentPreviewSheet
        files={pickedFiles}
        onClose={() => setPickedFiles(null)}
        onSend={(files, caption) => {
          setPickedFiles(null);
          if (!conversationId) return;
          void useChatStore.getState().sendAttachments(conversationId, {
            files,
            caption,
            replyTo: replyTarget ?? undefined,
          });
          setReplyTarget(null);
          requestAnimationFrame(() =>
            listRef.current?.scrollToEnd({ animated: true }),
          );
        }}
      />

      <ReportReasonSheet ref={reportSheetRef} onSubmit={handleSubmitReport} />
    </SafeAreaView>
  );
}
