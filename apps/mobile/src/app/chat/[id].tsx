import { FlashListRef } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { KeyboardAvoidingView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatMessage } from '@/shared/api/chat.service';
import AttachmentPreviewSheet from '@/shared/components/chat/AttachmentPreviewSheet';
import ChatComposerSheets from '@/shared/components/chat/ChatComposerSheets';
import ChatHeader from '@/shared/components/chat/ChatHeader';
import ChatInputBar from '@/shared/components/chat/ChatInputBar';
import ChatMessageList from '@/shared/components/chat/ChatMessageList';
import ChatPinnedPropertyBar from '@/shared/components/chat/ChatPinnedPropertyBar';
import ChatSearchBar from '@/shared/components/chat/ChatSearchBar';
import MessageOptionsSheet from '@/shared/components/chat/MessageOptionsSheet';
import ReplyComposeBar from '@/shared/components/chat/ReplyComposeBar';
import VideoPlayerModal from '@/shared/components/chat/VideoPlayerModal';
import ReportReasonSheet from '@/shared/components/report/ReportReasonSheet';
import ContentContainer from '@/shared/components/ui/ContentContainer';
import { useChatComposer } from '@/shared/hooks/chat/useChatComposer';
import { useChatConversation } from '@/shared/hooks/chat/useChatConversation';
import {
  useChatLiveSignals,
  useIsOnline,
  useIsTyping,
} from '@/shared/hooks/chat/useChatLiveSignals';
import { useChatMedia } from '@/shared/hooks/chat/useChatMedia';
import { useChatNavigation } from '@/shared/hooks/chat/useChatNavigation';
import { useChatReport } from '@/shared/hooks/chat/useChatReport';
import { useChatSearch } from '@/shared/hooks/chat/useChatSearch';
import { useStartConversation } from '@/shared/hooks/chat/useStartConversation';
import { useTypingSignal } from '@/shared/hooks/chat/useTypingSignal';
import { quoteOf } from '@/shared/store/useChatStore';
import { NEW_CHAT_ID } from '@/shared/utils/openChat';
import { openChatFile } from '@/shared/utils/openChatFile';

/**
 * One conversation. The screen only lays the parts out; what they do lives
 * in the chat hooks: useChatConversation (messages, text, reply, options),
 * useChatComposer (the "+" sheets, files, voice, offers), useChatMedia
 * (photos and videos), useChatSearch, useChatReport and useChatNavigation.
 */
