import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import {
  STORY_VIEWERS_DEFAULT_LIMIT,
  STORY_VIEWERS_MAX_LIMIT,
} from '../stories.constants';

export class StoryViewersQueryDto {
  @ApiPropertyOptional({ description: 'nextCursor from the previous page' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  cursor?: string;

  @ApiPropertyOptional({
    default: STORY_VIEWERS_DEFAULT_LIMIT,
    maximum: STORY_VIEWERS_MAX_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(STORY_VIEWERS_MAX_LIMIT)
  limit?: number;
}
