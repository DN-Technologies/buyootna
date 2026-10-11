import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsNotEmpty()
  @IsString()
  recipientId: string;

  @IsOptional()
  @IsString()
  propertyId?: string;

  // The quote request the chat is about (one of the two personas is its
  // requester); it takes the place of an ad
  @IsOptional()
  @IsString()
  requestId?: string;
}
