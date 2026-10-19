import {
  publishStory,
  storyPublishErrorMessage,
  StoryUploadError,
} from '../publishStory';
import { storyPhotoProblem, storyPhotoType } from '../storyPhoto';
import type { StoryUploadSlot } from '../types';

const NOW = Date.parse('2026-10-20T12:00:00.000Z');
const slot = (id: string, expiresInMs = 600_000): StoryUploadSlot => ({
  storyId: id,
  uploadUrlExpiresAt: new Date(NOW + expiresInMs).toISOString(),
  publishBefore: new Date(NOW + 1_800_000).toISOString(),
  media: { method: 'PUT', url: `https://s3.test/${id}`, headers: { 'Content-Type': 'image/jpeg', 'Content-Length': '100' } },
});
const photo = { uri: 'file:///p.jpg', type: 'image/jpeg' as const, sizeBytes: 100 };
const apiError = (code: string, message?: string) => ({
  response: { data: { code, ...(message ? { message } : {}) } },
});

const service = () => ({
  createUpload: jest.fn().mockResolvedValue(slot('s1')),
  uploadToSlot: jest.fn().mockResolvedValue(200),
  publish: jest.fn().mockResolvedValue({ id: 's1' }),
});

describe('publishStory', () => {
  it('slot → upload → publish, with a trimmed caption and the listing', async () => {
    const s = service();
    const onProgress = jest.fn();
    await publishStory(s, photo, { caption: '  عرض  ', propertyId: 'p1' }, onProgress, () => NOW);
    expect(s.createUpload).toHaveBeenCalledWith('image/jpeg', 100);
    expect(s.uploadToSlot).toHaveBeenCalledWith(slot('s1'), 'file:///p.jpg', onProgress);
    expect(s.publish).toHaveBeenCalledWith('s1', { caption: 'عرض', propertyId: 'p1' });
  });

  it('no caption or listing: nothing extra is sent', async () => {
    const s = service();
    await publishStory(s, photo, { caption: '   ' }, undefined, () => NOW);
    expect(s.publish).toHaveBeenCalledWith('s1', {});
  });

  it('a failed upload is retried once with the same link while it is valid', async () => {
    const s = service();
    s.uploadToSlot.mockResolvedValueOnce(0).mockResolvedValueOnce(200);
    await publishStory(s, photo, {}, undefined, () => NOW);
    expect(s.createUpload).toHaveBeenCalledTimes(1);
    expect(s.uploadToSlot).toHaveBeenCalledTimes(2);
  });

  it('…and with a new slot once the link has expired', async () => {
    const s = service();
    s.createUpload
      .mockResolvedValueOnce(slot('s1', -1))
      .mockResolvedValueOnce(slot('s2'));
    s.uploadToSlot.mockResolvedValueOnce(403).mockResolvedValueOnce(200);
    await publishStory(s, photo, {}, undefined, () => NOW);
    expect(s.createUpload).toHaveBeenCalledTimes(2);
    expect(s.publish).toHaveBeenCalledWith('s2', {});
  });

  it('an upload that keeps failing stops before publishing', async () => {
    const s = service();
    s.uploadToSlot.mockRejectedValue(new Error('offline'));
    await expect(publishStory(s, photo, {}, undefined, () => NOW)).rejects.toBeInstanceOf(
      StoryUploadError,
    );
    expect(s.publish).not.toHaveBeenCalled();
  });

  it('publish finding the file not there yet is retried once', async () => {
    jest.useFakeTimers();
    const s = service();
    s.publish
      .mockRejectedValueOnce(apiError('STORY_UPLOAD_INCOMPLETE'))
      .mockResolvedValueOnce({ id: 's1' });
    const done = publishStory(s, photo, {}, undefined, () => NOW);
    await jest.advanceTimersByTimeAsync(1000);
    await expect(done).resolves.toEqual({ id: 's1' });
    expect(s.publish).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });

  it('other publish errors are not retried', async () => {
    const s = service();
    s.publish.mockRejectedValue(apiError('STORY_LIMIT'));
    await expect(publishStory(s, photo, {}, undefined, () => NOW)).rejects.toEqual(
      apiError('STORY_LIMIT'),
    );
    expect(s.publish).toHaveBeenCalledTimes(1);
  });
});

describe('storyPublishErrorMessage', () => {
  it.each([
    [new StoryUploadError(0), 'تعذر رفع الصورة، تحقق من الاتصال وحاول مرة أخرى'],
    [apiError('STORY_LIMIT'), 'وصلت للحد الأقصى من القصص، حاول لاحقاً'],
    [apiError('STORY_PUBLISHER_ONLY'), 'نشر القصص متاح للشركات والمكاتب فقط'],
    [apiError('STORY_MEDIA_INVALID'), 'الصورة غير صالحة، اختر صورة أخرى'],
    [apiError('STORY_PROPERTY_INVALID'), 'يمكن ربط القصة بإعلاناتك النشطة فقط'],
    [apiError('OTHER', 'رسالة الخادم'), 'رسالة الخادم'],
    [new Error('x'), 'تعذر نشر القصة، حاول مرة أخرى'],
  ])('%#', (error, message) => {
    expect(storyPublishErrorMessage(error)).toBe(message);
  });
});

describe('story photo checks', () => {
  it.each([
    ['image/jpeg', 'a.jpg', 'image/jpeg'],
    ['image/jpg', 'a.jpg', 'image/jpeg'],
    ['image/png', 'a.png', 'image/png'],
    ['image/webp', 'a.webp', 'image/webp'],
    [undefined, 'file:///x/photo.JPEG', 'image/jpeg'],
    ['image/heic', 'a.heic', null],
    [undefined, 'file:///x/photo.heic', null],
    ['video/mp4', 'a.mp4', null],
  ])('%s %s → %s', (mime, uri, expected) => {
    expect(storyPhotoType(mime, uri)).toBe(expected);
  });

  it('size must be 1 byte to 10 MB', () => {
    expect(storyPhotoProblem('image/jpeg', 1)).toBeNull();
    expect(storyPhotoProblem('image/jpeg', 10 * 1024 * 1024)).toBeNull();
    expect(storyPhotoProblem('image/jpeg', 10 * 1024 * 1024 + 1)).toBe('size');
    expect(storyPhotoProblem('image/jpeg', undefined)).toBe('size');
    expect(storyPhotoProblem(null, 100)).toBe('type');
  });
});
