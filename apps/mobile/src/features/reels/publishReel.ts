import type { reelsService as ReelsService } from '@/shared/api/reels.service';

import { uploadThenPublish } from '../stories/uploadThenPublish';
import type { AuthorReel, ReelUploadSlot } from './types';

/** A video exported by the trimmer, with the poster made from it. */
export interface ReelMedia {
  uri: string;
  sizeBytes: number;
  poster: { uri: string; sizeBytes: number };
}

type Service = Pick<
  typeof ReelsService,
  'createUpload' | 'uploadToSlot' | 'publish'
>;

/** The upload to S3 failed even after retrying. */
export class ReelUploadError extends Error {
  constructor(readonly status: number) {
    super(`upload failed (${status})`);
  }
}

/** Posts a reel, the same way a story is posted (uploadThenPublish). */
export function publishReel(
  service: Service,
  media: ReelMedia,
  details: { caption?: string; propertyId?: string },
  onProgress?: (fraction: number) => void,
  now: () => number = Date.now,
): Promise<AuthorReel> {
  const body = {
    ...(details.caption?.trim() ? { caption: details.caption.trim() } : {}),
    ...(details.propertyId ? { propertyId: details.propertyId } : {}),
  };
  return uploadThenPublish<ReelUploadSlot, AuthorReel>({
    createSlot: () =>
      service.createUpload({
        contentType: 'video/mp4',
        sizeBytes: media.sizeBytes,
        poster: { contentType: 'image/jpeg', sizeBytes: media.poster.sizeBytes },
      }),
    put: service.uploadToSlot,
    mediaUri: media.uri,
    posterUri: media.poster.uri,
    publish: (slot) => service.publish(slot.reelId, body),
    incompleteCode: 'REEL_UPLOAD_INCOMPLETE',
    uploadError: (status) => new ReelUploadError(status),
    onProgress,
    now,
  });
}

const errorData = (error: unknown) =>
  (error as { response?: { data?: { code?: string; message?: unknown } } })
    ?.response?.data;

/** What to tell the author when posting failed. */
export function reelPublishErrorMessage(error: unknown): string {
  if (error instanceof ReelUploadError) {
    return 'تعذر رفع الفيديو، تحقق من الاتصال وحاول مرة أخرى';
  }
  const data = errorData(error);
  const message = typeof data?.message === 'string' ? data.message : null;
  switch (data?.code) {
    case 'REEL_LIMIT':
      return 'وصلت للحد الأقصى من الفيديوهات اليوم، حاول لاحقاً';
    case 'REEL_PUBLISHER_ONLY':
      return 'نشر الفيديوهات متاح للشركات والمكاتب فقط';
    case 'REEL_UPLOAD_EXPIRED':
      return 'انتهت مهلة الرفع، حاول مرة أخرى';
    case 'REEL_PROPERTY_INVALID':
      return 'يمكن ربط الفيديو بإعلاناتك النشطة فقط';
    default:
      // The server says why a file was refused (e.g. longer than 60 s)
      return message ?? 'تعذر نشر الفيديو، حاول مرة أخرى';
  }
}
