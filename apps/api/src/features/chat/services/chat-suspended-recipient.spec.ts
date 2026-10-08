import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ChatConversationsService } from './chat-conversations.service';
import { ChatMessagesService } from './chat-messages.service';
import { ChatParticipantDisplayService } from './chat-participant-display.service';
import { ChatAttachmentsService } from './chat-attachments.service';
import { ChatProposalsService } from './chat-proposals.service';

describe('chat with a suspended or blocked account', () => {
  const display = {} as ChatParticipantDisplayService;

  it('refuses to start a conversation with them', async () => {
    const prisma = {
      identity: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce({ id: 'i2' }) // recipientId is a persona
          .mockResolvedValueOnce({
            id: 'i2',
            userId: 'u2',
            user: { isDisabled: true, isBlocked: false },
          }),
      },
      $transaction: jest.fn(),
    };
    const service = new ChatConversationsService(
      prisma as unknown as PrismaService,
      display,
    );

    await expect(
      service.findOrCreateConversation('u1', 'i1', 'i2'),
    ).rejects.toThrow(new ForbiddenException('هذا الحساب غير متاح حالياً'));
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("resolves an account id to that account's default persona", async () => {
    const prisma = {
      identity: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce(null) // recipientId is not a persona id
          .mockResolvedValueOnce({
            id: 'i2',
            userId: 'u2',
            user: { isDisabled: false, isBlocked: true },
          }),
        findMany: jest.fn().mockResolvedValue([
          { id: 'i2-company', type: 'COMPANY' },
          { id: 'i2', type: 'INDIVIDUAL' },
        ]),
      },
      $transaction: jest.fn(),
    };
    const service = new ChatConversationsService(
      prisma as unknown as PrismaService,
      display,
    );

    await expect(
      service.findOrCreateConversation('u1', 'i1', 'u2'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.identity.findUnique).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: { id: 'i2' } }),
    );
  });

  it("refuses a chat between the same account's own personas", async () => {
    const prisma = {
      identity: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce({ id: 'i1-company' })
          .mockResolvedValueOnce({
            id: 'i1-company',
            userId: 'u1',
            user: { isDisabled: false, isBlocked: false },
          }),
      },
      $transaction: jest.fn(),
    };
    const service = new ChatConversationsService(
      prisma as unknown as PrismaService,
      display,
    );

    await expect(
      service.findOrCreateConversation('u1', 'i1', 'i1-company'),
    ).rejects.toThrow('لا يمكنك بدء محادثة مع نفسك');
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
      {} as ChatAttachmentsService,
      {} as ChatProposalsService,
    );

    await expect(
      service.sendMessage({ userId: 'u1', identityId: 'i1' }, 'c1', {
        content: 'مرحبا',
        type: 'TEXT',
      }),
    ).rejects.toThrow(new ForbiddenException('هذا الحساب غير متاح حالياً'));
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
