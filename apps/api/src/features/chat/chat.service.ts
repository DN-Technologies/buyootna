import { Injectable } from '@nestjs/common';

import { SendMessageDto } from './dto/send-message.dto';
import { ChatConversationsService } from './services/chat-conversations.service';
import { ChatMessagesService } from './services/chat-messages.service';

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

  // List all conversations for the user/identity
  getConversations(userId: string, page = 1, limit = 10) {
    return this.conversationsService.getConversations(userId, page, limit);
  }

  // Get messages for a single conversation
  getMessages(
    conversationId: string,
    userId: string,
    cursor?: string,
    limit = 20,
  ) {
    return this.messagesService.getMessages(
      conversationId,
      userId,
      cursor,
      limit,
    );
  }

  // Send a message
  sendMessage(senderId: string, conversationId: string, dto: SendMessageDto) {
    return this.messagesService.sendMessage(senderId, conversationId, dto);
  }

  // Mark conversation messages as read
  markAsRead(userId: string, conversationId: string) {
    return this.messagesService.markAsRead(userId, conversationId);
  }
}
