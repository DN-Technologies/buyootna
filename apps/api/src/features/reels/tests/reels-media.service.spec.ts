import { StorageService } from '../../../core/storage/storage.service';
import { StoriesMediaService } from '../../stories/stories-media.service';
import { REEL_VIDEO_RULES } from '../reels.constants';
import { ReelsMediaService } from '../reels-media.service';

const AUTHOR = '11111111-1111-4111-8111-111111111111';
const REEL = '22222222-2222-4222-8222-222222222222';
const MB = 1024 * 1024;

describe('ReelsMediaService', () => {
  const storage = {
    publicUrl: jest.fn(
      (key: string, base?: string) =>
        `${base ?? 'https://bucket.example'}/${key}`,
    ),
  };
  const storiesMedia = {
    presignUpload: jest.fn(),
    checkVideo: jest.fn(),
  };
  const service = new ReelsMediaService(
    storage as unknown as StorageService,
    storiesMedia as unknown as StoriesMediaService,
  );
  const reel = {
    id: REEL,
    mediaKey: `reels/${AUTHOR}/${REEL}/media.mp4`,
    mediaContentType: 'video/mp4',
    mediaSizeBytes: 30 * MB,
    posterKey: `reels/${AUTHOR}/${REEL}/poster.jpg`,
    posterSizeBytes: 1000,
  };
  const savedEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.REELS_S3_PREFIX;
    delete process.env.REELS_MEDIA_BASE_URL;
  });
  afterAll(() => {
    process.env = savedEnv;
  });

  describe('keys', () => {
    it('are server-made and parse back to the reel id', () => {
      const media = service.mediaKeyFor(AUTHOR, REEL);
      const poster = service.posterKeyFor(AUTHOR, REEL);
      expect(media).toBe(`reels/${AUTHOR}/${REEL}/media.mp4`);
      expect(service.reelIdFromKey(media)).toBe(REEL);
      expect(service.reelIdFromKey(poster)).toBe(REEL);
    });

    it('ignore anything not ours', () => {
      expect(service.reelIdFromKey('reels/readme.txt')).toBeNull();
      expect(
        service.reelIdFromKey(`stories/${AUTHOR}/${REEL}/media.mp4`),
      ).toBeNull();
      expect(
        service.reelIdFromKey(`reels/${AUTHOR}/${REEL}/other.mp4`),
      ).toBeNull();
    });

    it('follow REELS_S3_PREFIX, so a development API stays apart', () => {
      process.env.REELS_S3_PREFIX = 'reels-dev';
      const key = service.mediaKeyFor(AUTHOR, REEL);
      expect(key).toBe(`reels-dev/${AUTHOR}/${REEL}/media.mp4`);
      expect(service.reelIdFromKey(key)).toBe(REEL);
      expect(service.reelIdFromKey(reel.mediaKey)).toBeNull();
    });
  });

  describe('checkVideo', () => {
    it("uses Stories' check with the reels' rules", async () => {
      storiesMedia.checkVideo.mockResolvedValue({
        ok: true,
        width: 720,
        height: 1280,
        durationMs: 60_000,
      });
      await expect(service.checkVideo(reel)).resolves.toMatchObject({
        ok: true,
      });
      expect(storiesMedia.checkVideo).toHaveBeenCalledWith(
        reel,
        REEL_VIDEO_RULES,
      );
    });

    it('refuses a file over 12 Mbps on average', async () => {
      storiesMedia.checkVideo.mockResolvedValue({
        ok: true,
        width: 720,
        height: 1280,
        durationMs: 10_000,
      });
      // 30 MB in 10 s is about 25 Mbps
      await expect(service.checkVideo(reel)).resolves.toEqual({
        ok: false,
        missing: false,
        reason: 'bitrate_too_high',
      });
    });

    it('passes on what the file check refused', async () => {
      const refused = { ok: false, missing: false, reason: 'video_codec' };
      storiesMedia.checkVideo.mockResolvedValue(refused);
      await expect(service.checkVideo(reel)).resolves.toEqual(refused);
    });
  });

  describe('linksFor', () => {
    it('are stable public links, not signed ones', () => {
      expect(service.linksFor(reel)).toEqual({
        mediaUrl: `https://bucket.example/${reel.mediaKey}`,
        posterUrl: `https://bucket.example/${reel.posterKey}`,
      });
    });

    it('go through the CDN once REELS_MEDIA_BASE_URL is set', () => {
      process.env.REELS_MEDIA_BASE_URL = 'https://cdn.example';
      expect(service.linksFor(reel).mediaUrl).toBe(
        `https://cdn.example/${reel.mediaKey}`,
      );
    });
  });
});
