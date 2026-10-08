import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MessageType } from '@prisma/client';

export class SendMessageDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  propertyId?: string;

  // Replying to this message (must be in the same conversation)
  @IsOptional()
  @IsString()
  replyToId?: string;
}
