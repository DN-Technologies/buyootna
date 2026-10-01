import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { ChatConversationsService } from './services/chat-conversations.service';
import { ChatMessagesService } from './services/chat-messages.service';
import { ChatParticipantDisplayService } from './services/chat-participant-display.service';
import { PrismaService } from '../../core/prisma/prisma.service';

describe('ChatParticipantDisplayService.resolve', () => {
  let displayService: ChatParticipantDisplayService;
  let prisma: {
    identity: { findFirst: jest.Mock };
    user: { findUnique: jest.Mock };
  };

  // The name/avatar resolution is pure lookup logic and doesn't need the
  // surrounding conversation/message plumbing mocked just to reach it.
  const resolve = (otherPart: any) => displayService.resolve(otherPart);

  beforeEach(async () => {
    prisma = {
      identity: { findFirst: jest.fn() },
      user: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatParticipantDisplayService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    displayService = module.get<ChatParticipantDisplayService>(
      ChatParticipantDisplayService,
    );
  });

  it('uses the linked identity data when the participant has one', async () => {
    const result = await resolve({
      userId: 'user-1',
      identity: { individualData: { name: 'أحمد' } },
    });

    expect(result.name).toBe('أحمد');
    expect(prisma.identity.findFirst).not.toHaveBeenCalled();
  });

  it('prefers company/office names over individual data on a linked identity', async () => {
    const result = await resolve({
      userId: 'user-1',
      identity: {
        companyData: { name: 'شركة بيوتنا' },
        individualData: { name: 'أحمد' },
      },
    });

    expect(result.name).toBe('شركة بيوتنا');
  });

  it("falls back to the user's active identity when the participant has no identity link (legacy userId-only participant)", async () => {
    prisma.identity.findFirst.mockResolvedValue({
      individualData: { name: 'مستخدم تجريبي' },
    });

    const result = await resolve({ userId: 'user-legacy', identity: null });

    expect(prisma.identity.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-legacy', isActive: true },
      }),
    );
    expect(result.name).toBe('مستخدم تجريبي');
  });

  it('falls back to the bare User row when there is no active identity either', async () => {
    prisma.identity.findFirst.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue({
      name: 'يوسف',
      avatarUrl: null,
    });

    const result = await resolve({ userId: 'user-legacy', identity: null });

    expect(result.name).toBe('يوسف');
  });

  it('only uses the generic placeholder when nothing at all resolves', async () => {
    prisma.identity.findFirst.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue(null);

    const result = await resolve({ userId: 'user-ghost', identity: null });

    expect(result.name).toBe('مستخدم بيوتنا');
  });

  it('goes straight to the placeholder when there is no userId to fall back on', async () => {
    const result = await resolve(undefined);

    expect(prisma.identity.findFirst).not.toHaveBeenCalled();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(result.name).toBe('مستخدم بيوتنا');
  });
});

