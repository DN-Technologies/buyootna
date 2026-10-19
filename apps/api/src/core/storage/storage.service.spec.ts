import {
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';
import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';

const ENV_KEYS = [
  'AWS_S3_BUCKET_NAME',
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
] as const;

describe('StorageService', () => {
  let service: StorageService;
  let send: jest.SpyInstance;
  const saved: Partial<Record<(typeof ENV_KEYS)[number], string>> = {};

  beforeEach(async () => {
    for (const k of ENV_KEYS) saved[k] = process.env[k];
    // Dummy credentials: signing happens locally, nothing reaches AWS
    process.env.AWS_S3_BUCKET_NAME = 'test-bucket';
    process.env.AWS_REGION = 'eu-north-1';
    process.env.AWS_ACCESS_KEY_ID = 'AKIDEXAMPLE';
    process.env.AWS_SECRET_ACCESS_KEY = 'secret-example';

    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService],
    }).compile();

    service = module.get<StorageService>(StorageService);
    const client = (service as unknown as { s3Client: S3Client }).s3Client;
    send = jest.spyOn(client, 'send');
  });

  afterEach(() => {
    send.mockRestore();
    for (const k of ENV_KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('presignPut', () => {
    it('signs the content type and exact length, with metadata in the query', async () => {
      const put = await service.presignPut(
        'stories/i1/s1/media.jpg',
        {
          contentType: 'image/jpeg',
          contentLength: 12345,
          metadata: { 'story-id': 's1' },
        },
        600,
      );
      const url = new URL(put.url);

      expect(url.pathname).toBe('/stories/i1/s1/media.jpg');
      const signed = (url.searchParams.get('X-Amz-SignedHeaders') ?? '').split(
        ';',
      );
      expect(signed).toEqual(
        expect.arrayContaining(['content-length', 'content-type', 'host']),
      );
      expect(url.searchParams.get('x-amz-meta-story-id')).toBe('s1');
      expect(url.searchParams.get('X-Amz-Expires')).toBe('600');
      expect(put.headers).toEqual({
        'Content-Type': 'image/jpeg',
        'Content-Length': '12345',
      });
      // Signed locally, never sent
      expect(send).not.toHaveBeenCalled();
    });

    // Regression: with the SDK's default checksum mode the URL carried the
    // CRC32 of an empty body (x-amz-checksum-crc32=AAAAAA==), which S3 would
    // compare with the real file. This only inspects the URL; whether S3
    // accepts the upload needs a real-S3 integration test.
    it('signs no checksum into the URL', async () => {
      const put = await service.presignPut(
        'stories/i1/s1/media.jpg',
        { contentType: 'image/jpeg', contentLength: 12345 },
        600,
      );
      const url = new URL(put.url);
      const names = [...url.searchParams.keys()].map((k) => k.toLowerCase());

      expect(names.filter((k) => k.startsWith('x-amz-checksum-'))).toEqual([]);
      expect(names).not.toContain('x-amz-sdk-checksum-algorithm');
      expect(url.searchParams.get('x-amz-checksum-crc32')).toBeNull();
      expect(put.url).not.toContain('AAAAAA');
    });

    it('other S3 calls keep the default checksum mode', async () => {
      const client = (service as unknown as { s3Client: S3Client }).s3Client;
      await expect(client.config.requestChecksumCalculation()).resolves.toBe(
        'WHEN_SUPPORTED',
      );
    });
  });

  describe('signedMediaUrl', () => {
    it('forbids every cache from storing the file', async () => {
      const url = new URL(
        await service.signedMediaUrl('stories/i1/s1/media.jpg', 900),
      );
      expect(url.searchParams.get('response-cache-control')).toBe(
        'private, no-store',
      );
      expect(url.searchParams.get('X-Amz-Expires')).toBe('900');
    });
  });

  describe('headObject', () => {
    it('returns size, type and metadata', async () => {
      send.mockResolvedValue({
        ContentLength: 10,
        ContentType: 'image/png',
        Metadata: { 'story-id': 's1' },
      });
      await expect(service.headObject('k')).resolves.toEqual({
        contentLength: 10,
        contentType: 'image/png',
        metadata: { 'story-id': 's1' },
      });
      expect((send.mock.calls as unknown[][])[0][0]).toBeInstanceOf(
        HeadObjectCommand,
      );
    });

    it('a missing key is null', async () => {
      send.mockRejectedValue(
        Object.assign(new Error('NotFound'), {
          $metadata: { httpStatusCode: 404 },
        }),
      );
      await expect(service.headObject('k')).resolves.toBeNull();
    });

    it('other errors are thrown', async () => {
      send.mockRejectedValue(
        Object.assign(new Error('denied'), {
          $metadata: { httpStatusCode: 403 },
        }),
      );
      await expect(service.headObject('k')).rejects.toThrow('denied');
    });
  });

  describe('getRange', () => {
    it('asks for the inclusive byte range', async () => {
      send.mockResolvedValue({
        Body: {
          transformToByteArray: () => Promise.resolve(new Uint8Array([1, 2])),
        },
      });
      await expect(service.getRange('k', 0, 1)).resolves.toEqual(
        Buffer.from([1, 2]),
      );
      const cmd = (send.mock.calls as unknown[][])[0][0] as GetObjectCommand;
      expect(cmd.input.Range).toBe('bytes=0-1');
    });
  });

  describe('listKeys', () => {
    it('returns one page and the next token', async () => {
      const when = new Date('2026-10-20T00:00:00Z');
      send.mockResolvedValue({
        Contents: [{ Key: 'stories/a', LastModified: when }, {}],
        IsTruncated: true,
        NextContinuationToken: 'next',
      });
      await expect(service.listKeys('stories/')).resolves.toEqual({
        objects: [{ key: 'stories/a', lastModified: when }],
        nextToken: 'next',
      });
      expect((send.mock.calls as unknown[][])[0][0]).toBeInstanceOf(
        ListObjectsV2Command,
      );
    });
  });

  describe('deleteKeysReporting', () => {
    it('reports the keys S3 could not delete', async () => {
      send.mockResolvedValue({ Errors: [{ Key: 'b', Code: 'AccessDenied' }] });
      await expect(service.deleteKeysReporting(['a', 'b'])).resolves.toEqual({
        failed: ['b'],
      });
      expect((send.mock.calls as unknown[][])[0][0]).toBeInstanceOf(
        DeleteObjectsCommand,
      );
    });

    it('a failed request fails its whole batch', async () => {
      send.mockRejectedValue(new Error('network'));
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      await expect(service.deleteKeysReporting(['a', 'b'])).resolves.toEqual({
        failed: ['a', 'b'],
      });
    });

    it('splits more than 1000 keys into batches', async () => {
      send.mockResolvedValue({});
      const keys = Array.from({ length: 1001 }, (_, i) => `k${i}`);
      await service.deleteKeysReporting(keys);
      expect(send).toHaveBeenCalledTimes(2);
    });

    it('nothing to delete sends nothing', async () => {
      await expect(service.deleteKeysReporting([])).resolves.toEqual({
        failed: [],
      });
      expect(send).not.toHaveBeenCalled();
    });
  });
});
