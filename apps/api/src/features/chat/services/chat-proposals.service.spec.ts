import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';

import {
  formatKuwaitDateTime,
  formatOfferAmount,
  proposalSummary,
} from './chat-proposal-format';
import { ChatProposalsService } from './chat-proposals.service';
import { ChatPushService, chatPushBody } from './chat-push.service';

const NOW = new Date('2026-10-09T09:00:00Z'); // 12:00 Kuwait
const inMinutes = (m: number) => new Date(NOW.getTime() + m * 60 * 1000);

describe('proposal previews', () => {
  it('writes Kuwait time, 12-hour', () => {
    // 13:30 UTC = 16:30 Kuwait, a Friday
    expect(formatKuwaitDateTime(new Date('2026-10-09T13:30:00Z'))).toBe(
      'الجمعة 9/10 · 4:30 م',
    );
  });

  it('formats offers in KWD with the period', () => {
    expect(formatOfferAmount(250000)).toBe('250,000 د.ك');
    expect(formatOfferAmount(450, 'MONTHLY')).toBe('450 د.ك / شهرياً');
    expect(
      proposalSummary({ kind: 'OFFER', amount: 240000, period: 'TOTAL' }),
    ).toBe('💰 عرض سعر: 240,000 د.ك');
  });

  it('push previews for location, appointment and offer', () => {
    expect(
      chatPushBody({ type: 'LOCATION', location: { label: 'السالمية' } }),
    ).toBe('📍 السالمية');
    expect(chatPushBody({ type: 'LOCATION' })).toBe('📍 موقع');
    expect(
      chatPushBody({
        type: 'APPOINTMENT',
        proposal: {
          kind: 'APPOINTMENT',
          scheduledAt: new Date('2026-10-09T13:30:00Z'),
        },
      }),
    ).toBe('📅 موعد معاينة: الجمعة 9/10 · 4:30 م');
  });
});

