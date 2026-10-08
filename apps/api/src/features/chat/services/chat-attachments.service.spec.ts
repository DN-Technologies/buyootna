import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { StorageService } from 'src/core/storage/storage.service';
import {
  attachmentKind,
  ChatAttachmentsService,
  MAX_ATTACHMENTS,
} from './chat-attachments.service';

const file = (over: Partial<Express.Multer.File> = {}) =>
  ({
    originalname: 'photo.jpg',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('x'),
    ...over,
  }) as Express.Multer.File;

describe('attachmentKind', () => {
  it('accepts photos and PDF / Word / Excel, nothing else', () => {
    expect(attachmentKind('image/png')).toBe('IMAGE');
    expect(attachmentKind('application/pdf')).toBe('FILE');
    expect(
      attachmentKind(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ),
    ).toBe('FILE');
    expect(attachmentKind('application/zip')).toBeNull();
    expect(attachmentKind('video/mp4')).toBeNull();
  });
});

describe('ChatAttachmentsService', () => {
  let prisma: any;
  let storage: {
    uploadPrivate: jest.Mock;
    signedUrl: jest.Mock;
    deleteKey: jest.Mock;
  };
  let service: ChatAttachmentsService;

  beforeEach(() => {
    prisma = {
      conversationParticipant: {
        findFirst: jest.fn().mockResolvedValue({ id: 'p' }),
      },
      messageAttachment: {
        create: jest.fn(({ data }) =>
          Promise.resolve({
            id: `a-${data.fileName}`,
            width: null,
            height: null,
            ...data,
          }),
        ),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
      },
    };
    storage = {
      uploadPrivate: jest.fn().mockResolvedValue('chat/c1/key.jpg'),
      signedUrl: jest.fn().mockResolvedValue('https://signed/url'),
      deleteKey: jest.fn(),
    };
    service = new ChatAttachmentsService(
      prisma as unknown as PrismaService,
      storage as unknown as StorageService,
    );
  });

  describe('upload', () => {
    it('stores files privately under chat/<conversation> and returns signed links', async () => {
      const res = await service.upload('me', 'c1', [
        file(),
        file({ originalname: 'عقد.pdf', mimetype: 'application/pdf' }),
      ]);

      expect(storage.uploadPrivate).toHaveBeenCalledWith(
        expect.any(Buffer),
        'chat/c1',
        '.jpg',
        'image/jpeg',
      );
      expect(prisma.messageAttachment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            conversationId: 'c1',
            uploaderIdentityId: 'me',
            kind: 'FILE',
            fileName: 'عقد.pdf',
            storageKey: 'chat/c1/key.jpg',
          }),
        }),
      );
      expect(res.data).toHaveLength(2);
      expect(res.data[0]).toMatchObject({
        kind: 'IMAGE',
        url: 'https://signed/url',
      });
      // Never the storage key
      expect(res.data[0]).not.toHaveProperty('storageKey');
    });

    it('refuses a non-participant', async () => {
      prisma.conversationParticipant.findFirst.mockResolvedValue(null);
      await expect(
        service.upload('stranger', 'c1', [file()]),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(storage.uploadPrivate).not.toHaveBeenCalled();
    });

    it('refuses an unsupported type, an oversize file, or too many files -- storing nothing', async () => {
      await expect(
        service.upload('me', 'c1', [
          file(),
          file({ mimetype: 'application/zip' }),
        ]),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        service.upload('me', 'c1', [file({ size: 11 * 1024 * 1024 })]),
      ).rejects.toThrow('ميجابايت');
      await expect(
        service.upload(
          'me',
          'c1',
          Array.from({ length: MAX_ATTACHMENTS + 1 }, () => file()),
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(storage.uploadPrivate).not.toHaveBeenCalled();
    });

    it('allows documents up to 20 MB', async () => {
      await service.upload('me', 'c1', [
        file({
          mimetype: 'application/pdf',
          originalname: 'x.pdf',
          size: 19 * 1024 * 1024,
        }),
      ]);
      expect(storage.uploadPrivate).toHaveBeenCalled();
    });
  });

  describe('claim', () => {
    const tx = () => ({
      messageAttachment: {
        findMany: jest.fn(),
        updateMany: jest.fn(),
      },
    });

    it('links my unsent uploads to the message, in the order sent', async () => {
      const t = tx();
      t.messageAttachment.findMany.mockResolvedValue([
        { id: 'b', kind: 'IMAGE' },
        { id: 'a', kind: 'IMAGE' },
      ]);

      const claimed = await service.claim(
        t as any,
        'me',
        'c1',
        ['a', 'b'],
        'm1',
      );

      expect(t.messageAttachment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: { in: ['a', 'b'] },
            conversationId: 'c1',
            uploaderIdentityId: 'me',
            messageId: null,
          },
        }),
      );
      expect(t.messageAttachment.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['a', 'b'] } },
        data: { messageId: 'm1' },
      });
      expect(claimed.map((a) => a.id)).toEqual(['a', 'b']);
    });

    it("refuses someone else's, another chat's, or an already-sent upload", async () => {
      const t = tx();
      t.messageAttachment.findMany.mockResolvedValue([{ id: 'a' }]);

      await expect(
        service.claim(t as any, 'me', 'c1', ['a', 'not-mine'], 'm1'),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(t.messageAttachment.updateMany).not.toHaveBeenCalled();
    });
  });

  it('re-signs a link for participants only', async () => {
    prisma.messageAttachment.findUnique.mockResolvedValue({
      id: 'a',
      conversationId: 'c1',
      storageKey: 'chat/c1/k',
      fileName: 'عقد.pdf',
    });

    expect(await service.urlFor('me', 'a')).toEqual({
      url: 'https://signed/url',
    });
    expect(storage.signedUrl).toHaveBeenCalledWith(
      'chat/c1/k',
      undefined,
      'عقد.pdf',
    );

    prisma.conversationParticipant.findFirst.mockResolvedValue(null);
    await expect(service.urlFor('stranger', 'a')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('removes uploads never sent after a day', async () => {
    prisma.messageAttachment.findMany.mockResolvedValue([
      { id: 'o1', storageKey: 'chat/c1/o1' },
    ]);
    const now = new Date('2026-10-09T03:00:00Z');

    expect(await service.removeOrphans(now)).toBe(1);
    expect(prisma.messageAttachment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          messageId: null,
          createdAt: { lt: new Date('2026-10-08T03:00:00Z') },
        },
      }),
    );
    expect(storage.deleteKey).toHaveBeenCalledWith('chat/c1/o1');
    expect(prisma.messageAttachment.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['o1'] } },
    });
  });
});
