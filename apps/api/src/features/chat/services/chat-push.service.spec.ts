import { PrismaService } from 'src/core/prisma/prisma.service';
import { PushService } from 'src/core/push/push.service';
import { ChatParticipantDisplayService } from './chat-participant-display.service';
import {
  CHAT_PUSH_CHANNEL,
  CHAT_PUSH_SOUND,
  ChatPushService,
  chatPushBody,
  propertyTitle,
} from './chat-push.service';

describe('ChatPushService', () => {
  let prisma: {
    conversationParticipant: { findMany: jest.Mock };
    session: { findMany: jest.Mock };
    identity: { findUnique: jest.Mock };
    conversation: { findUnique: jest.Mock };
  };
  let push: { sendToTokens: jest.Mock };
  let display: { resolve: jest.Mock };
  let service: ChatPushService;

  const send = (
    overrides: Partial<Parameters<ChatPushService['notifyRecipients']>[0]> = {},
  ) =>
    service.notifyRecipients({
      conversationId: 'c1',
      senderIdentityId: 'me',
      message: { type: 'TEXT', content: 'هاي' },
      viewingIdentityIds: new Set(),
      ...overrides,
    });

  beforeEach(() => {
    prisma = {
      conversationParticipant: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ identityId: 'me' }, { identityId: 'them' }]),
      },
      session: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ pushToken: 'ExponentPushToken[a]' }]),
      },
      identity: {
        findUnique: jest.fn().mockResolvedValue({ userId: 'u-me' }),
      },
      conversation: {
        findUnique: jest.fn().mockResolvedValue({ property: null }),
      },
    };
    push = { sendToTokens: jest.fn().mockResolvedValue(undefined) };
    display = {
      resolve: jest.fn().mockResolvedValue({ name: 'Ebrahim', avatarUrl: '' }),
    };
    service = new ChatPushService(
      prisma as unknown as PrismaService,
      push as unknown as PushService,
      display as unknown as ChatParticipantDisplayService,
    );
  });

  it("pushes to the recipient persona's devices, never the sender", async () => {
    await send();

    expect(prisma.session.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          activeIdentityId: { in: ['them'] },
          isActive: true,
          pushToken: { not: null },
        }),
      }),
    );
    expect(push.sendToTokens).toHaveBeenCalledWith(['ExponentPushToken[a]'], {
      title: 'Ebrahim',
      body: 'هاي',
      sound: CHAT_PUSH_SOUND,
      channelId: CHAT_PUSH_CHANNEL,
      data: { type: 'CHAT_MESSAGE', conversationId: 'c1', route: '/chat/c1' },
    });
  });

  it('names the ad when the chat came from one', async () => {
    prisma.conversation.findUnique.mockResolvedValue({
      property: { category: 'BUILDING', type: 'SALE' },
    });

    await send();

    expect(push.sendToTokens).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ body: 'عمارة للبيع · هاي' }),
    );
  });

  it('skips a recipient who has the conversation open', async () => {
    await send({ viewingIdentityIds: new Set(['them']) });

    expect(prisma.session.findMany).not.toHaveBeenCalled();
    expect(push.sendToTokens).not.toHaveBeenCalled();
  });

  it('respects accounts that turned app notifications off', async () => {
    await send();

    const where = prisma.session.findMany.mock.calls[0][0].where;
    expect(where.user).toEqual({
      OR: [
        { notifPreferences: { is: null } },
        { notifPreferences: { is: { appEnabled: true } } },
      ],
    });
  });

  it('sends nothing when no recipient device has a push token', async () => {
    prisma.session.findMany.mockResolvedValue([]);

    await send();

    expect(push.sendToTokens).not.toHaveBeenCalled();
  });

  it('never throws, so a push problem cannot break sending', async () => {
    prisma.conversationParticipant.findMany.mockRejectedValue(new Error('db'));

    await expect(send()).resolves.toBeUndefined();
  });
});

describe('chatPushBody', () => {
  it('previews text, trimmed to 100 characters', () => {
    expect(chatPushBody({ type: 'TEXT', content: '  مرحبا  ' })).toBe('مرحبا');
    expect(chatPushBody({ type: 'TEXT', content: 'a'.repeat(150) })).toBe(
      `${'a'.repeat(100)}…`,
    );
  });

  it('labels images and property cards', () => {
    expect(chatPushBody({ type: 'IMAGE' })).toBe('📷 صورة');
    expect(chatPushBody({ type: 'PROPERTY' })).toBe('🏠 عقار');
  });

  it('leads with the ad title when there is one', () => {
    expect(chatPushBody({ type: 'TEXT', content: 'هاي' }, 'عمارة للبيع')).toBe(
      'عمارة للبيع · هاي',
    );
    expect(chatPushBody({ type: 'IMAGE' }, 'شقة للإيجار')).toBe(
      'شقة للإيجار · 📷 صورة',
    );
  });
});

describe('propertyTitle', () => {
  it('is the category then the listing type', () => {
    expect(propertyTitle({ category: 'BUILDING', type: 'SALE' })).toBe(
      'عمارة للبيع',
    );
    expect(propertyTitle({ category: 'APARTMENT', type: 'RENT' })).toBe(
      'شقة للإيجار',
    );
  });

  it('is empty without a property', () => {
    expect(propertyTitle(null)).toBeNull();
  });
});