describe('ChatProposalsService', () => {
  let prisma: any;
  let push: { notifyIdentities: jest.Mock };
  let service: ChatProposalsService;

  beforeEach(() => {
    prisma = {
      chatProposal: {
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(({ where }) =>
          Promise.resolve({ id: where.id, kind: 'OFFER', amount: 1 }),
        ),
        findMany: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        create: jest.fn(({ data }) => Promise.resolve({ id: 'new', ...data })),
      },
      conversationParticipant: {
        findFirst: jest.fn().mockResolvedValue({ id: 'p' }),
        findMany: jest.fn().mockResolvedValue([{ identityId: 'seller' }]),
      },
    };
    push = { notifyIdentities: jest.fn().mockResolvedValue(undefined) };
    service = new ChatProposalsService(
      prisma as unknown as PrismaService,
      push as unknown as ChatPushService,
    );
  });

  describe('parse', () => {
    it('accepts a future appointment and a positive offer', () => {
      expect(
        service.parse(
          'APPOINTMENT',
          { scheduledAt: inMinutes(120).toISOString(), note: ' بعد العصر ' },
          NOW,
        ),
      ).toMatchObject({ scheduledAt: inMinutes(120), note: 'بعد العصر' });
      expect(
        service.parse('OFFER', { amount: 240000.12345 }, NOW),
      ).toMatchObject({ amount: 240000.123, period: 'TOTAL' });
    });

    it('refuses a past or far-off appointment, and a missing or zero amount', () => {
      const bad = [
        () =>
          service.parse(
            'APPOINTMENT',
            { scheduledAt: inMinutes(-5).toISOString() },
            NOW,
          ),
        () =>
          service.parse(
            'APPOINTMENT',
            { scheduledAt: inMinutes(91 * 24 * 60).toISOString() },
            NOW,
          ),
        () => service.parse('APPOINTMENT', { scheduledAt: 'غداً' }, NOW),
        () => service.parse('OFFER', { amount: 0 }, NOW),
        () => service.parse('OFFER', {}, NOW),
        () => service.parse('OFFER', undefined, NOW),
      ];
      bad.forEach((call) => expect(call).toThrow(BadRequestException));
    });
  });

  describe('createFor (counter-offers)', () => {
    const counter = {
      kind: 'OFFER' as const,
      scheduledAt: null,
      amount: 240000,
      period: 'TOTAL' as const,
      note: null,
      counterOfId: 'o1',
    };

    it("marks the other side's pending offer COUNTERED", async () => {
      prisma.chatProposal.findUnique.mockResolvedValue({
        id: 'o1',
        kind: 'OFFER',
        messageId: 'm1',
        message: { conversationId: 'c1', senderIdentityId: 'seller' },
      });

      const res = await service.createFor(prisma, {
        identityId: 'buyer',
        conversationId: 'c1',
        messageId: 'm2',
        proposal: counter,
      });

      expect(prisma.chatProposal.updateMany).toHaveBeenCalledWith({
        where: { id: 'o1', status: 'PENDING' },
        data: expect.objectContaining({
          status: 'COUNTERED',
          respondedById: 'buyer',
        }),
      });
      expect(res.countered?.messageId).toBe('m1');
      expect(prisma.chatProposal.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            messageId: 'm2',
            counterOfId: 'o1',
            amount: 240000,
          }),
        }),
      );
    });

    it('refuses countering my own offer, another chat, or an answered one', async () => {
      const call = () =>
        service.createFor(prisma, {
          identityId: 'buyer',
          conversationId: 'c1',
          messageId: 'm2',
          proposal: counter,
        });

      prisma.chatProposal.findUnique.mockResolvedValue({
        id: 'o1',
        kind: 'OFFER',
        messageId: 'm1',
        message: { conversationId: 'c1', senderIdentityId: 'buyer' },
      });
      await expect(call()).rejects.toBeInstanceOf(BadRequestException);

      prisma.chatProposal.findUnique.mockResolvedValue({
        id: 'o1',
        kind: 'OFFER',
        messageId: 'm1',
        message: { conversationId: 'other', senderIdentityId: 'seller' },
      });
      await expect(call()).rejects.toBeInstanceOf(BadRequestException);

      prisma.chatProposal.findUnique.mockResolvedValue({
        id: 'o1',
        kind: 'OFFER',
        messageId: 'm1',
        message: { conversationId: 'c1', senderIdentityId: 'seller' },
      });
      prisma.chatProposal.updateMany.mockResolvedValue({ count: 0 });
      await expect(call()).rejects.toThrow('مسبقاً');
      expect(prisma.chatProposal.create).not.toHaveBeenCalled();
    });
  });

  describe('respond', () => {
    const pending = (over = {}) => ({
      id: 'o1',
      kind: 'OFFER',
      status: 'PENDING',
      scheduledAt: null,
      messageId: 'm1',
      message: { conversationId: 'c1', senderIdentityId: 'seller' },
      ...over,
    });

    it('the other side accepts; the sender is told', async () => {
      prisma.chatProposal.findUnique.mockResolvedValue(pending());

      const res = await service.respond('buyer', 'o1', 'accept', NOW);

      expect(prisma.chatProposal.updateMany).toHaveBeenCalledWith({
        where: { id: 'o1', status: 'PENDING' },
        data: { status: 'ACCEPTED', respondedById: 'buyer', respondedAt: NOW },
      });
      expect(res).toMatchObject({ conversationId: 'c1', messageId: 'm1' });
      expect(push.notifyIdentities).toHaveBeenCalledWith(
        ['seller'],
        expect.objectContaining({
          fromIdentityId: 'buyer',
          body: expect.stringContaining('قبل عرض السعر'),
        }),
      );
    });

    it('only the sender cancels; the sender cannot accept their own', async () => {
      prisma.chatProposal.findUnique.mockResolvedValue(pending());
      await expect(
        service.respond('buyer', 'o1', 'cancel', NOW),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        service.respond('seller', 'o1', 'accept', NOW),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await service.respond('seller', 'o1', 'cancel', NOW);
      expect(prisma.chatProposal.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'CANCELLED' }),
        }),
      );
    });

    it('refuses an answered proposal, a past appointment, and outsiders', async () => {
      prisma.chatProposal.findUnique.mockResolvedValue(
        pending({ status: 'DECLINED' }),
      );
      await expect(
        service.respond('buyer', 'o1', 'accept', NOW),
      ).rejects.toBeInstanceOf(BadRequestException);

      prisma.chatProposal.findUnique.mockResolvedValue(
        pending({ kind: 'APPOINTMENT', scheduledAt: inMinutes(-1) }),
      );
      await expect(
        service.respond('buyer', 'o1', 'accept', NOW),
      ).rejects.toThrow('انتهى');

      prisma.conversationParticipant.findFirst.mockResolvedValue(null);
      await expect(
        service.respond('stranger', 'o1', 'accept', NOW),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('loses the race cleanly when the other side answered first', async () => {
      prisma.chatProposal.findUnique.mockResolvedValue(pending());
      prisma.chatProposal.updateMany.mockResolvedValue({ count: 0 });
      await expect(
        service.respond('buyer', 'o1', 'decline', NOW),
      ).rejects.toThrow('مسبقاً');
      expect(push.notifyIdentities).not.toHaveBeenCalled();
    });
  });

  describe('sendReminders', () => {
    it('reminds both people within the hour before an accepted appointment, once', async () => {
      prisma.chatProposal.findMany.mockResolvedValue([
        {
          id: 'a1',
          scheduledAt: new Date('2026-10-09T09:40:00Z'),
          message: {
            conversationId: 'c1',
            conversation: {
              participants: [{ identityId: 'buyer' }, { identityId: 'seller' }],
              property: { category: 'BUILDING', type: 'SALE' },
            },
          },
        },
        {
          id: 'a2',
          scheduledAt: inMinutes(30),
          message: {
            conversationId: 'c2',
            conversation: { participants: [], property: null },
          },
        },
      ]);
      // a2 was claimed by another instance
      prisma.chatProposal.updateMany
        .mockResolvedValueOnce({ count: 1 })
        .mockResolvedValueOnce({ count: 0 });

      expect(await service.sendReminders(NOW)).toBe(1);
      expect(prisma.chatProposal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            kind: 'APPOINTMENT',
            status: 'ACCEPTED',
            remindedAt: null,
            scheduledAt: { gt: NOW, lte: inMinutes(60) },
          },
        }),
      );
      expect(push.notifyIdentities).toHaveBeenCalledTimes(1);
      expect(push.notifyIdentities).toHaveBeenCalledWith(['buyer', 'seller'], {
        conversationId: 'c1',
        title: 'تذكير بموعد المعاينة',
        body: 'الجمعة 9/10 · 12:40 م · عمارة للبيع',
      });
    });
  });
});
