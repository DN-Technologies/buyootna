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
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import {
  ChatSuccessResponseDto,
  ConversationListResponseDto,
  MessageListResponseDto,
} from './dto/chat-response.dto';

@ApiTags('Chat')
@ApiAuth()
@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Find or create a conversation with a recipient, optionally scoped to a property' })
  @ApiResponse({ status: 201, schema: { type: 'object', additionalProperties: true } })
  @ApiCommonErrors()
  async createConversation(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: CreateConversationDto,
  ) {
    return this.chatService.findOrCreateConversation(
      reqUser.userId,
      reqUser.identityId,
      dto.recipientId,
      dto.propertyId,
    );
  }

  @Get('conversations')
  @ApiOperation({ summary: "List the current user's conversations, paginated" })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, type: ConversationListResponseDto })
  @ApiCommonErrors()
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
  @ApiOperation({ summary: 'Get messages for a single conversation, cursor-paginated' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, type: MessageListResponseDto })
  @ApiCommonErrors()
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
  @ApiOperation({ summary: 'Mark a conversation as read for the current user' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({ status: 201, type: ChatSuccessResponseDto })
  @ApiCommonErrors()
  async markAsRead(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') conversationId: string,
  ) {
    return this.chatService.markAsRead(reqUser.userId, conversationId);
  }
}
