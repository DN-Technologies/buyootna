import { Injectable } from '@nestjs/common';

import { PresenceService } from '../../core/trust-signals/presence.service';

import { SendMessageDto } from './dto/send-message.dto';
import { ChatConversationsService } from './services/chat-conversations.service';
import { ChatMessagesService } from './services/chat-messages.service';
import {
  ChatAttachmentsService,
  UploadExtras,
} from './services/chat-attachments.service';

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
    private readonly presence: PresenceService,
  ) {}

  // "متصل": whether the other person's app is open right now
  private withPresence<
    T extends { id: string; lastSeenAt: Date | null; isAvailable?: boolean },
  >(otherUser: T | null) {
    if (!otherUser) return otherUser;
    // A deleted, suspended or blocked account is never shown as online
    if (otherUser.isAvailable === false) {
      return { ...otherUser, isOnline: false, lastSeenAt: null };
    }
    return {
      ...otherUser,
      ...this.presence.presenceOf(otherUser.id, otherUser.lastSeenAt),
    };
  }

  // Find or create a 1:1 conversation with a recipient, optionally scoped
  // to a property (concurrency-safe: see ChatConversationsService).
  findOrCreateConversation(
    userId: string,
    identityId: string,
    recipientId: string,
    propertyId?: string,
    requestId?: string,
  ) {
    return this.conversationsService.findOrCreateConversation(
      userId,
      identityId,
      recipientId,
      propertyId,
      requestId,
    );
  }

  // The persona's conversations
  async getConversations(
    identityId: string,
    page = 1,
    limit = 10,
    query?: string,
  ) {
    const result = await this.conversationsService.getConversations(
      identityId,
      page,
      limit,
      query,
    );
    return {
      ...result,
      data: result.data.map((conversation) => ({
        ...conversation,
        otherUser: this.withPresence(conversation.otherUser),
      })),
    };
  }

  // Get messages for a single conversation
  async getMessages(
    conversationId: string,
    identityId: string,
    cursor?: string,
    limit = 20,
  ) {
    const result = await this.messagesService.getMessages(
      conversationId,
      identityId,
      cursor,
      limit,
    );
    return {
      ...result,
      meta: {
        ...result.meta,
        otherUser: this.withPresence(result.meta.otherUser),
      },
    };
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
    extras?: UploadExtras,
  ) {
    return this.attachmentsService.upload(
      identityId,
      conversationId,
      files,
      extras,
    );
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
