import type { storiesService as StoriesService } from '@/shared/api/stories.service';

import type {
  AuthorStory,
  StoryPhotoType,
  StoryUploadRequest,
  StoryUploadSlot,
  StoryVideoType,
} from './types';
import { uploadThenPublish } from './uploadThenPublish';

/** A picked photo, or a video with the poster made from it. */
export type StoryMedia =
  | { kind: 'IMAGE'; uri: string; type: StoryPhotoType; sizeBytes: number }
  | {
      kind: 'VIDEO';
      uri: string;
      type: StoryVideoType;
      sizeBytes: number;
      durationMs: number | null;
      poster: { uri: string; sizeBytes: number };
    };

type Service = Pick<
  typeof StoriesService,
  'createUpload' | 'uploadToSlot' | 'publish'
>;

/** The upload to S3 failed even after retrying. */
export class StoryUploadError extends Error {
  constructor(
    readonly status: number,
    readonly kind: 'IMAGE' | 'VIDEO' = 'IMAGE',
  ) {
    super(`upload failed (${status})`);
  }
}

const errorCode = (error: unknown) =>
  (error as { response?: { data?: { code?: string } } })?.response?.data?.code;

const uploadRequest = (media: StoryMedia): StoryUploadRequest =>
  media.kind === 'VIDEO'
    ? {
        mediaType: 'VIDEO',
        contentType: media.type,
        sizeBytes: media.sizeBytes,
        poster: { contentType: 'image/jpeg', sizeBytes: media.poster.sizeBytes },
      }
    : { mediaType: 'IMAGE', contentType: media.type, sizeBytes: media.sizeBytes };

/**
 * Posts a story, through uploadThenPublish: the files straight to S3 (a
 * video's poster first), then publish, with the same retries.
 */
export async function publishStory(
  service: Service,
  media: StoryMedia,
  details: { caption?: string; propertyId?: string },
  onProgress?: (fraction: number) => void,
  now: () => number = Date.now,
): Promise<AuthorStory> {
  const body = {
    ...(details.caption?.trim() ? { caption: details.caption.trim() } : {}),
    ...(details.propertyId ? { propertyId: details.propertyId } : {}),
  };
  const request = uploadRequest(media);
  return uploadThenPublish<StoryUploadSlot, AuthorStory>({
    createSlot: () => service.createUpload(request),
    put: service.uploadToSlot,
    mediaUri: media.uri,
    posterUri: media.kind === 'VIDEO' ? media.poster.uri : undefined,
    publish: (slot) => service.publish(slot.storyId, body),
    incompleteCode: 'STORY_UPLOAD_INCOMPLETE',
    uploadError: (status) => new StoryUploadError(status, media.kind),
    onProgress,
    now,
  });
}

const serverMessage = (error: unknown) => {
  const message = (error as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;
  return typeof message === 'string' ? message : null;
};

/** What to tell the author when posting failed. */
export function storyPublishErrorMessage(error: unknown): string {
  if (error instanceof StoryUploadError) {
    return error.kind === 'VIDEO'
      ? 'تعذر رفع الفيديو، تحقق من الاتصال وحاول مرة أخرى'
      : 'تعذر رفع الصورة، تحقق من الاتصال وحاول مرة أخرى';
  }
  switch (errorCode(error)) {
    case 'STORY_LIMIT':
      return 'وصلت للحد الأقصى من القصص، حاول لاحقاً';
    case 'STORY_PUBLISHER_ONLY':
      return 'نشر القصص متاح للشركات والمكاتب فقط';
    case 'STORY_MEDIA_INVALID':
      // The server says why (e.g. a video over 30 s)
      return serverMessage(error) ?? 'الصورة غير صالحة، اختر صورة أخرى';
    case 'STORY_UPLOAD_EXPIRED':
      return 'انتهت مهلة الرفع، حاول مرة أخرى';
    case 'STORY_PROPERTY_INVALID':
      return 'يمكن ربط القصة بإعلاناتك النشطة فقط';
    default:
      return serverMessage(error) ?? 'تعذر نشر القصة، حاول مرة أخرى';
  }
}
