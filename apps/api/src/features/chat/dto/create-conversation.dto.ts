import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsNotEmpty()
  @IsString()
  recipientId: string;

  @IsOptional()
  @IsString()
  propertyId?: string;
}
