import type { storiesService as StoriesService } from '@/shared/api/stories.service';

import type { AuthorStory, StoryPhotoType, StoryUploadSlot } from './types';

export interface StoryPhoto {
  uri: string;
  type: StoryPhotoType;
  sizeBytes: number;
}

type Service = Pick<
  typeof StoriesService,
  'createUpload' | 'uploadToSlot' | 'publish'
>;

/** The upload to S3 failed even after retrying. */
export class StoryUploadError extends Error {
  constructor(readonly status: number) {
    super(`upload failed (${status})`);
  }
}

const errorCode = (error: unknown) =>
  (error as { response?: { data?: { code?: string } } })?.response?.data?.code;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Posts a photo story: an upload slot, the file straight to S3, then
 * publish (the server checks the file). A failed upload is retried once
 * with the same link while it is valid, otherwise with a new slot; a
 * publish that finds the file not there yet is retried once.
 */
export async function publishStory(
  service: Service,
  photo: StoryPhoto,
  details: { caption?: string; propertyId?: string },
  onProgress?: (fraction: number) => void,
  now: () => number = Date.now,
): Promise<AuthorStory> {
  const upload = (slot: StoryUploadSlot) =>
    service.uploadToSlot(slot, photo.uri, onProgress).catch(() => 0);
  const ok = (status: number) => status >= 200 && status < 300;

  let slot = await service.createUpload(photo.type, photo.sizeBytes);
  let status = await upload(slot);
  if (!ok(status)) {
    if (Date.parse(slot.uploadUrlExpiresAt) <= now()) {
      slot = await service.createUpload(photo.type, photo.sizeBytes);
    }
    status = await upload(slot);
  }
  if (!ok(status)) throw new StoryUploadError(status);

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

/** What to tell the author when posting failed. */
export function storyPublishErrorMessage(error: unknown): string {
  if (error instanceof StoryUploadError) {
    return 'تعذر رفع الصورة، تحقق من الاتصال وحاول مرة أخرى';
  }
  switch (errorCode(error)) {
    case 'STORY_LIMIT':
      return 'وصلت للحد الأقصى من القصص، حاول لاحقاً';
    case 'STORY_PUBLISHER_ONLY':
      return 'نشر القصص متاح للشركات والمكاتب فقط';
    case 'STORY_MEDIA_INVALID':
      return 'الصورة غير صالحة، اختر صورة أخرى';
    case 'STORY_UPLOAD_EXPIRED':
      return 'انتهت مهلة الرفع، حاول مرة أخرى';
    case 'STORY_PROPERTY_INVALID':
      return 'يمكن ربط القصة بإعلاناتك النشطة فقط';
    default: {
      const message = (error as { response?: { data?: { message?: unknown } } })
        ?.response?.data?.message;
      return typeof message === 'string' ? message : 'تعذر نشر القصة، حاول مرة أخرى';
    }
  }
}