describe('ChatService.findOrCreateConversation', () => {
  let service: ChatService;
  let prisma: {
    $transaction: jest.Mock;
    identity: { findUnique: jest.Mock; findMany: jest.Mock };
    property: { findUnique: jest.Mock };
  };
  let tx: {
    $executeRaw: jest.Mock;
    conversation: {
      create: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
    };
  };

  // The service runs the find-or-create inside prisma.$transaction with a
  // pair advisory lock; the mock just executes the callback against our
  // fake transaction client so assertions can inspect what happened "in"
  // the transaction.
  beforeEach(async () => {
    tx = {
      $executeRaw: jest.fn().mockResolvedValue(0),
      conversation: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn(),
      },
    };
    prisma = {
      $transaction: jest.fn((cb: (client: typeof tx) => unknown) => cb(tx)),
      identity: { findUnique: jest.fn(), findMany: jest.fn() },
      property: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatParticipantDisplayService,
        ChatConversationsService,
        ChatMessagesService,
        ChatService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  // $executeRaw is called as a tagged template: (strings, ...values), so
  // the lock key is the first interpolated value.
  const lockKeyArg = (): string => {
    const call = tx.$executeRaw.mock.calls[0] as unknown as [
      TemplateStringsArray,
      string,
    ];
    return call[1];
  };

  // The recipient persona (and its account's status) as the service looks
  // it up
  const recipientIs = (id: string, userId: string) =>
    prisma.identity.findUnique.mockImplementation(
      ({ where }: { where: { id: string } }) =>
        Promise.resolve(
          where.id === id
            ? { id, userId, user: { isDisabled: false, isBlocked: false } }
            : null,
        ),
    );

  it('creates the conversation inside a transaction after taking the pair advisory lock', async () => {
    recipientIs('identity-2', 'user-2');
    tx.conversation.create.mockResolvedValue({
      id: 'conv-1',
      participants: [{}, {}],
    });

    const result = await service.findOrCreateConversation(
      'user-1',
      'identity-me',
      'identity-2',
    );

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.$executeRaw).toHaveBeenCalledTimes(1);
    // Symmetric key over the two personas, so both callers contend on the
    // same lock
    expect(lockKeyArg()).toBe('identity-2:identity-me');
    expect(tx.conversation.findMany).toHaveBeenCalledTimes(1);
    // Both participants are personas (with their account kept alongside)
    const [createArg] = tx.conversation.create.mock.calls[0] as unknown as [
      { data: { participants: { create: unknown[] } } },
    ];
    expect(createArg.data.participants.create).toEqual([
      { userId: 'user-1', identityId: 'identity-me' },
      { userId: 'user-2', identityId: 'identity-2' },
    ]);
    expect(result).toEqual({ id: 'conv-1', participants: [{}, {}] });
  });

  it('locks the same symmetric key regardless of caller direction', async () => {
    recipientIs('identity-2', 'user-2');
    tx.conversation.create.mockResolvedValue({
      id: 'conv-1',
      participants: [{}, {}],
    });

    await service.findOrCreateConversation(
      'user-1',
      'identity-caller',
      'identity-2',
    );
    const forward = lockKeyArg();

    tx.$executeRaw.mockClear();
    recipientIs('identity-caller', 'user-1');

    await service.findOrCreateConversation(
      'user-2',
      'identity-2',
      'identity-caller',
    );

    expect(lockKeyArg()).toBe(forward);
  });

  it('reuses the existing conversation and never creates a duplicate', async () => {
    recipientIs('identity-2', 'user-2');
    prisma.property.findUnique.mockResolvedValue({ id: 'prop-1' });
    tx.conversation.findMany.mockResolvedValue([
      { id: 'conv-9', propertyId: 'prop-1', participants: [{}, {}] },
    ]);

    const result = await service.findOrCreateConversation(
      'user-1',
      'identity-me',
      'identity-2',
      'prop-1',
    );

    expect(tx.conversation.update).not.toHaveBeenCalled();
    expect(tx.conversation.create).not.toHaveBeenCalled();
    expect(result.id).toBe('conv-9');
  });

  it('updates the property context when the existing conversation points elsewhere', async () => {
    recipientIs('identity-2', 'user-2');
    prisma.property.findUnique.mockResolvedValue({ id: 'prop-2' });
    tx.conversation.findMany.mockResolvedValue([
      { id: 'conv-9', propertyId: null, participants: [{}, {}] },
    ]);
    tx.conversation.update.mockResolvedValue({
      id: 'conv-9',
      propertyId: 'prop-2',
      participants: [{}, {}],
    });

    const result = await service.findOrCreateConversation(
      'user-1',
      'identity-me',
      'identity-2',
      'prop-2',
    );

    const [updateArg] = tx.conversation.update.mock.calls[0] as unknown as [
      { where: { id: string }; data: { propertyId?: string } },
    ];
    expect(updateArg.where.id).toBe('conv-9');
    expect(updateArg.data.propertyId).toBe('prop-2');
    expect(tx.conversation.create).not.toHaveBeenCalled();
    expect(result.id).toBe('conv-9');
  });

  it('clears the ad when the chat is opened without one (from a list or profile)', async () => {
    recipientIs('identity-2', 'user-2');
    tx.conversation.findMany.mockResolvedValue([
      { id: 'conv-9', propertyId: 'prop-1', participants: [{}, {}] },
    ]);
    tx.conversation.update.mockResolvedValue({
      id: 'conv-9',
      propertyId: null,
      participants: [{}, {}],
    });

    const result = await service.findOrCreateConversation(
      'user-1',
      'identity-me',
      'identity-2',
    );

    const [updateArg] = tx.conversation.update.mock.calls[0] as unknown as [
      { where: { id: string }; data: { propertyId?: string | null } },
    ];
    expect(updateArg.where.id).toBe('conv-9');
    expect(updateArg.data.propertyId).toBeNull();
    expect(result.propertyId).toBeNull();
  });

  it('leaves a conversation without an ad untouched when opened without one', async () => {
    recipientIs('identity-2', 'user-2');
    tx.conversation.findMany.mockResolvedValue([
      { id: 'conv-9', propertyId: null, participants: [{}, {}] },
    ]);

    await service.findOrCreateConversation(
      'user-1',
      'identity-me',
      'identity-2',
    );

    expect(tx.conversation.update).not.toHaveBeenCalled();
  });

  it('throws before opening the transaction when the recipient does not exist', async () => {
    prisma.identity.findUnique.mockResolvedValue(null);
    prisma.identity.findMany.mockResolvedValue([]);

    await expect(
      service.findOrCreateConversation('user-1', 'identity-me', 'ghost'),
    ).rejects.toThrow();

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

describe('ChatService.getConversations', () => {
  let service: ChatService;
  let prisma: {
    conversation: { count: jest.Mock; findMany: jest.Mock };
    message: { count: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      conversation: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'conv-empty',
            createdAt: new Date('2026-09-23T10:00:00Z'),
            updatedAt: new Date('2026-09-23T10:00:00Z'),
            property: null,
            // A freshly initiated conversation: participants but no messages.
            participants: [
              { userId: 'user-1', identityId: 'identity-1', lastReadAt: null },
              { userId: null, identityId: 'identity-2' },
            ],
            messages: [],
          },
        ]),
        count: jest.fn().mockResolvedValue(1),
      },
      message: { count: jest.fn().mockResolvedValue(0) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatParticipantDisplayService,
        ChatConversationsService,
        ChatMessagesService,
        ChatService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('lists empty (newly initiated) conversations — no messages filter in the where clause', async () => {
    const result = await service.getConversations('identity-1');

    // Regression guard for the QA ticket "newly initiated conversations do
    // not appear in the Chats list": the old query filtered
    // `messages: { some: {} }`, which hid every room created by a
    // "contact" tap before its first message persisted.
    const [listArgs] = (
      prisma.conversation.findMany.mock.calls as unknown as [
        [{ where: Record<string, unknown> }],
      ]
    )[0];
    expect(listArgs.where).not.toHaveProperty('messages');
    // The persona's own inbox only
    expect(listArgs.where.participants).toEqual({
      some: { identityId: 'identity-1' },
    });

    const [countArgs] = (
      prisma.conversation.count.mock.calls as unknown as [
        [{ where: Record<string, unknown> }],
      ]
    )[0];
    expect(countArgs.where).not.toHaveProperty('messages');

    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('conv-empty');
    expect(result.data[0].lastMessage).toBeNull();
    expect(result.meta.total).toBe(1);
  });
});
