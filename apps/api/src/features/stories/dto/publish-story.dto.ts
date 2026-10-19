import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

import { STORY_CAPTION_MAX } from '../stories.constants';

export class PublishStoryDto {
  @ApiPropertyOptional({ maxLength: STORY_CAPTION_MAX })
  @IsOptional()
  @IsString()
  @MaxLength(STORY_CAPTION_MAX, { message: 'الوصف لا يتجاوز 200 حرف' })
  caption?: string;

  @ApiPropertyOptional({
    description: "One of the author's own active listings",
  })
  @IsOptional()
  @IsUUID()
  propertyId?: string;
}
