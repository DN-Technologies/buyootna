import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ChatConversationsService } from './chat-conversations.service';
import { ChatMessagesService } from './chat-messages.service';
import { ChatParticipantDisplayService } from './chat-participant-display.service';

describe('chat with a suspended or blocked account', () => {
  const display = {} as ChatParticipantDisplayService;

  it('refuses to start a conversation with them', async () => {
    const prisma = {
      user: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'u2', isDisabled: true, isBlocked: false }),
      },
      identity: { findUnique: jest.fn() },
      $transaction: jest.fn(),
    };
    const service = new ChatConversationsService(
      prisma as unknown as PrismaService,
      display,
    );

    await expect(
      service.findOrCreateConversation('u1', 'i1', 'u2'),
    ).rejects.toThrow(new ForbiddenException('هذا الحساب غير متاح حالياً'));
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('resolves an identity id to its user before deciding', async () => {
    const prisma = {
      user: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce(null) // recipientId is not a User id
          .mockResolvedValueOnce({ isDisabled: false, isBlocked: true }),
      },
      identity: {
        findUnique: jest.fn().mockResolvedValue({ id: 'i2', userId: 'u2' }),
      },
      $transaction: jest.fn(),
    };
    const service = new ChatConversationsService(
      prisma as unknown as PrismaService,
      display,
    );

    await expect(
      service.findOrCreateConversation('u1', 'i1', 'i2'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('refuses new messages into an existing conversation with them', async () => {
    const prisma = {
      conversationParticipant: {
        findFirst: jest.fn().mockResolvedValue({ id: 'p1' }),
        findMany: jest.fn().mockResolvedValue([
          {
            userId: null,
            identity: { user: { isDisabled: true, isBlocked: false } },
          },
        ]),
      },
      user: { findMany: jest.fn() },
      $transaction: jest.fn(),
    };
    const service = new ChatMessagesService(
      prisma as unknown as PrismaService,
      display,
    );

    await expect(
      service.sendMessage('i1', 'c1', { content: 'مرحبا', type: 'TEXT' }),
    ).rejects.toThrow(new ForbiddenException('هذا الحساب غير متاح حالياً'));
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('checks legacy participants that reference the user directly', async () => {
    const prisma = {
      conversationParticipant: {
        findFirst: jest.fn().mockResolvedValue({ id: 'p1' }),
        findMany: jest
          .fn()
          .mockResolvedValue([{ userId: 'u2', identity: null }]),
      },
      user: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ isDisabled: false, isBlocked: true }]),
      },
      $transaction: jest.fn(),
    };
    const service = new ChatMessagesService(
      prisma as unknown as PrismaService,
      display,
    );

    await expect(
      service.sendMessage('i1', 'c1', { content: 'مرحبا', type: 'TEXT' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
