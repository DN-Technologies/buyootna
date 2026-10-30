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

// Refusals the author can act on; anything else gets the generic text
const VIDEO_REFUSALS: Record<string, string> = {
  too_long: 'مدة الفيديو تتجاوز 60 ثانية',
  too_large: 'دقة الفيديو أعلى من المسموح (1920 بكسل)',
  video_codec: 'صيغة الفيديو غير مدعومة (H.264)',
  audio_codec: 'صيغة صوت الفيديو غير مدعومة',
  not_a_video: 'الملف المرفوع ليس فيديو صالحاً',
  bitrate_too_high: 'جودة الفيديو أعلى من المسموح، يرجى اختيار فيديو آخر',
};

/** Missing, someone else's, or deleted: the same answer for all three. */
export const reelNotFound = () => new NotFoundException('الفيديو غير موجود');

export const uploadExpired = () =>
  new GoneException({
    statusCode: 410,
    message: 'انتهت مهلة رفع الفيديو، يرجى المحاولة مرة أخرى',
    code: 'REEL_UPLOAD_EXPIRED',
  });

/** Not uploaded yet: the reel stays pending and the app may retry. */
export const uploadIncomplete = () =>
  new ConflictException({
    statusCode: 409,
    message: 'لم يكتمل رفع الفيديو بعد',
    code: 'REEL_UPLOAD_INCOMPLETE',
  });

export const reelStateChanged = () =>
  new ConflictException({
    statusCode: 409,
    message: 'تغيرت حالة الفيديو، يرجى المحاولة مرة أخرى',
    code: 'REEL_STATE_CHANGED',
  });

/** The uploaded file was refused; says why when the author can act on it. */
export const invalidMedia = (reason: string | null) =>
  new UnprocessableEntityException({
    statusCode: 422,
    message:
      VIDEO_REFUSALS[reason ?? ''] ??
      'الفيديو المرفوع غير صالح، يرجى اختيار فيديو آخر',
    code: 'REEL_MEDIA_INVALID',
    reason,
  });

export const publisherOnly = () =>
  new ForbiddenException({
    statusCode: 403,
    message: 'نشر الفيديوهات متاح للشركات والمكاتب فقط',
    code: 'REEL_PUBLISHER_ONLY',
  });

export const reelLimitReached = () =>
  new HttpException(
    {
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      message: 'وصلت للحد الأقصى من الفيديوهات اليوم، حاول لاحقاً',
      code: 'REEL_LIMIT',
    },
    HttpStatus.TOO_MANY_REQUESTS,
  );

export const propertyNotOwn = () =>
  new BadRequestException({
    statusCode: 400,
    message: 'يمكن ربط الفيديو بإعلاناتك النشطة فقط',
    code: 'REEL_PROPERTY_INVALID',
  });
