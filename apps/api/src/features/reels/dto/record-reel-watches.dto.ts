import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import { REEL_VIDEO_MAX_MS, REEL_VIEWS_BATCH_MAX } from '../reels.constants';

export class ReelWatchDto {
  @ApiProperty()
  @IsUUID()
  reelId: string;

  @ApiProperty({ description: 'The most it played in one go' })
  @IsInt()
  @Min(0)
  @Max(REEL_VIDEO_MAX_MS)
  watchedMs: number;

  @ApiProperty({ description: 'Whether it played to the end' })
  @IsBoolean()
  completed: boolean;
}

/** How much of each reel the viewer watched, sent as it moves on. */
export class RecordReelWatchesDto {
  @ApiProperty({ type: [ReelWatchDto], maxItems: REEL_VIEWS_BATCH_MAX })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(REEL_VIEWS_BATCH_MAX)
  @ValidateNested({ each: true })
  @Type(() => ReelWatchDto)
  watches: ReelWatchDto[];
}
