import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  async createConversation(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: CreateConversationDto,
  ) {
    return this.chatService.findOrCreateConversation(
      reqUser.userId,
      dto.recipientId,
      dto.propertyId,
    );
  }

  @Get('conversations')
  async getConversations(
    @CurrentUser() reqUser: RequestUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.chatService.getConversations(
      reqUser.userId,
      pageNum,
      limitNum,
    );
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') conversationId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.chatService.getMessages(
      conversationId,
      reqUser.userId,
      cursor,
      limitNum,
    );
  }

  @Post('conversations/:id/read')
  async markAsRead(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') conversationId: string,
  ) {
    return this.chatService.markAsRead(reqUser.userId, conversationId);
  }
}
