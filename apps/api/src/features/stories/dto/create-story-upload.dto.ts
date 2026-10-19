import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, Max, Min } from 'class-validator';

import {
  STORY_IMAGE_MAX_BYTES,
  STORY_IMAGE_TYPE_LIST,
  type StoryImageType,
} from '../stories.constants';

/**
 * Asks for an upload slot. Photos only for now (video comes later). What is
 * declared here is signed into the upload and checked again on publish.
 */
export class CreateStoryUploadDto {
  @ApiProperty({ enum: ['IMAGE'] })
  @IsIn(['IMAGE'], { message: 'القصص تدعم الصور فقط حالياً' })
  mediaType: 'IMAGE';

  @ApiProperty({ enum: STORY_IMAGE_TYPE_LIST })
  @IsIn(STORY_IMAGE_TYPE_LIST, {
    message: 'نوع الصورة غير مدعوم (JPEG أو PNG أو WebP)',
  })
  contentType: StoryImageType;

  @ApiProperty({
    description: 'Exact file size in bytes',
    maximum: STORY_IMAGE_MAX_BYTES,
  })
  @IsInt()
  @Min(1)
  @Max(STORY_IMAGE_MAX_BYTES, { message: 'حجم الصورة يتجاوز 10 ميجابايت' })
  sizeBytes: number;
}
