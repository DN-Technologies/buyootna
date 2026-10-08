import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PushModule } from '../../core/push/push.module';
import { ChatPushService } from './services/chat-push.service';
import { ChatAttachmentsService } from './services/chat-attachments.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatConversationsService } from './services/chat-conversations.service';
import { ChatMessagesService } from './services/chat-messages.service';
import { ChatParticipantDisplayService } from './services/chat-participant-display.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-fallback-key',
    }),
    PushModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatParticipantDisplayService,
    ChatPushService,
    ChatAttachmentsService,
    ChatConversationsService,
    ChatMessagesService,
    ChatService,
    ChatGateway,
  ],
})
export class ChatModule {}
