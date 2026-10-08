import { PrismaService } from 'src/core/prisma/prisma.service';

import { ChatReceiptsService, receiptOf } from './chat-receipts.service';

const NOW = new Date('2026-10-09T10:00:00Z');
const EARLIER = new Date('2026-10-09T09:00:00Z');

describe('receiptOf', () => {
  it('reading implies delivery', () => {
    expect(receiptOf({ lastDeliveredAt: EARLIER, lastReadAt: NOW })).toEqual({
      lastDeliveredAt: NOW,
      lastReadAt: NOW,
    });
    expect(receiptOf({ lastDeliveredAt: null, lastReadAt: NOW })).toEqual({
      lastDeliveredAt: NOW,
      lastReadAt: NOW,
    });
  });

  it('delivered but not read yet', () => {
    expect(receiptOf({ lastDeliveredAt: NOW, lastReadAt: EARLIER })).toEqual({
      lastDeliveredAt: NOW,
      lastReadAt: EARLIER,
    });
    expect(receiptOf(null)).toBeNull();
  });
});

describe('ChatReceiptsService', () => {
  let prisma: any;
  let service: ChatReceiptsService;

  beforeEach(() => {
    prisma = {
      $queryRaw: jest.fn(),
      conversationParticipant: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findMany: jest.fn(),
      },
    };
    service = new ChatReceiptsService(prisma as unknown as PrismaService);
  });

  it('opening a chat marks it read and delivered, and names who to tell', async () => {
    prisma.conversationParticipant.findMany.mockResolvedValue([
      { identityId: 'seller' },
    ]);

    expect(await service.markRead('buyer', 'c1', NOW)).toEqual({
      conversationId: 'c1',
      identityId: 'buyer',
      lastDeliveredAt: NOW,
      lastReadAt: NOW,
      notifyIdentityIds: ['seller'],
    });
    expect(prisma.conversationParticipant.updateMany).toHaveBeenCalledWith({
      where: { conversationId: 'c1', identityId: 'buyer' },
      data: { lastReadAt: NOW, lastDeliveredAt: NOW },
    });
  });

  it("gives no receipt for a conversation the persona isn't in", async () => {
    prisma.conversationParticipant.updateMany.mockResolvedValue({ count: 0 });
    expect(await service.markRead('stranger', 'c1', NOW)).toBeNull();
  });

  it('coming online delivers what was waiting, one receipt per conversation', async () => {
    prisma.$queryRaw.mockResolvedValue([
      { conversationId: 'c1' },
      { conversationId: 'c2' },
    ]);
    prisma.conversationParticipant.findMany.mockResolvedValue([
      { conversationId: 'c1', identityId: 'buyer', lastReadAt: EARLIER },
      { conversationId: 'c1', identityId: 'seller', lastReadAt: null },
      { conversationId: 'c2', identityId: 'buyer', lastReadAt: null },
      { conversationId: 'c2', identityId: 'office', lastReadAt: null },
    ]);

    const receipts = await service.markDelivered('buyer', NOW);

    expect(prisma.conversationParticipant.updateMany).toHaveBeenCalledWith({
      where: { identityId: 'buyer', conversationId: { in: ['c1', 'c2'] } },
      data: { lastDeliveredAt: NOW },
    });
    expect(receipts).toEqual([
      {
        conversationId: 'c1',
        identityId: 'buyer',
        lastDeliveredAt: NOW,
        lastReadAt: EARLIER,
        notifyIdentityIds: ['seller'],
      },
      {
        conversationId: 'c2',
        identityId: 'buyer',
        lastDeliveredAt: NOW,
        lastReadAt: null,
        notifyIdentityIds: ['office'],
      },
    ]);
    // Only messages from others, newer than what was already delivered
    const sql = (prisma.$queryRaw.mock.calls[0][0] as string[]).join('?');
    expect(sql).toContain('"senderIdentityId" IS DISTINCT FROM');
    expect(sql).toContain('"lastDeliveredAt"');
  });

  it('nothing waiting: no writes, no receipts', async () => {
    prisma.$queryRaw.mockResolvedValue([]);
    expect(await service.markDelivered('buyer', NOW)).toEqual([]);
    expect(prisma.conversationParticipant.updateMany).not.toHaveBeenCalled();
  });

  it('a sent message is delivered only to recipients connected right now', async () => {
    prisma.conversationParticipant.findMany.mockResolvedValue([
      { conversationId: 'c1', identityId: 'buyer', lastReadAt: null },
      { conversationId: 'c1', identityId: 'seller', lastReadAt: null },
    ]);

    expect(await service.markDeliveredTo([], 'c1', NOW)).toEqual([]);
    expect(prisma.conversationParticipant.updateMany).not.toHaveBeenCalled();

    const [receipt] = await service.markDeliveredTo(['buyer'], 'c1', NOW);
    expect(receipt).toMatchObject({
      identityId: 'buyer',
      lastDeliveredAt: NOW,
      notifyIdentityIds: ['seller'],
    });
  });
});
