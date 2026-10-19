import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsUUID,
} from 'class-validator';

import { STORY_VIEWS_BATCH_MAX } from '../stories.constants';

/** Stories the viewer watched, sent in batches by the app. */
export class RecordStoryViewsDto {
  @ApiProperty({ type: [String], maxItems: STORY_VIEWS_BATCH_MAX })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(STORY_VIEWS_BATCH_MAX)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  storyIds: string[];
}
