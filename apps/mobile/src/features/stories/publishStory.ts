import type { storiesService as StoriesService } from '@/shared/api/stories.service';

import type {
  AuthorStory,
  StoryPhotoType,
  StoryUploadRequest,
  StoryUploadSlot,
  StoryVideoType,
} from './types';

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

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
 * Posts a story: an upload slot, the files straight to S3 (a video's
 * poster first, then the video, whose progress is reported), then publish
 * (the server checks the files). A failed upload is retried once with the
 * same links while they are valid, otherwise with a new slot; a publish
 * that finds the files not there yet is retried once.
 */
export async function publishStory(
  service: Service,
  media: StoryMedia,
  details: { caption?: string; propertyId?: string },
  onProgress?: (fraction: number) => void,
  now: () => number = Date.now,
): Promise<AuthorStory> {
  const ok = (status: number) => status >= 200 && status < 300;
  const put = (...args: Parameters<Service['uploadToSlot']>) =>
    service.uploadToSlot(...args).catch(() => 0);
  const upload = async (slot: StoryUploadSlot): Promise<number> => {
    if (media.kind === 'VIDEO') {
      if (!slot.poster) return 0;
      const posterStatus = await put(slot.poster, media.poster.uri);
      if (!ok(posterStatus)) return posterStatus;
    }
    return put(slot.media, media.uri, onProgress);
  };

  const request = uploadRequest(media);
  let slot = await service.createUpload(request);
  let status = await upload(slot);
  if (!ok(status)) {
    if (Date.parse(slot.uploadUrlExpiresAt) <= now()) {
      slot = await service.createUpload(request);
    }
    status = await upload(slot);
  }
  if (!ok(status)) throw new StoryUploadError(status, media.kind);

  const body = {
    ...(details.caption?.trim() ? { caption: details.caption.trim() } : {}),
    ...(details.propertyId ? { propertyId: details.propertyId } : {}),
  };
  try {
    return await service.publish(slot.storyId, body);
  } catch (error) {
    if (errorCode(error) !== 'STORY_UPLOAD_INCOMPLETE') throw error;
    await delay(1000);
    return service.publish(slot.storyId, body);
  }
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
