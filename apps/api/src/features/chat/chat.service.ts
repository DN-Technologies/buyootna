import { Injectable } from '@nestjs/common';

import { SendMessageDto } from './dto/send-message.dto';
import { ChatConversationsService } from './services/chat-conversations.service';
import { ChatMessagesService } from './services/chat-messages.service';
import { ChatAttachmentsService } from './services/chat-attachments.service';

/**
 * Public facade over the chat feature. The real logic lives in the
 * focused sub-services under ./services/ (same structure as the
 * properties feature): conversations lifecycle/listing, and messages.
 * The controller and gateway keep injecting this class, so the module's
 * public API is unchanged by the split.
 */
@Injectable()
export class ChatService {
  constructor(
    private readonly attachmentsService: ChatAttachmentsService,
    private readonly conversationsService: ChatConversationsService,
    private readonly messagesService: ChatMessagesService,
  ) {}

  // Find or create a 1:1 conversation with a recipient, optionally scoped
  // to a property (concurrency-safe: see ChatConversationsService).
  findOrCreateConversation(
    userId: string,
    identityId: string,
    recipientId: string,
    propertyId?: string,
  ) {
    return this.conversationsService.findOrCreateConversation(
      userId,
      identityId,
      recipientId,
      propertyId,
    );
  }

  // The persona's conversations
  getConversations(identityId: string, page = 1, limit = 10, query?: string) {
    return this.conversationsService.getConversations(
      identityId,
      page,
      limit,
      query,
    );
  }

  // Get messages for a single conversation
  getMessages(
    conversationId: string,
    identityId: string,
    cursor?: string,
    limit = 20,
  ) {
    return this.messagesService.getMessages(
      conversationId,
      identityId,
      cursor,
      limit,
    );
  }

  // Send a message
  sendMessage(
    sender: { userId: string; identityId: string },
    conversationId: string,
    dto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(sender, conversationId, dto);
  }

  // Whether this persona takes part in the conversation
  async isParticipant(identityId: string, conversationId: string) {
    return this.messagesService.isParticipant(identityId, conversationId);
  }

  // Mark conversation messages as read
  uploadAttachments(
    identityId: string,
    conversationId: string,
    files: Express.Multer.File[],
  ) {
    return this.attachmentsService.upload(identityId, conversationId, files);
  }

  attachmentUrl(identityId: string, attachmentId: string) {
    return this.attachmentsService.urlFor(identityId, attachmentId);
  }

  searchMessages(
    identityId: string,
    conversationId: string,
    query: string,
    page?: number,
  ) {
    return this.messagesService.searchMessages(
      identityId,
      conversationId,
      query,
      page,
    );
  }

  hideMessage(identityId: string, messageId: string) {
    return this.messagesService.hideMessage(identityId, messageId);
  }

  markAsRead(identityId: string, conversationId: string) {
    return this.messagesService.markAsRead(identityId, conversationId);
  }
}
