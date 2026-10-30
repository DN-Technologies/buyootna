import { publishReel, reelPublishErrorMessage,ReelUploadError } from '../publishReel';
import { reelVideoProblem } from '../reelRules';

const FUTURE = '2099-01-01T00:00:00.000Z';
const PAST = '2000-01-01T00:00:00.000Z';
const target = (name: string) => ({
  method: 'PUT' as const,
  url: `https://s3.test/${name}`,
  headers: {},
});
const slot = (reelId: string, expires = FUTURE) => ({
  reelId,
  uploadUrlExpiresAt: expires,
  publishBefore: FUTURE,
  media: target(`${reelId}-media`),
  poster: target(`${reelId}-poster`),
});
const media = {
  uri: 'file:///out.mp4',
  sizeBytes: 2048,
  poster: { uri: 'file:///p.jpg', sizeBytes: 100 },
};

describe('publishReel', () => {
  const service = {
    createUpload: jest.fn(),
    uploadToSlot: jest.fn(),
    publish: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    service.createUpload.mockResolvedValue(slot('r1'));
    service.uploadToSlot.mockResolvedValue(200);
    service.publish.mockResolvedValue({ id: 'r1' });
  });

  it('asks for a slot with the sizes, sends the poster first, then publishes', async () => {
    const onProgress = jest.fn();
    await publishReel(service, media, { caption: ' عرض ' }, onProgress);

    expect(service.createUpload).toHaveBeenCalledWith({
      contentType: 'video/mp4',
      sizeBytes: 2048,
      poster: { contentType: 'image/jpeg', sizeBytes: 100 },
    });
    expect(service.uploadToSlot.mock.calls[0]).toEqual([
      target('r1-poster'),
      'file:///p.jpg',
    ]);
    expect(service.uploadToSlot.mock.calls[1]).toEqual([
      target('r1-media'),
      'file:///out.mp4',
      onProgress,
    ]);
    expect(service.publish).toHaveBeenCalledWith('r1', { caption: 'عرض' });
  });

  it('sends the listing, and no empty caption', async () => {
    await publishReel(service, media, { caption: '  ', propertyId: 'p1' });
    expect(service.publish).toHaveBeenCalledWith('r1', { propertyId: 'p1' });
  });

  it('retries a failed upload once with the same links', async () => {
    service.uploadToSlot.mockResolvedValueOnce(500);
    await publishReel(service, media, {});
    expect(service.createUpload).toHaveBeenCalledTimes(1);
    expect(service.publish).toHaveBeenCalledTimes(1);
  });

  it('asks for a new slot once the links have expired', async () => {
    service.createUpload
      .mockResolvedValueOnce(slot('old', PAST))
      .mockResolvedValueOnce(slot('new'));
    service.uploadToSlot.mockResolvedValueOnce(403);
    await publishReel(service, media, {});
    expect(service.publish).toHaveBeenCalledWith('new', {});
  });

  it('gives up after the retry, with an error the app can word', async () => {
    service.uploadToSlot.mockResolvedValue(500);
    await expect(publishReel(service, media, {})).rejects.toBeInstanceOf(
      ReelUploadError,
    );
    expect(service.publish).not.toHaveBeenCalled();
  });

  it('treats a dropped connection as a failed upload', async () => {
    service.uploadToSlot.mockRejectedValue(new Error('offline'));
    await expect(publishReel(service, media, {})).rejects.toBeInstanceOf(
      ReelUploadError,
    );
  });

  it('retries a publish that finds the files not there yet', async () => {
    service.publish
      .mockRejectedValueOnce({
        response: { data: { code: 'REEL_UPLOAD_INCOMPLETE' } },
      })
      .mockResolvedValueOnce({ id: 'r1' });
    await expect(publishReel(service, media, {})).resolves.toEqual({ id: 'r1' });
    expect(service.publish).toHaveBeenCalledTimes(2);
  });

  it('passes on any other refusal', async () => {
    const refused = { response: { data: { code: 'REEL_MEDIA_INVALID' } } };
    service.publish.mockRejectedValue(refused);
    await expect(publishReel(service, media, {})).rejects.toBe(refused);
    expect(service.publish).toHaveBeenCalledTimes(1);
  });
});

describe('reelPublishErrorMessage', () => {
  const answer = (code: string, message?: string) => ({
    response: { data: { code, message } },
  });

  it('words each case', () => {
    expect(reelPublishErrorMessage(new ReelUploadError(500))).toContain('تعذر رفع');
    expect(reelPublishErrorMessage(answer('REEL_LIMIT'))).toContain('الأقصى');
    expect(reelPublishErrorMessage(answer('REEL_PROPERTY_INVALID'))).toContain('إعلاناتك');
  });

  it("uses the server's reason for a refused file", () => {
    expect(
      reelPublishErrorMessage(answer('REEL_MEDIA_INVALID', 'مدة الفيديو تتجاوز 60 ثانية')),
    ).toBe('مدة الفيديو تتجاوز 60 ثانية');
  });

  it('has a fallback', () => {
    expect(reelPublishErrorMessage(new Error('x'))).toBe('تعذر نشر الفيديو، حاول مرة أخرى');
  });
});

describe('reelVideoProblem', () => {
  it('allows up to 50 MB and 60.5 s', () => {
    expect(reelVideoProblem(50 * 1024 * 1024, 60_500)).toBeNull();
  });

  it('refuses more, and an empty file', () => {
    expect(reelVideoProblem(50 * 1024 * 1024 + 1, 1000)).toBe('size');
    expect(reelVideoProblem(0, 1000)).toBe('size');
    expect(reelVideoProblem(1000, 60_501)).toBe('length');
  });
});
