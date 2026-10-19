import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateRequestOfferDto {
  @ApiPropertyOptional({
    description:
      'The reply shown to the requester (رسالة الى العميل). Optional, but a reply needs a message or notes.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  @ApiPropertyOptional({
    description: 'العرض لا يشمل: what the offer leaves out',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  excludes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ description: 'What the company asks for (د.ك)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}
