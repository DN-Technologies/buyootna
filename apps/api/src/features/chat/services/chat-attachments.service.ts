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
// Uploaded but never sent: removed after this long
const ORPHAN_AFTER_MS = 24 * 60 * 60 * 1000;

const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
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
};

/** The kind of an upload, or null when its type isn't allowed. */
export function attachmentKind(mimeType: string): AttachmentKind | null {
  if (IMAGE_TYPES.has(mimeType)) return 'IMAGE';
  if (FILE_TYPES.has(mimeType)) return 'FILE';
  return null;
}

/**
 * Chat photos and documents. Files are stored privately (under chat/) and
 * only reachable through short-lived signed links handed to the
 * conversation's personas. Uploaded first, then attached to the message
 * they're sent with.
 */
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
          'نوع الملف غير مدعوم. المسموح: الصور و PDF و Word و Excel',
        );
      }
      const max = kind === 'IMAGE' ? IMAGE_MAX_BYTES : FILE_MAX_BYTES;
      if (file.size > max) {
        throw new BadRequestException(
          `حجم الملف ${file.originalname} أكبر من ${max / MB} ميجابايت`,
        );
      }
      return { file, kind };
    });

    const stored: StoredAttachment[] = [];
    for (const { file, kind } of checked) {
      let body = file.buffer;
      let mimeType = file.mimetype;
      let fileName = file.originalname || 'file';
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
      const ext = extname(fileName) || (kind === 'IMAGE' ? '.jpg' : '');
      const storageKey = await this.storage.uploadPrivate(
        body,
        `chat/${conversationId}`,
        ext,
        mimeType,
      );
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
        url: await this.storage.signedUrl(a.storageKey, undefined, a.fileName),
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
      select: { id: true, storageKey: true },
    });
    for (const orphan of orphans) {
      await this.storage.deleteKey(orphan.storageKey);
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
} as const;
