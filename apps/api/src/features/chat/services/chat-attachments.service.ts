import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AttachmentKind, Prisma } from '@prisma/client';
import heicConvert from 'heic-convert';
import { extname } from 'path';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { StorageService } from 'src/core/storage/storage.service';

export const MAX_ATTACHMENTS = 10;
const MB = 1024 * 1024;
const IMAGE_MAX_BYTES = 10 * MB;
const FILE_MAX_BYTES = 20 * MB;
export const VIDEO_MAX_BYTES = 100 * MB;
const AUDIO_MAX_BYTES = 10 * MB;
const THUMBNAIL_MAX_BYTES = 2 * MB;
// Generous caps on the reported length (videos up to 2 min, voice 5 min)
const VIDEO_MAX_MS = 3 * 60 * 1000;
const AUDIO_MAX_MS = 6 * 60 * 1000;
const MAX_BYTES: Record<AttachmentKind, number> = {
  IMAGE: IMAGE_MAX_BYTES,
  FILE: FILE_MAX_BYTES,
  VIDEO: VIDEO_MAX_BYTES,
  AUDIO: AUDIO_MAX_BYTES,
};
// Uploaded but never sent: removed after this long
const ORPHAN_AFTER_MS = 24 * 60 * 60 * 1000;

const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);
const VIDEO_TYPES = new Set(['video/mp4', 'video/quicktime']);
const AUDIO_TYPES = new Set([
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/aac',
  'audio/mpeg',
]);
const FILE_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

type StoredAttachment = {
  id: string;
  kind: AttachmentKind;
  storageKey: string;
  fileName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  thumbnailKey: string | null;
};

/** Extra details sent with the upload, in the files' order. */
export interface UploadExtras {
  // Video stills, one per video (in the videos' order)
  thumbnails?: Express.Multer.File[];
  // Length of each file in ms (null for photos / documents)
  durations?: (number | null)[];
}

/** The message type for what's sent together. */
export function messageTypeFor(kinds: AttachmentKind[]) {
  if (kinds.includes('AUDIO')) {
    if (kinds.length > 1) {
      throw new BadRequestException('الرسالة الصوتية تُرسل وحدها');
    }
    return 'VOICE' as const;
  }
  if (kinds.includes('VIDEO')) return 'VIDEO' as const;
  if (kinds.every((k) => k === 'IMAGE')) return 'IMAGE' as const;
  return 'FILE' as const;
}

/** The kind of an upload, or null when its type isn't allowed. */
export function attachmentKind(mimeType: string): AttachmentKind | null {
  if (IMAGE_TYPES.has(mimeType)) return 'IMAGE';
  if (FILE_TYPES.has(mimeType)) return 'FILE';
  if (VIDEO_TYPES.has(mimeType)) return 'VIDEO';
  if (AUDIO_TYPES.has(mimeType)) return 'AUDIO';
  return null;
}

/**
 * Chat photos and documents. Files are stored privately (under chat/) and
 * only reachable through short-lived signed links handed to the
 * conversation's personas. Uploaded first, then attached to the message
 * they're sent with.
 */
/**
 * "Buyootna QA.pdf", not "Buyootna%20QA.pdf": the iOS document picker can
 * send names still URL-encoded, and they were stored and shown that way.
 * A name that isn't valid encoding ("عقد 100%.pdf") is kept as it is.
 */
export function readableFileName(name: string): string {
  if (!/%[0-9A-Fa-f]{2}/.test(name)) return name;
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}

