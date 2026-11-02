import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

import { STORY_RINGS_MAX_IDS } from '../stories.constants';

export class StoryRingsQueryDto {
  @ApiProperty({
    type: String,
    description: `Company or office profile ids, comma-separated (${STORY_RINGS_MAX_IDS} at most)`,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.split(',').filter(Boolean) : value,
  )
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(STORY_RINGS_MAX_IDS)
  @IsUUID('all', { each: true })
  ids: string[];
}
