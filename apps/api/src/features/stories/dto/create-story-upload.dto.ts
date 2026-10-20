import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  Equals,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
  Validate,
  ValidateNested,
  type ValidationArguments,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

import {
  STORY_IMAGE_MAX_BYTES,
  STORY_IMAGE_TYPE_LIST,
  STORY_POSTER_MAX_BYTES,
  STORY_POSTER_TYPE,
  STORY_VIDEO_MAX_BYTES,
  STORY_VIDEO_TYPE_LIST,
  type StoryMediaContentType,
} from '../stories.constants';

type UploadShape = {
  mediaType?: unknown;
  contentType?: unknown;
  sizeBytes?: unknown;
  poster?: unknown;
};
const isVideo = (args: ValidationArguments) =>
  (args.object as UploadShape).mediaType === 'VIDEO';

/** The type must be one the chosen media type accepts. */
@ValidatorConstraint({ name: 'storyContentType' })
class StoryContentType implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    const list: readonly string[] = isVideo(args)
      ? STORY_VIDEO_TYPE_LIST
      : STORY_IMAGE_TYPE_LIST;
    return typeof value === 'string' && list.includes(value);
  }
  defaultMessage(args: ValidationArguments) {
    return isVideo(args)
      ? 'نوع الفيديو غير مدعوم (MP4 أو MOV)'
      : 'نوع الصورة غير مدعوم (JPEG أو PNG أو WebP)';
  }
}

/** Photos up to 10 MB, videos up to 50 MB. */
@ValidatorConstraint({ name: 'storyMediaSize' })
class StoryMediaSize implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    const max = isVideo(args) ? STORY_VIDEO_MAX_BYTES : STORY_IMAGE_MAX_BYTES;
    return typeof value === 'number' && value <= max;
  }
  defaultMessage(args: ValidationArguments) {
    return isVideo(args)
      ? 'حجم الفيديو يتجاوز 50 ميجابايت'
      : 'حجم الصورة يتجاوز 10 ميجابايت';
  }
}

/** A video needs its poster; a photo has none. */
@ValidatorConstraint({ name: 'storyPosterPresence' })
class StoryPosterPresence implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments) {
    const hasPoster = (args.object as UploadShape).poster !== undefined;
    return isVideo(args) ? hasPoster : !hasPoster;
  }
  defaultMessage(args: ValidationArguments) {
    return isVideo(args)
      ? 'صورة الغلاف مطلوبة للفيديو'
      : 'صورة الغلاف للفيديو فقط';
  }
}

export class StoryPosterUploadDto {
  @ApiProperty({ enum: [STORY_POSTER_TYPE] })
  @Equals(STORY_POSTER_TYPE, { message: 'صورة الغلاف يجب أن تكون JPEG' })
  contentType: typeof STORY_POSTER_TYPE;

  @ApiProperty({
    description: 'Exact file size in bytes',
    maximum: STORY_POSTER_MAX_BYTES,
  })
  @IsInt()
  @Min(1)
  @Max(STORY_POSTER_MAX_BYTES, {
    message: 'حجم صورة الغلاف يتجاوز 1 ميجابايت',
  })
  sizeBytes: number;
}

/**
 * Asks for an upload slot: a photo, or a video (≤ 30 s) with its JPEG
 * poster. What is declared here is signed into the uploads and checked
 * again on publish.
 */
export class CreateStoryUploadDto {
  @ApiProperty({ enum: ['IMAGE', 'VIDEO'] })
  @IsIn(['IMAGE', 'VIDEO'], { message: 'نوع القصة غير مدعوم' })
  @Validate(StoryPosterPresence)
  mediaType: 'IMAGE' | 'VIDEO';

  @ApiProperty({ enum: [...STORY_IMAGE_TYPE_LIST, ...STORY_VIDEO_TYPE_LIST] })
  @Validate(StoryContentType)
  contentType: StoryMediaContentType;

  @ApiProperty({
    description: 'Exact file size in bytes (photo ≤ 10 MB, video ≤ 50 MB)',
    maximum: STORY_VIDEO_MAX_BYTES,
  })
  @IsInt()
  @Min(1)
  @Validate(StoryMediaSize)
  sizeBytes: number;

  @ApiPropertyOptional({
    type: StoryPosterUploadDto,
    description: 'Video only, and required for it',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => StoryPosterUploadDto)
  poster?: StoryPosterUploadDto;
}
