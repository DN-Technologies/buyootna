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

import { REEL_PAGE_DEFAULT, REEL_PAGE_MAX } from '../reels.constants';

/** One page of a reels list: the feed, an author's reels, or the author's own. */
export class ReelListQueryDto {
  @ApiPropertyOptional({ description: 'nextCursor from the previous page' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  cursor?: string;

  @ApiPropertyOptional({
    default: REEL_PAGE_DEFAULT,
    maximum: REEL_PAGE_MAX,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(REEL_PAGE_MAX)
  limit?: number;
}
