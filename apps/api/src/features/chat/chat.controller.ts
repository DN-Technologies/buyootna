import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { RespondProposalDto } from './dto/respond-proposal.dto';
import { ChatProposalsService } from './services/chat-proposals.service';
import { ChatReceiptsService } from './services/chat-receipts.service';
import {
  MAX_ATTACHMENTS,
  VIDEO_MAX_BYTES,
} from './services/chat-attachments.service';

// `durations` form field: a JSON array of numbers (or nulls); anything else
// is ignored
function parseDurations(raw?: string): (number | null)[] | undefined {
  if (!raw) return undefined;
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((v) => (typeof v === 'number' ? v : null))
      : undefined;
  } catch {
    return undefined;
  }
}
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
  constructor(
    private readonly chatService: ChatService,
    private readonly proposals: ChatProposalsService,
    private readonly gateway: ChatGateway,
    private readonly receipts: ChatReceiptsService,
  ) {}

  @Post('conversations')
  @ApiOperation({
    summary:
      'Find or create a conversation with a recipient, optionally scoped to a property',
  })
  @ApiResponse({
    status: 201,
    schema: { type: 'object', additionalProperties: true },
  })
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
      dto.requestId,
    );
  }

  @Get('conversations')
  @ApiOperation({ summary: "List the current user's conversations, paginated" })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'q',
    required: false,
    description: "Search: the other person's name, the ad title, message text",
  })
  @ApiResponse({ status: 200, type: ConversationListResponseDto })
  @ApiCommonErrors()
  async getConversations(
    @CurrentUser() reqUser: RequestUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    // Loading the chats list means the app has what was sent to it
    if (pageNum === 1 && !q)
      void this.gateway.deliverWaiting(reqUser.identityId);
    return this.chatService.getConversations(
      reqUser.identityId,
      pageNum,
      limitNum,
      q,
    );
  }

  @Post('conversations/:id/attachments')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'files', maxCount: MAX_ATTACHMENTS },
        // A still for each video, in the videos' order
        { name: 'thumbnails', maxCount: MAX_ATTACHMENTS },
      ],
      // Per-kind limits are checked in ChatAttachmentsService
      { limits: { fileSize: VIDEO_MAX_BYTES } },
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Upload up to 10 photos / videos / documents (pdf, Word, Excel), or one voice note, to send in this chat; `thumbnails` = a still per video, `durations` = JSON array of lengths in ms; returns attachment ids',
  })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiCommonErrors()
  async uploadAttachments(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') conversationId: string,
    @UploadedFiles()
    uploaded: {
      files?: Express.Multer.File[];
      thumbnails?: Express.Multer.File[];
    },
    @Body('durations') durations?: string,
  ) {
    return this.chatService.uploadAttachments(
      reqUser.identityId,
      conversationId,
      uploaded?.files ?? [],
      {
        thumbnails: uploaded?.thumbnails,
        durations: parseDurations(durations),
      },
    );
  }

  @Get('attachments/:id/url')
  @ApiOperation({
    summary:
      "A fresh short-lived link to a chat file (the conversation's personas only)",
  })
  @ApiParam({ name: 'id', description: 'Attachment ID' })
  @ApiCommonErrors()
  async attachmentUrl(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') attachmentId: string,
  ) {
    return this.chatService.attachmentUrl(reqUser.identityId, attachmentId);
  }

  @Get('conversations/:id/messages/search')
  @ApiOperation({
    summary: 'Search messages in one conversation (newest first)',
  })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiCommonErrors()
  async searchMessages(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') conversationId: string,
    @Query('q') q: string,
    @Query('page') page?: string,
  ) {
    return this.chatService.searchMessages(
      reqUser.identityId,
      conversationId,
      q,
      page ? parseInt(page, 10) : 1,
    );
  }

  @Get('conversations/:id/messages')
  @ApiOperation({
    summary: 'Get messages for a single conversation, cursor-paginated',
  })
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
      reqUser.identityId,
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
    // Read (and so delivered) up to now: the sender's ticks turn gold
    const receipt = await this.receipts.markRead(
      reqUser.identityId,
      conversationId,
    );
    if (receipt) this.gateway.emitReceipt(receipt);
    return { success: true };
  }

  @Post('messages/:id/hide')
  @ApiOperation({
    summary: "Delete a message on the current persona's side only (حذف لدي)",
  })
  @ApiParam({ name: 'id', description: 'Message ID' })
  @ApiResponse({ status: 201, type: ChatSuccessResponseDto })
  @ApiCommonErrors()
  async hideMessage(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') messageId: string,
  ) {
    return this.chatService.hideMessage(reqUser.identityId, messageId);
  }

  @Post('proposals/:id/respond')
  @ApiOperation({
    summary:
      'Answer a viewing appointment / price offer: accept or decline (the other side), cancel (the sender); pending only',
  })
  @ApiParam({ name: 'id', description: 'Proposal ID' })
  @ApiCommonErrors()
  async respondToProposal(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') proposalId: string,
    @Body() dto: RespondProposalDto,
  ) {
    const result = await this.proposals.respond(
      reqUser.identityId,
      proposalId,
      dto.action,
    );
    this.gateway.emitMessageUpdated(result.conversationId, {
      messageId: result.messageId,
      proposal: result.proposal,
    });
    return result;
  }
}