@Injectable()
export class ChatAttachmentsService {
  private readonly logger = new Logger(ChatAttachmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  private async assertParticipant(identityId: string, conversationId: string) {
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: { conversationId, identityId },
      select: { id: true },
    });
    if (!participant) {
      throw new ForbiddenException('ليس لديك صلاحية في هذه المحادثة');
    }
  }

  /** Validates and stores the files; returns them, not yet sent. */
  async upload(
    identityId: string,
    conversationId: string,
    files: Express.Multer.File[],
    extras: UploadExtras = {},
  ) {
    await this.assertParticipant(identityId, conversationId);
    if (!files?.length) throw new BadRequestException('لم يتم إرفاق أي ملف');
    if (files.length > MAX_ATTACHMENTS) {
      throw new BadRequestException(
        `يمكن إرسال ${MAX_ATTACHMENTS} ملفات كحد أقصى في المرة الواحدة`,
      );
    }

    // Check everything before storing anything
    const checked = files.map((file) => {
      const kind = attachmentKind(file.mimetype);
      if (!kind) {
        throw new BadRequestException(
          'نوع الملف غير مدعوم. المسموح: الصور والفيديو و PDF و Word و Excel',
        );
      }
      const max = MAX_BYTES[kind];
      if (file.size > max) {
        throw new BadRequestException(
          `حجم الملف ${file.originalname} أكبر من ${max / MB} ميجابايت`,
        );
      }
      return { file, kind };
    });
    // A voice note goes alone
    messageTypeFor(checked.map((c) => c.kind));

    // Video stills, in the videos' order
    const thumbnails = extras.thumbnails ?? [];
    for (const thumb of thumbnails) {
      if (
        !IMAGE_TYPES.has(thumb.mimetype) ||
        thumb.size > THUMBNAIL_MAX_BYTES
      ) {
        throw new BadRequestException('صورة الفيديو المصغرة غير صالحة');
      }
    }
    let videoIndex = 0;

    const stored: StoredAttachment[] = [];
    for (const [index, { file, kind }] of checked.entries()) {
      let body = file.buffer;
      let mimeType = file.mimetype;
      let fileName = readableFileName(file.originalname || 'file');
      // iPhone photos: HEIC isn't viewable everywhere, store JPEG
      if (mimeType === 'image/heic' || mimeType === 'image/heif') {
        body = Buffer.from(
          await heicConvert({
            buffer: file.buffer,
            format: 'JPEG',
            quality: 0.85,
          }),
        );
        mimeType = 'image/jpeg';
        fileName = fileName.replace(/\.(heic|heif)$/i, '.jpg');
      }
      const ext =
        extname(fileName) ||
        { IMAGE: '.jpg', VIDEO: '.mp4', AUDIO: '.m4a', FILE: '' }[kind];
      const storageKey = await this.storage.uploadPrivate(
        body,
        `chat/${conversationId}`,
        ext,
        mimeType,
      );

      // Length (video / voice) and the video's still
      const maxMs = kind === 'VIDEO' ? VIDEO_MAX_MS : AUDIO_MAX_MS;
      const reported = Number(extras.durations?.[index]);
      const durationMs =
        (kind === 'VIDEO' || kind === 'AUDIO') &&
        Number.isFinite(reported) &&
        reported > 0
          ? Math.min(Math.round(reported), maxMs)
          : null;
      const thumbnail = kind === 'VIDEO' ? thumbnails[videoIndex++] : undefined;
      const thumbnailKey = thumbnail
        ? await this.storage.uploadPrivate(
            thumbnail.buffer,
            `chat/${conversationId}`,
            '.jpg',
            thumbnail.mimetype,
          )
        : null;
      stored.push(
        await this.prisma.messageAttachment.create({
          data: {
            conversationId,
            uploaderIdentityId: identityId,
            kind,
            storageKey,
            fileName,
            mimeType,
            size: body.length,
            durationMs,
            thumbnailKey,
          },
          select: ATTACHMENT_SELECT,
        }),
      );
    }

    return { data: await this.present(stored) };
  }

  /**
   * Links this persona's unsent uploads to the message being sent. Every id
   * must be its own, in this conversation, and not already sent.
   */
  async claim(
    tx: Prisma.TransactionClient,
    identityId: string,
    conversationId: string,
    attachmentIds: string[],
    messageId: string,
  ): Promise<StoredAttachment[]> {
    const ids = [...new Set(attachmentIds)].slice(0, MAX_ATTACHMENTS);
    const found = await tx.messageAttachment.findMany({
      where: {
        id: { in: ids },
        conversationId,
        uploaderIdentityId: identityId,
        messageId: null,
      },
      select: ATTACHMENT_SELECT,
    });
    if (found.length !== ids.length) {
      throw new BadRequestException('بعض المرفقات غير صالحة أو أُرسلت مسبقاً');
    }
    await tx.messageAttachment.updateMany({
      where: { id: { in: ids } },
      data: { messageId },
    });
    // Keep the order the user picked
    return ids.map((id) => found.find((a) => a.id === id)!);
  }

  /** Attachments as the app gets them, each with a fresh signed link. */
  async present(attachments: StoredAttachment[]) {
    return Promise.all(
      attachments.map(async (a) => ({
        id: a.id,
        kind: a.kind,
        fileName: a.fileName,
        mimeType: a.mimeType,
        size: a.size,
        width: a.width,
        height: a.height,
        durationMs: a.durationMs,
        url: await this.storage.signedUrl(a.storageKey, undefined, a.fileName),
        thumbnailUrl: a.thumbnailKey
          ? await this.storage.signedUrl(a.thumbnailKey)
          : null,
      })),
    );
  }

  /** A new signed link once the old one expired (participants only). */
  async urlFor(identityId: string, attachmentId: string) {
    const attachment = await this.prisma.messageAttachment.findUnique({
      where: { id: attachmentId },
      select: { ...ATTACHMENT_SELECT, conversationId: true },
    });
    if (!attachment) throw new NotFoundException('الملف غير موجود');
    await this.assertParticipant(identityId, attachment.conversationId);
    return {
      url: await this.storage.signedUrl(
        attachment.storageKey,
        undefined,
        attachment.fileName,
      ),
    };
  }

  /** Daily: removes uploads that were never sent. */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async removeOrphans(now = new Date()) {
    const orphans = await this.prisma.messageAttachment.findMany({
      where: {
        messageId: null,
        createdAt: { lt: new Date(now.getTime() - ORPHAN_AFTER_MS) },
      },
      select: { id: true, storageKey: true, thumbnailKey: true },
    });
    for (const orphan of orphans) {
      await this.storage.deleteKey(orphan.storageKey);
      if (orphan.thumbnailKey)
        await this.storage.deleteKey(orphan.thumbnailKey);
    }
    if (orphans.length) {
      await this.prisma.messageAttachment.deleteMany({
        where: { id: { in: orphans.map((o) => o.id) } },
      });
      this.logger.log(`Removed ${orphans.length} unsent chat attachment(s)`);
    }
    return orphans.length;
  }
}

export const ATTACHMENT_SELECT = {
  id: true,
  kind: true,
  storageKey: true,
  fileName: true,
  mimeType: true,
  size: true,
  width: true,
  height: true,
  durationMs: true,
  thumbnailKey: true,
} as const;
