import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';

import { ChatAttachmentsService } from './chat-attachments.service';
import { ChatMessagesService, propertyCard } from './chat-messages.service';
import { ChatParticipantDisplayService } from './chat-participant-display.service';
import { ChatProposalsService } from './chat-proposals.service';

const sender = { userId: 'u-me', identityId: 'me' };

describe('ChatMessagesService — location, shared ads, proposals', () => {
  let prisma: any;
  let tx: any;
  let proposals: { parse: jest.Mock; createFor: jest.Mock };
  let service: ChatMessagesService;

  beforeEach(() => {
    tx = {
      message: {
        create: jest.fn(({ data }) =>
          Promise.resolve({
            id: 'm1',
            createdAt: new Date('2026-10-09T09:00:00Z'),
            imageUrl: null,
            latitude: null,
            longitude: null,
            locationLabel: null,
            ...data,
          }),
        ),
        update: jest.fn(),
      },
      conversation: { update: jest.fn(), findUnique: jest.fn() },
      conversationParticipant: { updateMany: jest.fn() },
    };
    prisma = {
      conversationParticipant: {
        findFirst: jest.fn().mockResolvedValue({ id: 'p' }),
        // The other participant, with a live account
        findMany: jest
          .fn()
          .mockResolvedValue([
            { identity: { user: { isDisabled: false, isBlocked: false } } },
          ]),
      },
      conversation: {
        findUnique: jest.fn().mockResolvedValue({ propertyId: 'chat-ad' }),
      },
      property: { findUnique: jest.fn() },
      message: { findFirst: jest.fn() },
      $transaction: jest.fn((fn) => fn(tx)),
    };
    proposals = { parse: jest.fn(), createFor: jest.fn() };
    service = new ChatMessagesService(
      prisma as unknown as PrismaService,
      {} as ChatParticipantDisplayService,
      {} as ChatAttachmentsService,
      proposals as unknown as ChatProposalsService,
    );
  });

  it('sends a map pin with its address', async () => {
    const res = await service.sendMessage(sender, 'c1', {
      type: 'LOCATION',
      latitude: 29.33,
      longitude: 48.07,
      locationLabel: ' السالمية، قطعة 5 ',
    });
    expect(tx.message.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: 'LOCATION',
        latitude: 29.33,
        longitude: 48.07,
        locationLabel: 'السالمية، قطعة 5',
      }),
    });
    expect(res.location).toEqual({
      latitude: 29.33,
      longitude: 48.07,
      label: 'السالمية، قطعة 5',
    });
  });

  it('refuses a pin without valid coordinates', async () => {
    await expect(
      service.sendMessage(sender, 'c1', {
        type: 'LOCATION',
        latitude: 120,
        longitude: 48,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.sendMessage(sender, 'c1', { type: 'LOCATION' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  const ad = (over = {}) => ({
    id: 'ad-2',
    status: 'ACTIVE',
    images: ['https://img/1.jpg'],
    price: 250000,
    category: 'BUILDING',
    type: 'SALE',
    areaSize: 750,
    beds: null,
    baths: null,
    location: 'الفروانية',
    ...over,
  });

  it('shares another live ad as a card of that ad', async () => {
    prisma.property.findUnique.mockResolvedValue(ad());
    const res = await service.sendMessage(sender, 'c1', {
      type: 'PROPERTY',
      propertyId: 'ad-2',
    });
    expect(res.property).toMatchObject({ id: 'ad-2', unavailable: false });
  });

  it("refuses sharing an ad that's not live (or gone)", async () => {
    prisma.property.findUnique.mockResolvedValue(ad({ status: 'EXPIRED' }));
    await expect(
      service.sendMessage(sender, 'c1', {
        type: 'PROPERTY',
        propertyId: 'ad-2',
      }),
    ).rejects.toThrow('الإعلان غير متاح');
    prisma.property.findUnique.mockResolvedValue(null);
    await expect(
      service.sendMessage(sender, 'c1', {
        type: 'PROPERTY',
        propertyId: 'nope',
      }),
    ).rejects.toThrow('الإعلان غير متاح');
  });

  it("the chat's own ad can be sent even after it expired", async () => {
    prisma.property.findUnique.mockResolvedValue(
      ad({ id: 'chat-ad', status: 'EXPIRED' }),
    );
    const res = await service.sendMessage(sender, 'c1', {
      type: 'PROPERTY',
      propertyId: 'chat-ad',
    });
    expect(res.property).toMatchObject({ id: 'chat-ad', unavailable: true });
  });

  it('creates the offer with its message and reports the countered one', async () => {
    const parsed = { kind: 'OFFER', amount: 240000 };
    proposals.parse.mockReturnValue(parsed);
    proposals.createFor.mockResolvedValue({
      proposal: { id: 'o2', kind: 'OFFER', status: 'PENDING', amount: 240000 },
      countered: {
        messageId: 'm0',
        proposal: { id: 'o1', status: 'COUNTERED', amount: 250000 },
      },
    });

    const res = await service.sendMessage(sender, 'c1', {
      type: 'OFFER',
      proposal: { amount: 240000, counterOfId: 'o1' },
    });

    expect(proposals.parse).toHaveBeenCalledWith('OFFER', {
      amount: 240000,
      counterOfId: 'o1',
    });
    expect(proposals.createFor).toHaveBeenCalledWith(tx, {
      identityId: 'me',
      conversationId: 'c1',
      messageId: 'm1',
      proposal: parsed,
    });
    expect(res.proposal).toMatchObject({ id: 'o2', amount: 240000 });
    expect(res.countered).toMatchObject({
      messageId: 'm0',
      proposal: { status: 'COUNTERED' },
    });
  });

  it('marks an off-market ad card unavailable', () => {
    expect(propertyCard(ad({ status: 'CLOSED' }) as never).unavailable).toBe(
      true,
    );
  });
});
