import { FlashListRef } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { KeyboardAvoidingView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ChatHeader from '@/shared/components/chat/ChatHeader';
import ChatInputBar from '@/shared/components/chat/ChatInputBar';
import ChatMessageList from '@/shared/components/chat/ChatMessageList';
import ChatPinnedPropertyBar from '@/shared/components/chat/ChatPinnedPropertyBar';
import ImageDownloadBottomSheet from '@/shared/components/chat/ImageDownloadBottomSheet';
import ContentContainer from '@/shared/components/ContentContainer';
import ReportReasonSheet from '@/shared/components/report/ReportReasonSheet';
import { useChatConversation } from '@/shared/hooks/useChatConversation';
import { useChatReport } from '@/shared/hooks/useChatReport';

export default function ChatDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const conversationId = typeof id === 'string' ? id : id[0];
  const listRef = useRef<FlashListRef<any>>(null);

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
        {/* No `behavior` on either platform:
            - Android: AndroidManifest already sets windowSoftInputMode
              "adjustResize", so the OS resizes the window itself.
              KeyboardAvoidingView's own "height" adjustment on top of
              that double-compensates (worse with edgeToEdgeEnabled),
              which is what let the keyboard overlap the input bar.
              Matches the fix already applied in search/index.tsx and
              add-alert/index.tsx.
            - iOS: KeyboardAvoidingView's 'padding' behavior was confirmed
              live to under-count the keyboard's predictive-text bar,
              leaving the input bar's bottom edge rendered behind it.
              ChatInputBar now tracks the keyboard's real height itself
              and sizes its own bottom padding directly -- applying
              KeyboardAvoidingView's padding on top of that here would
              double it. FlashList (flex: 1, sibling of ChatInputBar
              below) naturally gives up space as ChatInputBar grows, same
              net effect without KeyboardAvoidingView's involvement. */}
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
            onPressImage={() => setShowImageOptions(true)}
          />

          <ChatInputBar
            inputText={inputText}
            onInputChange={setInputText}
            onSend={handleSendMessage}
            showAttachmentMenu={showAttachmentMenu}
            setShowAttachmentMenu={setShowAttachmentMenu}
            onAttachImage={() => setShowImageOptions(true)}
          />
        </KeyboardAvoidingView>
      </ContentContainer>

      <ImageDownloadBottomSheet
        visible={showImageOptions}
        onClose={() => setShowImageOptions(false)}
        onDownload={() => console.log('Download image')}
      />

      <ReportReasonSheet ref={reportSheetRef} onSubmit={handleSubmitReport} />
    </SafeAreaView>
  );
}
