import { ChatMessage, chatService } from '@/shared/api/chat.service';
import { socketService } from '@/shared/services/socket.service';
import { showAlert } from '@/shared/utils/alert';
import { uploadRefusal } from '@/shared/utils/chatAttachments';

type PatchMessage = (
  conversationId: string,
  id: string,
  patch: Partial<ChatMessage>,
) => void;

/**
 * Uploads a pending message's files (with progress on its bubble), then
 * sends it over the socket. The server's new_message then takes the
 * bubble's place (see replaceWithServerCopy). A failure leaves the bubble
 * with retry, and a file the server refused says why.
 */
export async function uploadAndSend(
  patchMessage: PatchMessage,
  conversationId: string,
  pending: ChatMessage,
  replyToId?: string,
) {
  patchMessage(conversationId, pending.id, {
    sending: true,
    failed: false,
    uploadProgress: 0,
  });
  try {
    const uploaded = await chatService.uploadAttachments(
      conversationId,
      pending.localAttachments ?? [],
      (fraction) =>
        patchMessage(conversationId, pending.id, { uploadProgress: fraction }),
    );
    const sent = socketService.sendMessage(conversationId, {
      content: pending.content,
      type: pending.type,
      attachmentIds: uploaded.map((a) => a.id),
      replyToId,
      tempId: pending.id,
    });
    if (!sent) throw new Error('no socket');
    patchMessage(conversationId, pending.id, { uploadProgress: 1 });
  } catch (error) {
    console.error('Failed to send attachments:', error);
    patchMessage(conversationId, pending.id, { sending: false, failed: true });
    // Refused by the server (too large, wrong type): say why, since
    // retrying the same file can't succeed
    const refusal = uploadRefusal(error);
    // (after the preview sheet has finished closing)
    if (refusal) setTimeout(() => showAlert('تعذر إرسال المرفق', refusal), 500);
  }
}
