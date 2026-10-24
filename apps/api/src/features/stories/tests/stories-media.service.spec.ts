import { readFileSync } from 'fs';
import { join } from 'path';

import { StorageService } from '../../../core/storage/storage.service';
import { StoriesMediaService } from '../stories-media.service';

const AUTHOR = '11111111-1111-4111-8111-111111111111';
const STORY = '22222222-2222-4222-8222-222222222222';
const KEY = `stories/${AUTHOR}/${STORY}/media.jpg`;
const jpg = readFileSync(join(__dirname, 'fixtures', 'photo.jpg'));

describe('StoriesMediaService', () => {
  const storage = {
    presignPut: jest.fn(),
    headObject: jest.fn(),
    getRange: jest.fn(),
    downloadToFile: jest.fn(),
    signedMediaUrl: jest.fn(
      (key: string, ttl: number) => `https://s3.example/${key}?ttl=${ttl}`,
    ),
  };
  const service = new StoriesMediaService(storage as unknown as StorageService);
  const story = {
    id: STORY,
    mediaKey: KEY,
    mediaContentType: 'image/jpeg',
    mediaSizeBytes: jpg.length,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    storage.headObject.mockResolvedValue({
      contentLength: jpg.length,
      contentType: 'image/jpeg',
      metadata: { 'story-id': STORY },
    });
    storage.getRange.mockResolvedValue(jpg);
  });

  it('keys are server-made and parse back to the story id', () => {
    const key = service.mediaKeyFor(AUTHOR, STORY, 'image/webp');
    expect(key).toBe(`stories/${AUTHOR}/${STORY}/media.webp`);
    expect(service.storyIdFromKey(key)).toBe(STORY);
    expect(service.storyIdFromKey('stories/readme.txt')).toBeNull();
    expect(service.storyIdFromKey(`avatars/${STORY}.jpg`)).toBeNull();
  });

  it('presigns with the exact size and the story id as metadata', async () => {
    await service.presignUpload(STORY, KEY, 'image/jpeg', 2048);
    expect(storage.presignPut).toHaveBeenCalledWith(
      KEY,
      {
        contentType: 'image/jpeg',
        contentLength: 2048,
        metadata: { 'story-id': STORY },
      },
      600,
    );
  });

  describe('checkImage', () => {
    it('accepts the real photo and reads its size from its bytes', async () => {
      await expect(service.checkImage(story)).resolves.toEqual({
        ok: true,
        width: 48,
        height: 48,
      });
      // Only the start of the file is read
      expect(storage.getRange).toHaveBeenCalledWith(KEY, 0, jpg.length - 1);
    });

    it('not uploaded yet', async () => {
      storage.headObject.mockResolvedValue(null);
      await expect(service.checkImage(story)).resolves.toEqual({
        ok: false,
        missing: true,
      });
    });

    it.each([
      ['size_mismatch', { contentLength: 1 }],
      ['type_mismatch', { contentType: 'image/png' }],
      ['metadata_mismatch', { metadata: { 'story-id': 'another' } }],
    ])('%s', async (reason, head) => {
      storage.headObject.mockResolvedValue({
        contentLength: jpg.length,
        contentType: 'image/jpeg',
        metadata: { 'story-id': STORY },
        ...head,
      });
      await expect(service.checkImage(story)).resolves.toEqual({
        ok: false,
        missing: false,
        reason,
      });
      expect(storage.getRange).not.toHaveBeenCalled();
    });

    it('a non-image declared as JPEG', async () => {
      storage.getRange.mockResolvedValue(
        Buffer.from('<html>not a photo</html>'),
      );
      await expect(service.checkImage(story)).resolves.toMatchObject({
        reason: 'not_an_image',
      });
    });

    it('a PNG declared as JPEG', async () => {
      storage.getRange.mockResolvedValue(
        readFileSync(join(__dirname, 'fixtures', 'photo.png')),
      );
      await expect(service.checkImage(story)).resolves.toMatchObject({
        reason: 'content_mismatch',
      });
    });

    it('a photo over 8192 px', async () => {
      const big = Buffer.from(
        readFileSync(join(__dirname, 'fixtures', 'photo.png')),
      );
      big.writeUInt32BE(9000, 16);
      storage.headObject.mockResolvedValue({
        contentLength: big.length,
        contentType: 'image/png',
        metadata: { 'story-id': STORY },
      });
      storage.getRange.mockResolvedValue(big);
      await expect(
        service.checkImage({
          ...story,
          mediaContentType: 'image/png',
          mediaSizeBytes: big.length,
        }),
      ).resolves.toMatchObject({ reason: 'too_large' });
    });

    it('a small file of more than 50 MP is refused (decode-size bomb)', async () => {
      const big = Buffer.from(
        readFileSync(join(__dirname, 'fixtures', 'photo.png')),
      );
      // 8000 × 6251 = 50,008,000 pixels, each side within 8192
      big.writeUInt32BE(8000, 16);
      big.writeUInt32BE(6251, 20);
      storage.headObject.mockResolvedValue({
        contentLength: big.length,
        contentType: 'image/png',
        metadata: { 'story-id': STORY },
      });
      storage.getRange.mockResolvedValue(big);
      await expect(
        service.checkImage({
          ...story,
          mediaContentType: 'image/png',
          mediaSizeBytes: big.length,
        }),
      ).resolves.toMatchObject({ reason: 'too_large' });
    });

    it('reads up to 1 MB of a large file to find the header', async () => {
      storage.headObject.mockResolvedValue({
        contentLength: 5_000_000,
        contentType: 'image/jpeg',
        metadata: { 'story-id': STORY },
      });
      await service.checkImage({ ...story, mediaSizeBytes: 5_000_000 });
      expect(storage.getRange).toHaveBeenCalledWith(KEY, 0, 1024 * 1024 - 1);
    });
  });

  describe('linksFor', () => {
    const now = new Date('2026-10-20T12:00:00.000Z');

    it('links last 15 minutes at most', async () => {
      const links = await service.linksFor(
        {
          id: STORY,
          mediaKey: KEY,
          posterKey: null,
          expiresAt: new Date('2026-10-21T00:00:00.000Z'),
        },
        now,
      );
      expect(storage.signedMediaUrl).toHaveBeenCalledWith(KEY, 900);
      expect(links.urlExpiresAt).toEqual(new Date('2026-10-20T12:15:00.000Z'));
      expect(links.posterUrl).toBeNull();
    });

    it('and never outlive the story', async () => {
      const links = await service.linksFor(
        {
          id: STORY,
          mediaKey: KEY,
          posterKey: null,
          expiresAt: new Date('2026-10-20T12:05:00.000Z'),
        },
        now,
      );
      expect(storage.signedMediaUrl).toHaveBeenCalledWith(KEY, 300);
      expect(links.urlExpiresAt).toEqual(new Date('2026-10-20T12:05:00.000Z'));
    });

    it('after its 24 hours (archive, highlight) the full 15 minutes', async () => {
      const links = await service.linksFor(
        {
          id: STORY,
          mediaKey: KEY,
          posterKey: null,
          expiresAt: new Date('2026-10-01T00:00:00.000Z'),
        },
        now,
        { afterExpiry: true },
      );
      expect(storage.signedMediaUrl).toHaveBeenCalledWith(KEY, 900);
      expect(links.urlExpiresAt).toEqual(new Date('2026-10-20T12:15:00.000Z'));
    });
  });

  describe('checkVideo', () => {
    const VIDEO_KEY = `stories/${AUTHOR}/${STORY}/media.mp4`;
    const POSTER_KEY = `stories/${AUTHOR}/${STORY}/poster.jpg`;
    const video = {
      id: STORY,
      mediaKey: VIDEO_KEY,
      mediaContentType: 'video/mp4',
      mediaSizeBytes: 5_000_000,
      posterKey: POSTER_KEY,
      posterSizeBytes: jpg.length,
    };
    const heads: Record<string, unknown> = {};
    const probe = jest.fn();

    beforeEach(() => {
      heads[VIDEO_KEY] = {
        contentLength: 5_000_000,
        contentType: 'video/mp4',
        metadata: { 'story-id': STORY },
      };
      heads[POSTER_KEY] = {
        contentLength: jpg.length,
        contentType: 'image/jpeg',
        metadata: { 'story-id': STORY },
      };
      storage.headObject.mockImplementation((key: string) =>
        Promise.resolve(heads[key] ?? null),
      );
      storage.downloadToFile.mockResolvedValue(undefined);
      probe.mockResolvedValue({
        ok: true,
        width: 720,
        height: 1280,
        durationMs: 29_800,
      });
      service.probeVideo = probe;
    });

    it('a good video: downloaded to a temp file, probed, measured', async () => {
      await expect(service.checkVideo(video)).resolves.toEqual({
        ok: true,
        width: 720,
        height: 1280,
        durationMs: 29_800,
      });
      const [key, path, max] = storage.downloadToFile.mock.calls[0] as [
        string,
        string,
        number,
      ];
      expect(key).toBe(VIDEO_KEY);
      expect(max).toBe(5_000_000);
      expect(probe).toHaveBeenCalledWith(path);
      // The copy is gone afterwards
      const { existsSync } = jest.requireActual<typeof import('fs')>('fs');
      expect(existsSync(path)).toBe(false);
    });

    it('either file not there yet: missing, nothing downloaded', async () => {
      delete heads[POSTER_KEY];
      await expect(service.checkVideo(video)).resolves.toEqual({
        ok: false,
        missing: true,
      });
      expect(storage.downloadToFile).not.toHaveBeenCalled();
    });

    it.each([
      ['video size', VIDEO_KEY, { contentLength: 1 }, 'size_mismatch'],
      [
        'video type',
        VIDEO_KEY,
        { contentType: 'video/quicktime' },
        'type_mismatch',
      ],
      [
        'video owner',
        VIDEO_KEY,
        { metadata: { 'story-id': 'other' } },
        'metadata_mismatch',
      ],
      ['poster size', POSTER_KEY, { contentLength: 1 }, 'poster_size_mismatch'],
      [
        'poster owner',
        POSTER_KEY,
        { metadata: {} },
        'poster_metadata_mismatch',
      ],
    ])(
      'a wrong %s fails before downloading',
      async (_l, key, change, reason) => {
        heads[key] = { ...(heads[key] as object), ...change };
        await expect(service.checkVideo(video)).resolves.toEqual({
          ok: false,
          missing: false,
          reason,
        });
        expect(storage.downloadToFile).not.toHaveBeenCalled();
      },
    );

    it('a poster that is not really a JPEG fails', async () => {
      storage.getRange.mockResolvedValue(Buffer.from('not an image at all'));
      await expect(service.checkVideo(video)).resolves.toEqual({
        ok: false,
        missing: false,
        reason: 'poster_not_jpeg',
      });
    });

    it("ffprobe's refusal is the story's reason, and the copy is removed", async () => {
      probe.mockResolvedValue({ ok: false, reason: 'too_long' });
      await expect(service.checkVideo(video)).resolves.toEqual({
        ok: false,
        missing: false,
        reason: 'too_long',
      });
      const [, path] = storage.downloadToFile.mock.calls[0] as [
        string,
        string,
        number,
      ];
      const { existsSync } = jest.requireActual<typeof import('fs')>('fs');
      expect(existsSync(path)).toBe(false);
    });

    it('no ffprobe on the server: 503, the story is left pending', async () => {
      const { VideoProbeUnavailableError } = jest.requireActual<
        typeof import('../utils/video-probe')
      >('../utils/video-probe');
      probe.mockRejectedValue(new VideoProbeUnavailableError('missing'));
      await expect(service.checkVideo(video)).rejects.toMatchObject({
        status: 503,
      });
    });
  });
});
