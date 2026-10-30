import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsUUID,
} from 'class-validator';

import { REEL_VIEWS_BATCH_MAX } from '../reels.constants';

/** Reels the viewer watched, sent in batches by the app. */
export class RecordReelViewsDto {
  @ApiProperty({ type: [String], maxItems: REEL_VIEWS_BATCH_MAX })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(REEL_VIEWS_BATCH_MAX)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  reelIds: string[];
}