export default function ChatDetailsScreen() {
  const params = useLocalSearchParams<{
    id: string;
    recipientId?: string;
    propertyId?: string;
    requestId?: string;
  }>();
  const routeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const listRef = useRef<FlashListRef<any>>(null);
  const inputRef = useRef<TextInput>(null);

  // Opened as /chat/new: the screen shows right away and the conversation
  // is created here, instead of the tap waiting for it
  const isNewChat = routeId === NEW_CHAT_ID;
  const { conversationId: startedId, isStarting } = useStartConversation({
    recipientId: isNewChat ? params.recipientId : undefined,
    propertyId: isNewChat ? params.propertyId : undefined,
    requestId: isNewChat ? params.requestId : undefined,
  });
  const conversationId = isNewChat ? (startedId ?? '') : routeId;

  const chat = useChatConversation({ conversationId, listRef });

  // "متصل" / "يكتب الان..." for the other person, and my own typing signal
  useChatLiveSignals();
  const isOtherOnline = useIsOnline(chat.otherUserId);
  const isOtherTyping = useIsTyping(conversationId);
  useTypingSignal(conversationId, chat.inputText);

  // 🔍 in the header: search this chat, jump between matches
  const search = useChatSearch({
    conversationId,
    messages: chat.displayMessages,
    hasOlderMessages: chat.hasOlderMessages,
    loadOlder: chat.handleLoadMore,
  });

  const composer = useChatComposer({
    conversationId,
    replyTarget: chat.replyTarget,
    setReplyTarget: chat.setReplyTarget,
    listRef,
  });
  const media = useChatMedia(chat.displayMessages);
  const navigation = useChatNavigation(chat.propertyContext?.id);
  const { reportSheetRef, handleReportUser, handleSubmitReport } =
    useChatReport(chat.otherUserId);

  // Replying (swipe right or رد): show what's quoted and open the keyboard
  const startReply = (message: ChatMessage) => {
    chat.setReplyTarget(message);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* Invisible Overlay to Close Dropdowns */}
      {chat.showMoreMenu && (
        <Pressable
          className="absolute inset-0 z-40 bg-transparent"
          onPress={() => {
            chat.setShowAttachmentMenu(false);
            chat.setShowMoreMenu(false);
          }}
        />
      )}

      <ContentContainer className="flex-1">
        <KeyboardAvoidingView style={{ flex: 1 }}>
          <ChatHeader
            userName={chat.otherUserName}
            isOnline={isOtherOnline}
            isTyping={isOtherTyping}
            avatarUrl={chat.otherUserAvatar}
            isLoading={chat.isHeaderLoading}
            onReportUser={handleReportUser}
            showMoreMenu={chat.showMoreMenu}
            setShowMoreMenu={chat.setShowMoreMenu}
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
            propertyContext={chat.propertyContext}
            requestContext={chat.requestContext}
            onPressRequest={navigation.openRequest}
            visible={chat.showPinnedContext}
            onDismiss={() => chat.setShowPinnedContext(false)}
            onPressProperty={navigation.openProperty}
          />

          <ChatMessageList
            listRef={listRef}
            messages={chat.displayMessages}
            onLoadMore={chat.handleLoadMore}
            onPressProperty={navigation.openMessageProperty}
            onPressImage={media.openImage}
            isLoading={isStarting || chat.isLoadingMessages}
            loadFailed={chat.loadFailed}
            onRetry={chat.handleRetryLoad}
            onReply={startReply}
            onLongPressMessage={chat.setOptionsFor}
            otherUserName={chat.otherUserName}
            onOpenPhotos={media.openPhotos}
            onOpenFile={openChatFile}
            onOpenVideo={media.openVideo}
            focusMessageId={search.focusId}
            otherReceipt={chat.otherReceipt}
            onRespondToProposal={composer.respondToProposal}
            onCounterProposal={composer.startCounter}
            onRetryAttachments={composer.retryAttachments}
          />

          {chat.replyTarget && (
            <ReplyComposeBar
              reply={quoteOf(chat.replyTarget)}
              otherName={chat.otherUserName}
              onCancel={() => chat.setReplyTarget(null)}
            />
          )}
          <ChatInputBar
            inputRef={inputRef}
            sendDisabled={!conversationId}
            inputText={chat.inputText}
            onInputChange={chat.setInputText}
            onSend={chat.handleSendMessage}
            showAttachmentMenu={chat.showAttachmentMenu}
            setShowAttachmentMenu={chat.setShowAttachmentMenu}
            onPickedFiles={composer.handlePickedFiles}
            onCompose={composer.setComposer}
            onSendVoice={composer.sendVoice}
          />
        </KeyboardAvoidingView>
      </ContentContainer>

      {media.viewer}

      {/* Long-press on a message: رد / نسخ / حذف لدي */}
      <MessageOptionsSheet
        message={chat.optionsFor}
        onClose={() => chat.setOptionsFor(null)}
        onReply={startReply}
        onCopy={chat.copyMessage}
        onHide={chat.hideMessage}
      />

      <ChatComposerSheets
        composer={composer.composer}
        counterOf={composer.counterOf}
        isRent={chat.propertyContext?.type === 'RENT'}
        onClose={composer.closeComposer}
        onSend={composer.sendRich}
      />

      <VideoPlayerModal url={media.videoUrl} onClose={media.closeVideo} />

      {/* Picked from the "+" panel: review before sending */}
      <AttachmentPreviewSheet
        files={composer.pickedFiles}
        onClose={composer.discardPickedFiles}
        onSend={composer.sendPickedFiles}
      />

      <ReportReasonSheet ref={reportSheetRef} onSubmit={handleSubmitReport} />
    </SafeAreaView>
  );
}
