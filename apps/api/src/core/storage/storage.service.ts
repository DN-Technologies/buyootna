import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { createReadStream, createWriteStream } from 'fs';
import { stat } from 'fs/promises';
import { extname } from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

/** What the app must send with a presigned PUT (all of it is signed). */
export interface PresignedPut {
  url: string;
  headers: Record<string, string>;
}

/** An object's stored size, type and metadata, as S3 reports them. */
export interface ObjectHead {
  contentLength: number;
  contentType: string | null;
  metadata: Record<string, string>;
}

export interface ListedObject {
  key: string;
  lastModified: Date | null;
}

// DeleteObjects takes at most this many keys per request
const DELETE_BATCH = 1000;

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  // Presigned PUTs only. With the SDK default ("when supported") the URL
  // carries the CRC32 of an empty body (x-amz-checksum-crc32=AAAAAA==), which
  // S3 would check against the uploaded file. Other calls keep the default.
  private readonly presignClient: S3Client;
  private readonly bucketName = process.env.AWS_S3_BUCKET_NAME;
  private readonly region = process.env.AWS_REGION;

  constructor() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    const s3Config: S3ClientConfig = {
      region: this.region,
    };

    if (accessKeyId && secretAccessKey) {
      s3Config.credentials = {
        accessKeyId,
        secretAccessKey,
      };
    }

    this.s3Client = new S3Client(s3Config);
    this.presignClient = new S3Client({
      ...s3Config,
      requestChecksumCalculation: 'WHEN_REQUIRED',
    });
  }

  // Uploads a file directly from memory buffer to S3
  /** Throws when the bucket can't be reached with these credentials (health check). */
  async checkAccess(): Promise<void> {
    await this.s3Client.send(
      new HeadBucketCommand({ Bucket: this.bucketName }),
    );
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      // Generate a unique filename: folder-name/uuid.extension
      const fileExtension = extname(file.originalname);
      const uniqueFileName = `${folder}/${uuidv4()}${fileExtension}`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: uniqueFileName,
          Body: file.buffer,
          ContentType: file.mimetype,
          // ACL: 'public-read', // Uncomment if your bucket allows public ACLs
        }),
      );

      // Return the public URL to save in the database
      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${uniqueFileName}`;
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new InternalServerErrorException('فشل في رفع الملف');
    }
  }
  /**
   * Deletes a file this service uploaded, given the URL uploadFile returned.
   * Best effort: used to clean up after a failed write, so it never throws.
   * URLs that aren't ours (other buckets, external links) are ignored.
   */
  async deleteFile(url: string | null | undefined): Promise<void> {
    const prefix = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/`;
    if (!url || !url.startsWith(prefix)) return;
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: url.slice(prefix.length),
        }),
      );
    } catch (error) {
      console.error('S3 Delete Error:', error);
    }
  }

  /**
   * Uploads a private file (e.g. a chat attachment) and returns its object
   * key -- never a URL. It's only reachable through signedUrl().
   */
  async uploadPrivate(
    body: Buffer,
    folder: string,
    extension: string,
    contentType: string,
  ): Promise<string> {
    const key = `${folder}/${uuidv4()}${extension}`;
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: body,
          ContentType: contentType,
        }),
      );
      return key;
    } catch (error) {
      console.error('S3 Private Upload Error:', error);
      throw new InternalServerErrorException('فشل في رفع الملف');
    }
  }

  /**
   * A short-lived link to a private object. `downloadName` makes browsers /
   * the OS save it under its real file name.
   */
  async signedUrl(
    key: string,
    expiresInSeconds = 15 * 60,
    downloadName?: string,
  ): Promise<string> {
    return getSignedUrl(
      this.s3Client,
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ...(downloadName
          ? {
              ResponseContentDisposition: `inline; filename*=UTF-8''${encodeURIComponent(downloadName)}`,
            }
          : {}),
      }),
      { expiresIn: expiresInSeconds },
    );
  }

  /** Deletes a private object by key (best effort, never throws). */
  async deleteKey(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({ Bucket: this.bucketName, Key: key }),
      );
    } catch (error) {
      console.error('S3 Delete Error:', error);
    }
  }

  /**
   * A presigned PUT for a private object with a server-chosen key. The type
   * and exact size are signed, so S3 refuses an upload that differs; the
   * metadata travels in the signed query string, so the client can't
   * change it either.
   */
  async presignPut(
    key: string,
    options: {
      contentType: string;
      contentLength: number;
      metadata?: Record<string, string>;
    },
    expiresInSeconds: number,
  ): Promise<PresignedPut> {
    const url = await getSignedUrl(
      this.presignClient,
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: options.contentType,
        ContentLength: options.contentLength,
        Metadata: options.metadata,
      }),
      {
        expiresIn: expiresInSeconds,
        signableHeaders: new Set(['content-type', 'content-length']),
      },
    );
    return {
      url,
      headers: {
        'Content-Type': options.contentType,
        'Content-Length': String(options.contentLength),
      },
    };
  }

  /** An object's size, type and metadata; null when there is no such key. */
  async headObject(key: string): Promise<ObjectHead | null> {
    try {
      const head = await this.s3Client.send(
        new HeadObjectCommand({ Bucket: this.bucketName, Key: key }),
      );
      return {
        contentLength: head.ContentLength ?? 0,
        contentType: head.ContentType ?? null,
        metadata: head.Metadata ?? {},
      };
    } catch (error) {
      const status = (error as { $metadata?: { httpStatusCode?: number } })
        .$metadata?.httpStatusCode;
      if (status === 404) return null;
      throw error;
    }
  }

  /** Bytes `start`..`end` (inclusive) of an object. */
  async getRange(key: string, start: number, end: number): Promise<Buffer> {
    const object = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Range: `bytes=${start}-${end}`,
      }),
    );
    if (!object.Body) return Buffer.alloc(0);
    return Buffer.from(await object.Body.transformToByteArray());
  }

  /**
   * Streams a local file to a private object at `key` (e.g. a database
   * backup) and returns the size S3 reports back for it.
   */
  async uploadPrivateFile(
    path: string,
    key: string,
    contentType: string,
  ): Promise<number> {
    const { size } = await stat(path);
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: createReadStream(path),
        ContentLength: size,
        ContentType: contentType,
      }),
    );
    const head = await this.headObject(key);
    return head?.contentLength ?? 0;
  }

  /**
   * Whether anyone can read `key` without credentials (the bucket policy
   * makes every prefix but a few private ones public). Unknown counts as
   * readable, so callers that need privacy fail safe.
   */
  async isPubliclyReadable(key: string): Promise<boolean> {
    try {
      const res = await fetch(
        `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`,
        { method: 'HEAD' },
      );
      return res.status !== 403;
    } catch {
      return true;
    }
  }

  /**
   * Streams an object to a local file, refusing to write more than
   * `maxBytes` (the size the object was checked to have).
   */
  async downloadToFile(
    key: string,
    path: string,
    maxBytes: number,
  ): Promise<void> {
    const object = await this.s3Client.send(
      new GetObjectCommand({ Bucket: this.bucketName, Key: key }),
    );
    if (!(object.Body instanceof Readable)) {
      throw new InternalServerErrorException('Unexpected S3 body');
    }
    let written = 0;
    const body = object.Body;
    body.on('data', (chunk: Buffer) => {
      written += chunk.length;
      if (written > maxBytes)
        body.destroy(new Error('Object larger than expected'));
    });
    await pipeline(body, createWriteStream(path, { mode: 0o600 }));
  }

  /** One page of the keys under a prefix. */
  async listKeys(
    prefix: string,
    continuationToken?: string,
  ): Promise<{ objects: ListedObject[]; nextToken: string | null }> {
    const page = await this.s3Client.send(
      new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );
    return {
      objects: (page.Contents ?? []).flatMap((o) =>
        o.Key ? [{ key: o.Key, lastModified: o.LastModified ?? null }] : [],
      ),
      nextToken: page.IsTruncated ? (page.NextContinuationToken ?? null) : null,
    };
  }

  /**
   * Deletes keys and says which ones could not be deleted, so a caller can
   * keep its records until the files are really gone. A key that doesn't
   * exist counts as deleted (S3 reports success), so this is safe to repeat.
   */
  async deleteKeysReporting(keys: string[]): Promise<{ failed: string[] }> {
    const failed: string[] = [];
    for (let i = 0; i < keys.length; i += DELETE_BATCH) {
      const batch = keys.slice(i, i + DELETE_BATCH);
      try {
        const result = await this.s3Client.send(
          new DeleteObjectsCommand({
            Bucket: this.bucketName,
            Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
          }),
        );
        for (const e of result.Errors ?? []) if (e.Key) failed.push(e.Key);
      } catch (error) {
        console.error('S3 Batch Delete Error:', error);
        failed.push(...batch);
      }
    }
    return { failed };
  }

  /**
   * A signed GET for private media that no cache may store
   * (Cache-Control: private, no-store), so a deleted or expired file isn't
   * served from a copy. Apps that ignore HTTP caching (image libraries' own
   * disk caches) must be configured separately.
   */
  async signedMediaUrl(key: string, expiresInSeconds: number): Promise<string> {
    return getSignedUrl(
      this.s3Client,
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ResponseCacheControl: 'private, no-store',
      }),
      { expiresIn: expiresInSeconds },
    );
  }

  /**
   * The stable link of an object under a public prefix: `baseUrl` when given
   * (a CDN in front of the bucket), otherwise the bucket's own address.
   */
  publicUrl(key: string, baseUrl?: string): string {
    const base =
      baseUrl?.replace(/\/+$/, '') ||
      `https://${this.bucketName}.s3.${this.region}.amazonaws.com`;
    return `${base}/${key}`;
  }

  // Multiple File Uploads
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      return [];
    }

    try {
      // Map over the array of files and call the single upload logic for each one.
      // We use Promise.all to execute all S3 uploads in parallel for maximum speed.
      const uploadPromises = files.map((file) => this.uploadFile(file, folder));

      // Wait for all uploads to finish, then return the array of resulting S3 URLs
      const uploadedUrls = await Promise.all(uploadPromises);

      return uploadedUrls;
    } catch (error) {
      console.error('S3 Multiple Upload Error:', error);
      // If even one fails, we throw an error to prevent partial listing creation
      throw new InternalServerErrorException(
        'فشل في رفع بعض الصور، يرجى المحاولة مرة أخرى',
      );
    }
  }
}
