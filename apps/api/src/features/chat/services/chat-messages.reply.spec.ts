import { NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { ChatMessagesService, replyPreview } from './chat-messages.service';
import { ChatParticipantDisplayService } from './chat-participant-display.service';

describe('replyPreview', () => {
  const source = {
    id: 'm1',
    type: 'TEXT',
    content: 'هل العقار متاح؟',
    imageUrl: null,
    senderIdentityId: 'them',
  };

  it('is null for a message that is not a reply', () => {
    expect(replyPreview(null, null)).toBeNull();
  });

  it('quotes the original, marking whose it is for the viewer', () => {
    expect(replyPreview('m1', source, 'me')).toMatchObject({
      id: 'm1',
      content: 'هل العقار متاح؟',
      isMine: false,
      senderIdentityId: 'them',
    });
    expect(replyPreview('m1', source, 'them')).toMatchObject({ isMine: true });
  });

  it('trims a long original', () => {
    const long = { ...source, content: 'أ'.repeat(200) };
    expect(replyPreview('m1', long)).toMatchObject({
      content: expect.stringMatching(/^أ{120}…$/),
    });
  });

  it('shows a deleted original, or one the viewer hid, as deleted', () => {
    expect(replyPreview('m1', null, 'me')).toEqual({ id: 'm1', deleted: true });
    expect(
      replyPreview(
        'm1',
        { ...source, hiddenFor: [{ identityId: 'me' }] },
        'me',
      ),
    ).toEqual({ id: 'm1', deleted: true });
  });
});

describe('ChatMessagesService replies and hiding', () => {
  let prisma: any;
  let service: ChatMessagesService;

  beforeEach(() => {
    const tx = {
      message: {
        create: jest.fn(({ data }) =>
          Promise.resolve({
            id: 'new',
            createdAt: new Date('2026-10-08T10:00:00Z'),
            ...data,
          }),
        ),
      },
      conversation: { findUnique: jest.fn(), update: jest.fn() },
      conversationParticipant: { updateMany: jest.fn() },
    };
    prisma = {
      conversationParticipant: {
        findFirst: jest.fn().mockResolvedValue({ id: 'p' }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      message: { findFirst: jest.fn(), findUnique: jest.fn() },
      messageHidden: { upsert: jest.fn().mockResolvedValue({}) },
      $transaction: jest.fn((fn) => fn(tx)),
      tx,
    };
    service = new ChatMessagesService(
      prisma as unknown as PrismaService,
      {} as ChatParticipantDisplayService,
    );
  });

  it('sends a reply quoting a message of the same conversation', async () => {
    prisma.message.findFirst.mockResolvedValue({
      id: 'm1',
      type: 'TEXT',
      content: 'هاي',
      imageUrl: null,
      senderIdentityId: 'them',
    });

    const sent = await service.sendMessage(
      { userId: 'u', identityId: 'me' },
      'c1',
      { content: 'أهلاً', replyToId: 'm1' },
    );

    expect(prisma.message.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'm1', conversationId: 'c1' } }),
    );
    expect(prisma.tx.message.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ replyToId: 'm1' }),
    });
    expect(sent.replyTo).toMatchObject({ id: 'm1', content: 'هاي' });
  });

  it('ignores a replyToId from another conversation', async () => {
    prisma.message.findFirst.mockResolvedValue(null);

    const sent = await service.sendMessage(
      { userId: 'u', identityId: 'me' },
      'c1',
      { content: 'أهلاً', replyToId: 'elsewhere' },
    );

    expect(prisma.tx.message.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ replyToId: null }),
    });
    expect(sent.replyTo).toBeNull();
  });

  it('hides a message for this persona only', async () => {
    prisma.message.findUnique.mockResolvedValue({ conversationId: 'c1' });

    await service.hideMessage('me', 'm1');

    expect(prisma.messageHidden.upsert).toHaveBeenCalledWith({
      where: { messageId_identityId: { messageId: 'm1', identityId: 'me' } },
      create: { messageId: 'm1', identityId: 'me' },
      update: {},
    });
  });

  it("can't hide a message in someone else's conversation", async () => {
    prisma.message.findUnique.mockResolvedValue({ conversationId: 'c9' });
    prisma.conversationParticipant.findFirst.mockResolvedValue(null);

    await expect(service.hideMessage('me', 'm1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.messageHidden.upsert).not.toHaveBeenCalled();
  });
});
