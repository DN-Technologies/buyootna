import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

import { REEL_CAPTION_MAX } from '../reels.constants';

export class PublishReelDto {
  @ApiPropertyOptional({ maxLength: REEL_CAPTION_MAX })
  @IsOptional()
  @IsString()
  @MaxLength(REEL_CAPTION_MAX, { message: 'الوصف لا يتجاوز 200 حرف' })
  caption?: string;

  @ApiPropertyOptional({
    description: "One of the author's own active listings",
  })
  @IsOptional()
  @IsUUID()
  propertyId?: string;
}
