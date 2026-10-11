import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateRequestOfferDto {
  @ApiProperty({ description: 'The reply shown to the requester' })
  @IsString()
  @MaxLength(2000)
  message: string;

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
