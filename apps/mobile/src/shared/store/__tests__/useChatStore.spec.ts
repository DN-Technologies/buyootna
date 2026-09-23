import { chatService } from '@/shared/api/chat.service';
import { socketService } from '@/shared/services/socket.service';

import { useChatStore } from '../useChatStore';

// Regression coverage for the critical cross-conversation leak reported in
// QA: sending a message in Company A's chat, navigating back to the chat
// list, then opening Company B's chat showed Company A's message inside
// Company B's room.
//
// Root cause: chat message state (messages, pagination, loading) lived in
// singleton fields (`activeMessages` etc.) shared by whichever conversation
// happened to be "active", gated only by an `activeConversationId` check
// scattered across actions. That's fragile in two ways this file covers:
//   1. Nothing synchronously cleared the singleton the instant a screen
//      stopped being active, so a newly-opened conversation could briefly
//      render whatever the previous one had left behind.
//   2. More fundamentally, React Navigation keeps blurred stack screens
//      mounted rather than unmounting them, so two chat screens can be
//      mounted at once — a single shared "active" field can't isolate two
//      simultaneously-mounted conversations from each other at all.
// The fix keys every field by conversationId, so each conversation's data
// is structurally independent of every other's, and of how many chat
// screens happen to be mounted.

jest.mock('@/shared/api/chat.service', () => ({
  chatService: {
    getConversations: jest.fn(),
    getMessages: jest.fn(),
    markAsRead: jest.fn().mockResolvedValue({ success: true }),
    createConversation: jest.fn(),
  },
}));

jest.mock('@/shared/services/socket.service', () => ({
  socketService: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    getSocket: jest.fn(),
    joinConversation: jest.fn(),
    leaveConversation: jest.fn(),
    sendMessage: jest.fn(() => true),
    onNewMessage: jest.fn(() => jest.fn()),
    onConversationUpdated: jest.fn(() => jest.fn()),
  },
}));

jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: { getState: jest.fn(() => ({ user: { id: 'individual-1' } })) },
}));

const mockGetMessages = chatService.getMessages as jest.Mock;

function makeMessage(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: `m-${Math.random()}`,
    type: 'TEXT' as const,
    isMine: false,
    timestamp: '10:00',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('useChatStore — conversation isolation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useChatStore.getState().clear();
  });

  it('keeps a sent message scoped to its own conversation — never bleeding into a different room', () => {
    // 1. Open Company A's chat.
    useChatStore.getState().setActiveConversation('company-a');

    // 2. Send a distinct message.
    useChatStore.getState().sendMessage('company-a', {
      content: 'Test message for Company A',
      type: 'TEXT',
    });
    expect(socketService.sendMessage).toHaveBeenCalledWith(
      'company-a',
      expect.objectContaining({
        content: 'Test message for Company A',
        type: 'TEXT',
      }),
    );
    expect(
      useChatStore
        .getState()
        .messagesByConversation['company-a'].some(
          (m) => m.content === 'Test message for Company A',
        ),
    ).toBe(true);

    // 3. Navigate back to the chat list, 4. open a different conversation
    // with Company B — Company A's own conversationId key must never have
    // been touched by any of this.
    useChatStore.getState().setActiveConversation(null);
    useChatStore.getState().setActiveConversation('company-b');

    // 5/6. Company B's own slice must never contain Company A's message —
    // it doesn't even exist yet (no fetch has populated it in this test).
    expect(useChatStore.getState().messagesByConversation['company-b']).toBeUndefined();
    expect(
      useChatStore
        .getState()
        .messagesByConversation['company-a'].some(
          (m) => m.content === 'Test message for Company A',
        ),
    ).toBe(true);
  });

  it('does not mirror an incoming socket message for one conversation into a different one', () => {
    // A message arrives for Company A (e.g. the inbox screen's
    // conversation_updated listener, which fires for ANY of the user's
    // conversations so it can update unread badges/last-message previews)
    // while Company B's conversation exists in the cache too.
    useChatStore.getState().receiveMessage('company-a', makeMessage({ content: 'Hello from A' }));
    useChatStore.getState().receiveMessage('company-b', makeMessage({ content: 'Hello from B' }));

    expect(useChatStore.getState().messagesByConversation['company-a']).toEqual([
      expect.objectContaining({ content: 'Hello from A' }),
    ]);
    expect(useChatStore.getState().messagesByConversation['company-b']).toEqual([
      expect.objectContaining({ content: 'Hello from B' }),
    ]);
  });

  it("loading one conversation's messages never touches another conversation's cache", async () => {
    mockGetMessages.mockImplementation((conversationId: string) => {
      if (conversationId === 'company-a') {
        return Promise.resolve({
          data: [makeMessage({ id: 'a1', content: 'Test message for Company A' })],
          meta: { hasNextPage: false },
        });
      }
      return Promise.resolve({
        data: [makeMessage({ id: 'b1', content: 'Hi from B' })],
        meta: { hasNextPage: false },
      });
    });

    await useChatStore.getState().loadMessages('company-a', undefined, true);
    await useChatStore.getState().loadMessages('company-b', undefined, true);

    expect(
      useChatStore
        .getState()
        .messagesByConversation['company-a'].some(
          (m) => m.content === 'Test message for Company A',
        ),
    ).toBe(true);
    expect(
      useChatStore
        .getState()
        .messagesByConversation['company-b'].some(
          (m) => m.content === 'Test message for Company A',
        ),
    ).toBe(false);
    expect(
      useChatStore
        .getState()
        .messagesByConversation['company-b'].some((m) => m.content === 'Hi from B'),
    ).toBe(true);
  });

  it('a slow response for one conversation resolving after a different one has already loaded does not cross-contaminate either', async () => {
    let resolveA: (value: unknown) => void = () => {};
    mockGetMessages.mockImplementation((conversationId: string) => {
      if (conversationId === 'company-a') {
        return new Promise((resolve) => {
          resolveA = resolve;
        });
      }
      return Promise.resolve({
        data: [makeMessage({ id: 'b1', content: 'Hi from B' })],
        meta: { hasNextPage: false },
      });
    });

    const loadA = useChatStore.getState().loadMessages('company-a', undefined, true);
    await useChatStore.getState().loadMessages('company-b', undefined, true);

    expect(
      useChatStore
        .getState()
        .messagesByConversation['company-b'].some((m) => m.content === 'Hi from B'),
    ).toBe(true);

    resolveA({
      data: [makeMessage({ id: 'a1', content: 'Test message for Company A' })],
      meta: { hasNextPage: false },
    });
    await loadA;

    expect(
      useChatStore
        .getState()
        .messagesByConversation['company-a'].some(
          (m) => m.content === 'Test message for Company A',
        ),
    ).toBe(true);
    expect(
      useChatStore
        .getState()
        .messagesByConversation['company-b'].some(
          (m) => m.content === 'Test message for Company A',
        ),
    ).toBe(false);
  });

  it('clear() wipes every per-conversation map along with everything else', () => {
    useChatStore.getState().setActiveConversation('company-a');
    useChatStore.getState().sendMessage('company-a', {
      content: 'Test message for Company A',
      type: 'TEXT',
    });

    useChatStore.getState().clear();

    expect(useChatStore.getState().messagesByConversation).toEqual({});
    expect(useChatStore.getState().paginationByConversation).toEqual({});
    expect(useChatStore.getState().loadingConversationIds).toEqual({});
    expect(useChatStore.getState().activeConversationId).toBeNull();
  });
});
