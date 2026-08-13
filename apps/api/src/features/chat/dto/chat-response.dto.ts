import { ApiProperty } from '@nestjs/swagger';

/**
 * Chat conversation/message shapes are deeply nested (participants, last
 * message, property preview, sender info) and formatted per-item by the
 * service. Documented as objects rather than exhaustively modeled field by
 * field.
 */
class ChatListMetaDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  hasNextPage: boolean;
}

export class ConversationListResponseDto {
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  data: Record<string, unknown>[];

  @ApiProperty({ type: ChatListMetaDto })
  meta: ChatListMetaDto;
}

export class MessageListResponseDto {
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  data: Record<string, unknown>[];

  @ApiProperty({ type: 'object', additionalProperties: true })
  meta: Record<string, unknown>;
}

export class ChatSuccessResponseDto {
  @ApiProperty()
  success: boolean;
}
