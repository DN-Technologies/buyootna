import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  STORY_HIGHLIGHT_ITEMS_MAX,
  STORY_HIGHLIGHT_TITLE_MAX,
  STORY_HIGHLIGHTS_MAX,
} from '../stories.constants';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const TITLE_MESSAGE = `اسم المميزة من 1 إلى ${STORY_HIGHLIGHT_TITLE_MAX} حرفاً`;

export class CreateStoryHighlightDto {
  @ApiProperty({ minLength: 1, maxLength: STORY_HIGHLIGHT_TITLE_MAX })
  @Transform(trim)
  @IsString()
  @MinLength(1, { message: TITLE_MESSAGE })
  @MaxLength(STORY_HIGHLIGHT_TITLE_MAX, { message: TITLE_MESSAGE })
  title: string;

  @ApiProperty({
    type: [String],
    description:
      "Its stories in order: the author's own, published in the last 30 days (or already in one of its highlights)",
    maxItems: STORY_HIGHLIGHT_ITEMS_MAX,
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'اختر قصة واحدة على الأقل' })
  @ArrayMaxSize(STORY_HIGHLIGHT_ITEMS_MAX)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  storyIds: string[];
}

export class UpdateStoryHighlightDto {
  @ApiPropertyOptional({ minLength: 1, maxLength: STORY_HIGHLIGHT_TITLE_MAX })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(1, { message: TITLE_MESSAGE })
  @MaxLength(STORY_HIGHLIGHT_TITLE_MAX, { message: TITLE_MESSAGE })
  title?: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'One of its stories; null: its first',
  })
  @IsOptional()
  @IsUUID()
  coverStoryId?: string | null;

  @ApiPropertyOptional({
    type: [String],
    description: 'Replaces its stories and their order',
    maxItems: STORY_HIGHLIGHT_ITEMS_MAX,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'اختر قصة واحدة على الأقل' })
  @ArrayMaxSize(STORY_HIGHLIGHT_ITEMS_MAX)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  storyIds?: string[];
}

export class ReorderStoryHighlightsDto {
  @ApiProperty({
    type: [String],
    description: "Every one of the author's highlights, in their new order",
    maxItems: STORY_HIGHLIGHTS_MAX,
  })
  @IsArray()
  @ArrayMaxSize(STORY_HIGHLIGHTS_MAX)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  ids: string[];
}

export class StoryArchiveQueryDto {
  @ApiPropertyOptional({ description: 'nextCursor from the previous page' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  cursor?: string;
}
