import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
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
  ],
  controllers: [ChatController],
  providers: [
    ChatParticipantDisplayService,
    ChatConversationsService,
    ChatMessagesService,
    ChatService,
    ChatGateway,
  ],
})
export class ChatModule {}
