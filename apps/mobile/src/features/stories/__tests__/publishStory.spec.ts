import {
  publishStory,
  storyPublishErrorMessage,
  StoryUploadError,
} from '../publishStory';
import {
  storyPhotoProblem,
  storyPhotoType,
  storyVideoProblem,
  storyVideoType,
} from '../storyPhoto';
import type { StoryUploadSlot } from '../types';

const NOW = Date.parse('2026-10-20T12:00:00.000Z');
const slot = (id: string, expiresInMs = 600_000): StoryUploadSlot => ({
  storyId: id,
  uploadUrlExpiresAt: new Date(NOW + expiresInMs).toISOString(),
  publishBefore: new Date(NOW + 1_800_000).toISOString(),
  media: { method: 'PUT', url: `https://s3.test/${id}`, headers: { 'Content-Type': 'image/jpeg', 'Content-Length': '100' } },
});
const photo = { kind: 'IMAGE' as const, uri: 'file:///p.jpg', type: 'image/jpeg' as const, sizeBytes: 100 };
const video = {
  kind: 'VIDEO' as const,
  uri: 'file:///v.mp4',
  type: 'video/mp4' as const,
  sizeBytes: 5_000_000,
  durationMs: 12_000,
  poster: { uri: 'file:///poster.jpg', sizeBytes: 40_000 },
};
const videoSlot = (id: string, expiresInMs = 600_000): StoryUploadSlot => ({
  ...slot(id, expiresInMs),
  poster: { method: 'PUT', url: `https://s3.test/${id}/poster`, headers: {} },
});
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
    expect(s.createUpload).toHaveBeenCalledWith({
      mediaType: 'IMAGE',
      contentType: 'image/jpeg',
      sizeBytes: 100,
    });
    expect(s.uploadToSlot).toHaveBeenCalledWith(slot('s1').media, 'file:///p.jpg', onProgress);
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

describe('publishStory (video)', () => {
  const videoService = () => ({
    createUpload: jest.fn().mockResolvedValue(videoSlot('v1')),
    uploadToSlot: jest.fn().mockResolvedValue(200),
    publish: jest.fn().mockResolvedValue({ id: 'v1' }),
  });

  it('asks for a video slot with its poster, uploads the poster then the video', async () => {
    const s = videoService();
    const onProgress = jest.fn();
    await publishStory(s, video, {}, onProgress, () => NOW);
    expect(s.createUpload).toHaveBeenCalledWith({
      mediaType: 'VIDEO',
      contentType: 'video/mp4',
      sizeBytes: 5_000_000,
      poster: { contentType: 'image/jpeg', sizeBytes: 40_000 },
    });
    expect(s.uploadToSlot.mock.calls).toEqual([
      [videoSlot('v1').poster, 'file:///poster.jpg'],
      // Progress follows the video, the big file
      [videoSlot('v1').media, 'file:///v.mp4', onProgress],
    ]);
    expect(s.publish).toHaveBeenCalledWith('v1', {});
  });

  it('a failed poster stops before the video, and both are retried', async () => {
    const s = videoService();
    s.uploadToSlot
      .mockResolvedValueOnce(500) // poster
      .mockResolvedValueOnce(200) // poster, again
      .mockResolvedValueOnce(200); // video
    await publishStory(s, video, {}, undefined, () => NOW);
    expect(s.uploadToSlot.mock.calls.map((c) => c[1])).toEqual([
      'file:///poster.jpg',
      'file:///poster.jpg',
      'file:///v.mp4',
    ]);
  });

  it('a video that will not upload says so', async () => {
    const s = videoService();
    s.uploadToSlot.mockResolvedValue(0);
    const error: unknown = await publishStory(s, video, {}, undefined, () => NOW).catch((e) => e);
    expect(error).toBeInstanceOf(StoryUploadError);
    expect(storyPublishErrorMessage(error)).toBe(
      'تعذر رفع الفيديو، تحقق من الاتصال وحاول مرة أخرى',
    );
  });

  it("a slot without the poster's link is a failed upload", async () => {
    const s = videoService();
    s.createUpload.mockResolvedValue(slot('v1'));
    await expect(publishStory(s, video, {}, undefined, () => NOW)).rejects.toBeInstanceOf(
      StoryUploadError,
    );
    expect(s.publish).not.toHaveBeenCalled();
  });
});

describe('storyPublishErrorMessage', () => {
  it.each([
    [new StoryUploadError(0), 'تعذر رفع الصورة، تحقق من الاتصال وحاول مرة أخرى'],
    [apiError('STORY_LIMIT'), 'وصلت للحد الأقصى من القصص، حاول لاحقاً'],
    [apiError('STORY_PUBLISHER_ONLY'), 'نشر القصص متاح للشركات والمكاتب فقط'],
    [apiError('STORY_MEDIA_INVALID'), 'الصورة غير صالحة، اختر صورة أخرى'],
    // The server's reason wins (e.g. a video over 30 s)
    [apiError('STORY_MEDIA_INVALID', 'مدة الفيديو تتجاوز 30 ثانية'), 'مدة الفيديو تتجاوز 30 ثانية'],
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

describe('story video checks', () => {
  it.each([
    ['video/mp4', 'a.mp4', 'video/mp4'],
    ['video/quicktime', 'a.mov', 'video/quicktime'],
    [undefined, 'file:///x/clip.MOV', 'video/quicktime'],
    [undefined, 'file:///x/clip.m4v', 'video/mp4'],
    ['video/webm', 'a.webm', null],
    ['video/x-matroska', 'a.mkv', null],
    [undefined, 'file:///x/clip.3gp', null],
  ])('%s %s → %s', (mime, uri, expected) => {
    expect(storyVideoType(mime, uri)).toBe(expected);
  });

  it('up to 50 MB and 30 s (with half a second for rounding)', () => {
    const MB = 1024 * 1024;
    expect(storyVideoProblem('video/mp4', 50 * MB, 30_500)).toBeNull();
    expect(storyVideoProblem('video/mp4', 50 * MB + 1, 10_000)).toBe('size');
    expect(storyVideoProblem('video/mp4', 10 * MB, 30_501)).toBe('length');
    // Length unknown on the phone: the server measures it
    expect(storyVideoProblem('video/mp4', 10 * MB, null)).toBeNull();
    expect(storyVideoProblem(null, 10, 1000)).toBe('type');
  });
});
