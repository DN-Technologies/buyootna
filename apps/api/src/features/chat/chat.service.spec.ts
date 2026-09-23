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
    identity: { findUnique: jest.Mock };
    property: { findUnique: jest.Mock };
    user: { findUnique: jest.Mock };
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
      identity: { findUnique: jest.fn() },
      property: { findUnique: jest.fn() },
      user: { findUnique: jest.fn() },
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

  it('creates the conversation inside a transaction after taking the pair advisory lock', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.identity.findUnique.mockResolvedValue({ id: 'identity-2' });
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
    // Symmetric key: sorted pair, so both callers contend on the same lock.
    expect(lockKeyArg()).toBe('identity-2:user-1');
    // The find and create ran against the transaction client...
    expect(tx.conversation.findMany).toHaveBeenCalledTimes(1);
    expect(tx.conversation.create).toHaveBeenCalledTimes(1);
    // ...while the legacy this.prisma conversation methods stayed untouched.
    expect(result).toEqual({ id: 'conv-1', participants: [{}, {}] });
  });

  it('locks the same symmetric key regardless of caller direction', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
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

    prisma.user.findUnique.mockResolvedValue(null);
    prisma.identity.findUnique.mockResolvedValue({ id: 'user-1' });

    await service.findOrCreateConversation(
      'identity-2',
      'identity-caller',
      'user-1',
    );

    expect(lockKeyArg()).toBe(forward);
  });

  it('reuses the existing conversation and never creates a duplicate', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.identity.findUnique.mockResolvedValue({ id: 'identity-2' });
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
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.identity.findUnique.mockResolvedValue({ id: 'identity-2' });
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

  it('throws before opening the transaction when the recipient does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.identity.findUnique.mockResolvedValue(null);

    await expect(
      service.findOrCreateConversation('user-1', 'identity-me', 'ghost'),
    ).rejects.toThrow();

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
