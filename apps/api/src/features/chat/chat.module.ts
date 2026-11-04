import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PushModule } from '../../core/push/push.module';
import { StoriesModule } from '../stories/stories.module';
import { ChatPushService } from './services/chat-push.service';
import { ChatAttachmentsService } from './services/chat-attachments.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatConversationsService } from './services/chat-conversations.service';
import { ChatMessagesService } from './services/chat-messages.service';
import { ChatParticipantDisplayService } from './services/chat-participant-display.service';
import { ChatProposalsService } from './services/chat-proposals.service';
import { ChatReceiptsService } from './services/chat-receipts.service';
import { jwtSecret } from 'src/core/utils/jwt-secret';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtSecret(),
    }),
    PushModule,
    StoriesModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatParticipantDisplayService,
    ChatPushService,
    ChatAttachmentsService,
    ChatProposalsService,
    ChatReceiptsService,
    ChatConversationsService,
    ChatMessagesService,
    ChatService,
    ChatGateway,
  ],
})
export class ChatModule {}
