import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { MessageType, OfferPeriod } from '@prisma/client';

// APPOINTMENT: scheduledAt; OFFER: amount (+ period). The socket path is
// checked again in ChatProposalsService.parse.
export class ProposalInputDto {
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsEnum(OfferPeriod)
  period?: OfferPeriod;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  // Answering this proposal (counter-offer / another time)
  @IsOptional()
  @IsString()
  counterOfId?: string;
}

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

  // Uploaded photos / documents to send with it (POST .../attachments)
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  attachmentIds?: string[];

  // LOCATION: the pin and its address
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  locationLabel?: string;

  // APPOINTMENT / OFFER
  @IsOptional()
  @ValidateNested()
  @Type(() => ProposalInputDto)
  proposal?: ProposalInputDto;
}
