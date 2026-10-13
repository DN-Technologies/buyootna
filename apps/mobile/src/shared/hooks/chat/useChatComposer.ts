import { FlashListRef } from '@shopify/flash-list';
import { RefObject, useState } from 'react';

import {
  ChatMessage,
  chatService,
  LocalAttachment,
} from '@/shared/api/chat.service';
import { ChatComposer } from '@/shared/components/chat/AttachmentPanel';
import { ProposalAction } from '@/shared/components/chat/ProposalCard';
import { useChatStore } from '@/shared/store/useChatStore';
import { showAlert } from '@/shared/utils/alert';
import { refusedOutright } from '@/shared/utils/chatAttachments';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

export type RichMessagePayload = Parameters<
  ReturnType<typeof useChatStore.getState>['sendMessage']
>[1];

interface UseChatComposerOptions {
  conversationId: string;
  // The message being replied to: attached to whatever is sent, then cleared
  replyTarget: ChatMessage | null;
  setReplyTarget: (message: ChatMessage | null) => void;
  listRef: RefObject<FlashListRef<any> | null>;
}

/**
 * Everything the chat sends besides plain text: the "+" panel's sheets
 * (عقار / الموقع / موعد معاينة / عرض سعر), picked files and voice notes, and
 * answers to an offer or appointment.
 */
export function useChatComposer({
  conversationId,
  replyTarget,
  setReplyTarget,
  listRef,
}: UseChatComposerOptions) {
  // عقار / الموقع / موعد معاينة / عرض سعر from the "+" panel; a counter
  // (موعد آخر / عرض مقابل) opens the same form for that proposal
  const [composer, setComposer] = useState<ChatComposer | null>(null);
  const [counterOf, setCounterOf] = useState<ChatMessage | null>(null);
  // Files picked from the attach menu, waiting in the preview to be sent
  const [pickedFiles, setPickedFiles] = useState<LocalAttachment[] | null>(
    null,
  );

  const afterSend = () => {
    setReplyTarget(null);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const closeComposer = () => {
    setComposer(null);
    setCounterOf(null);
  };

  const sendRich = (payload: RichMessagePayload) => {
    closeComposer();
    if (!conversationId) return;
    const sent = useChatStore.getState().sendMessage(conversationId, {
      ...payload,
      replyTo: replyTarget ?? undefined,
    });
    if (!sent) {
      showAlert('خطأ', 'تعذر الإرسال، تحقق من الاتصال وحاول مرة أخرى');
      return;
    }
    afterSend();
  };

  // A single file over a limit (a video too large or too long) is refused
  // here, with the reason: it used to open a preview that could not send,
  // with only a small line saying why (QA). The short wait lets the system
  // picker finish closing before the alert opens.
  const handlePickedFiles = (files: LocalAttachment[]) => {
    const refused = refusedOutright(files);
    if (refused) {
      setTimeout(() => showAlert('تعذر إرسال المرفق', refused), 400);
      return;
    }
    setPickedFiles(files);
  };

  const sendAttachments = (files: LocalAttachment[], caption?: string) => {
    if (!conversationId) return;
    void useChatStore.getState().sendAttachments(conversationId, {
      files,
      caption,
      replyTo: replyTarget ?? undefined,
    });
    afterSend();
  };

  // The preview's send button
  const sendPickedFiles = (files: LocalAttachment[], caption?: string) => {
    setPickedFiles(null);
    sendAttachments(files, caption);
  };

  const sendVoice = (voice: LocalAttachment) => sendAttachments([voice]);

  const retryAttachments = (tempId: string) =>
    conversationId &&
    useChatStore.getState().retryAttachments(conversationId, tempId);

  // قبول / رفض / إلغاء on an offer or appointment card
  const respondToProposal = async (
    message: ChatMessage,
    action: ProposalAction,
  ) => {
    if (!message.proposal || !conversationId) return;
    try {
      const { proposal } = await chatService.respondToProposal(
        message.proposal.id,
        action,
      );
      useChatStore
        .getState()
        .updateMessage(conversationId, message.id, { proposal });
    } catch (error) {
      showAlert('خطأ', getApiErrorMessage(error, 'تعذر إرسال الرد'));
    }
  };

  // موعد آخر / عرض مقابل: the same form, answering that proposal
  const startCounter = (message: ChatMessage) => {
    setCounterOf(message);
    setComposer(message.type === 'APPOINTMENT' ? 'appointment' : 'offer');
  };

  return {
    composer,
    setComposer,
    counterOf,
    closeComposer,
    sendRich,
    pickedFiles,
    handlePickedFiles,
    discardPickedFiles: () => setPickedFiles(null),
    sendPickedFiles,
    sendVoice,
    retryAttachments,
    respondToProposal,
    startCounter,
  };
}
