import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ChatConversationsService } from './chat-conversations.service';
import { ChatMessagesService } from './chat-messages.service';
import {
  ChatParticipantDisplayService,
  isOtherAvailable,
} from './chat-participant-display.service';
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

  // QA: the other account was deleted; messages went into the void
  it('refuses new messages once the other account is gone', async () => {
    const prisma = {
      conversationParticipant: {
        findFirst: jest.fn().mockResolvedValue({ id: 'p1' }),
        // Deleting an account removes its participant rows
        findMany: jest.fn().mockResolvedValue([]),
      },
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
    ).rejects.toThrow(new ForbiddenException('هذا المستخدم لم يعد متاحاً'));
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('tells the app whether the other side can still be written to', () => {
    const live = {
      identity: { user: { isDisabled: false, isBlocked: false } },
    };
    expect(isOtherAvailable(live)).toBe(true);
    expect(
      isOtherAvailable({
        identity: { user: { isDisabled: true, isBlocked: false } },
      }),
    ).toBe(false);
    expect(
      isOtherAvailable({
        identity: { user: { isDisabled: false, isBlocked: true } },
      }),
    ).toBe(false);
    // Deleted: no participant left
    expect(isOtherAvailable(undefined)).toBe(false);
    expect(isOtherAvailable(null)).toBe(false);
  });
});

describe('chat between accounts with a block', () => {
  const display = {} as ChatParticipantDisplayService;
  const blockedErr = expect.objectContaining({
    response: expect.objectContaining({ code: 'USER_BLOCKED' }) as unknown,
  }) as unknown;

  it.each([
    ['this account blocked them', { blockerUserId: 'u1', blockedUserId: 'u2' }],
    ['they blocked this account', { blockerUserId: 'u2', blockedUserId: 'u1' }],
  ])('no new conversation when %s', async (_label, row) => {
    const prisma = {
      identity: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce({ id: 'i2' })
          .mockResolvedValueOnce({
            id: 'i2',
            userId: 'u2',
            user: { isDisabled: false, isBlocked: false },
          }),
      },
      userBlock: { findFirst: jest.fn().mockResolvedValue(row) },
      $transaction: jest.fn(),
    };
    const service = new ChatConversationsService(
      prisma as unknown as PrismaService,
      display,
    );
    await expect(
      service.findOrCreateConversation('u1', 'i1', 'i2'),
    ).rejects.toEqual(blockedErr);
    // Either direction is looked up
    expect(prisma.userBlock.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { blockerUserId: 'u1', blockedUserId: 'u2' },
            { blockerUserId: 'u2', blockedUserId: 'u1' },
          ],
        },
      }),
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('no new messages into an existing conversation', async () => {
    const prisma = {
      conversationParticipant: {
        findFirst: jest.fn().mockResolvedValue({ id: 'p1' }),
        findMany: jest.fn().mockResolvedValue([
          {
            identity: {
              userId: 'u2',
              user: { isDisabled: false, isBlocked: false },
            },
          },
        ]),
      },
      userBlock: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ blockerUserId: 'u2', blockedUserId: 'u1' }),
      },
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
    ).rejects.toEqual(blockedErr);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
