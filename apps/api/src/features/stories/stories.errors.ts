import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

// Video refusals the author can act on; anything else gets the generic text
const VIDEO_REFUSALS: Record<string, string> = {
  too_long: 'مدة الفيديو تتجاوز 30 ثانية',
  too_large: 'دقة الفيديو أعلى من المسموح (1920 بكسل)',
  video_codec: 'صيغة الفيديو غير مدعومة (H.264 أو HEVC)',
  audio_codec: 'صيغة صوت الفيديو غير مدعومة',
  not_a_video: 'الملف المرفوع ليس فيديو صالحاً',
};

/** Missing, someone else's, or deleted: the same answer for all three. */
export const storyNotFound = () => new NotFoundException('القصة غير موجودة');

export const uploadExpired = () =>
  new GoneException({
    statusCode: 410,
    message: 'انتهت مهلة رفع القصة، يرجى المحاولة مرة أخرى',
    code: 'STORY_UPLOAD_EXPIRED',
  });

/** Not uploaded yet: the story stays pending and the app may retry. */
export const uploadIncomplete = (mediaType: 'IMAGE' | 'VIDEO') =>
  new ConflictException({
    statusCode: 409,
    message:
      mediaType === 'VIDEO'
        ? 'لم يكتمل رفع الفيديو بعد'
        : 'لم يكتمل رفع الصورة بعد',
    code: 'STORY_UPLOAD_INCOMPLETE',
  });

export const storyStateChanged = () =>
  new ConflictException({
    statusCode: 409,
    message: 'تغيرت حالة القصة، يرجى المحاولة مرة أخرى',
    code: 'STORY_STATE_CHANGED',
  });

/** The uploaded file was refused; a video says why when it can. */
export function invalidMedia(
  reason: string | null,
  mediaType: 'IMAGE' | 'VIDEO' = 'IMAGE',
): UnprocessableEntityException {
  return new UnprocessableEntityException({
    statusCode: 422,
    message:
      mediaType === 'VIDEO'
        ? (VIDEO_REFUSALS[reason ?? ''] ??
          'الفيديو المرفوع غير صالح، يرجى اختيار فيديو آخر')
        : 'الملف المرفوع غير صالح، يرجى اختيار صورة أخرى',
    code: 'STORY_MEDIA_INVALID',
    reason,
  });
}

export const publisherOnly = () =>
  new ForbiddenException({
    statusCode: 403,
    message: 'نشر القصص متاح للشركات والمكاتب فقط',
    code: 'STORY_PUBLISHER_ONLY',
  });

export const storyLimitReached = () =>
  new HttpException(
    {
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      message: 'وصلت للحد الأقصى من القصص، حاول لاحقاً',
      code: 'STORY_LIMIT',
    },
    HttpStatus.TOO_MANY_REQUESTS,
  );

export const propertyNotOwn = () =>
  new BadRequestException({
    statusCode: 400,
    message: 'يمكن ربط القصة بإعلاناتك النشطة فقط',
    code: 'STORY_PROPERTY_INVALID',
  });

/** Missing or someone else's: the same answer for both. */
export const highlightNotFound = () =>
  new NotFoundException('المميزة غير موجودة');

export const highlightLimitReached = () =>
  new BadRequestException({
    statusCode: 400,
    message: 'وصلت للحد الأقصى من المميزة',
    code: 'STORY_HIGHLIGHT_LIMIT',
  });

/** A story that isn't the author's own, or no longer in its archive. */
export const highlightStoriesInvalid = () =>
  new BadRequestException({
    statusCode: 400,
    message: 'بعض القصص المختارة لم تعد متاحة',
    code: 'STORY_HIGHLIGHT_STORIES_INVALID',
  });

export const highlightOrderInvalid = () =>
  new BadRequestException({
    statusCode: 400,
    message: 'تغيرت المميزة، يرجى المحاولة مرة أخرى',
    code: 'STORY_HIGHLIGHT_ORDER_INVALID',
  });
