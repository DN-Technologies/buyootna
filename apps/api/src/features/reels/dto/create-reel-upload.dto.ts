import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  Equals,
  IsDefined,
  IsInt,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import { StoryPosterUploadDto } from '../../stories/dto/create-story-upload.dto';
import { REEL_VIDEO_MAX_BYTES, REEL_VIDEO_TYPE } from '../reels.constants';

/**
 * Asks for an upload slot: a video (≤ 60 s, as the phone's trimmer exports
 * it) with its JPEG poster. What is declared here is signed into the uploads
 * and checked again on publish.
 */
export class CreateReelUploadDto {
  @ApiProperty({ enum: [REEL_VIDEO_TYPE] })
  @Equals(REEL_VIDEO_TYPE, { message: 'نوع الفيديو غير مدعوم (MP4)' })
  contentType: typeof REEL_VIDEO_TYPE;

  @ApiProperty({
    description: 'Exact file size in bytes',
    maximum: REEL_VIDEO_MAX_BYTES,
  })
  @IsInt()
  @Min(1)
  @Max(REEL_VIDEO_MAX_BYTES, { message: 'حجم الفيديو يتجاوز 50 ميجابايت' })
  sizeBytes: number;

  @ApiProperty({ type: StoryPosterUploadDto })
  @IsDefined({ message: 'صورة الغلاف مطلوبة للفيديو' })
  @ValidateNested()
  @Type(() => StoryPosterUploadDto)
  poster: StoryPosterUploadDto;
}
