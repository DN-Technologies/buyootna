import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { ChatAttachmentsService } from './chat-attachments.service';
import { conversationSearchWhere } from './chat-conversations.service';
import { ChatMessagesService } from './chat-messages.service';
import { ChatParticipantDisplayService } from './chat-participant-display.service';
import { chatPushBody } from './chat-push.service';
import { ChatProposalsService } from './chat-proposals.service';

describe('conversationSearchWhere (chats list search)', () => {
  it('matches the ad title in Arabic: category and listing type', () => {
    const where = conversationSearchWhere('me', 'عمارة للبيع');
    expect(where.OR).toEqual(
      expect.arrayContaining([
        { property: { category: { in: ['BUILDING'] } } },
        { property: { type: { in: ['SALE'] } } },
      ]),
    );
  });

  it("matches the other person's name and visible message text", () => {
    const where = conversationSearchWhere('me', 'Ebrahim');
    expect(where.OR).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          participants: {
            some: expect.objectContaining({ identityId: { not: 'me' } }),
          },
        }),
        {
          messages: {
            some: {
              content: { contains: 'Ebrahim', mode: 'insensitive' },
              hiddenFor: { none: { identityId: 'me' } },
            },
          },
        },
      ]),
    );
  });
});

describe('ChatMessagesService.searchMessages (in-chat search)', () => {
  const prisma = {
    conversationParticipant: { findFirst: jest.fn() },
    message: { findMany: jest.fn(), count: jest.fn() },
  };
  const service = new ChatMessagesService(
    prisma as unknown as PrismaService,
    {} as ChatParticipantDisplayService,
    {} as ChatAttachmentsService,
    {} as ChatProposalsService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('finds text and file names, skipping my hidden messages, newest first', async () => {
    prisma.conversationParticipant.findFirst.mockResolvedValue({ id: 'p' });
    prisma.message.findMany.mockResolvedValue([
      { id: 'm9', createdAt: new Date() },
    ]);
    prisma.message.count.mockResolvedValue(1);

    const res = await service.searchMessages('me', 'c1', ' متاح ');

    expect(prisma.message.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          conversationId: 'c1',
          hiddenFor: { none: { identityId: 'me' } },
          OR: [
            { content: { contains: 'متاح', mode: 'insensitive' } },
            {
              attachments: {
                some: { fileName: { contains: 'متاح', mode: 'insensitive' } },
              },
            },
          ],
        },
        orderBy: { createdAt: 'desc' },
      }),
    );
    expect(res.meta.total).toBe(1);
  });

  it('is participants only', async () => {
    prisma.conversationParticipant.findFirst.mockResolvedValue(null);
    await expect(
      service.searchMessages('stranger', 'c1', 'x'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns nothing for an empty query', async () => {
    prisma.conversationParticipant.findFirst.mockResolvedValue({ id: 'p' });
    expect((await service.searchMessages('me', 'c1', '  ')).data).toEqual([]);
    expect(prisma.message.findMany).not.toHaveBeenCalled();
  });
});

describe('chatPushBody with attachments', () => {
  it('previews photos and documents', () => {
    expect(
      chatPushBody({
        type: 'IMAGE',
        attachments: [
          { kind: 'IMAGE', fileName: 'a.jpg' },
          { kind: 'IMAGE', fileName: 'b.jpg' },
          { kind: 'IMAGE', fileName: 'c.jpg' },
        ],
      }),
    ).toBe('📷 3 صور');
    expect(
      chatPushBody({
        type: 'FILE',
        attachments: [{ kind: 'FILE', fileName: 'عقد.pdf' }],
      }),
    ).toBe('📎 عقد.pdf');
  });
});
