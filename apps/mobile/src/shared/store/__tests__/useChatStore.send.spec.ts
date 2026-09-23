import { socketService } from '@/shared/services/socket.service';

import { useChatStore } from '../useChatStore';

jest.mock('@/shared/services/socket.service', () => ({
  socketService: {
    sendMessage: jest.fn(),
  },
}));

const mockSendMessage = socketService.sendMessage as jest.Mock;

const resetStore = () => {
  useChatStore.setState({
    conversations: [],
    messagesByConversation: {},
    paginationByConversation: {},
    loadingConversationIds: {},
    activeConversationId: null,
    isLoadingConversations: false,
  });
};

describe('useChatStore sending', () => {
  beforeEach(() => {
    resetStore();
    mockSendMessage.mockReset();
  });

  it('emits with a tempId and inserts a single optimistic bubble', () => {
    mockSendMessage.mockReturnValue(true);

    const sent = useChatStore
      .getState()
      .sendMessage('conv-1', { content: 'مرحبا', type: 'TEXT' });

    expect(sent).toBe(true);
    expect(mockSendMessage).toHaveBeenCalledTimes(1);
    const [conversationId, payload] = mockSendMessage.mock.calls[0];
    expect(conversationId).toBe('conv-1');
    expect(payload.tempId).toMatch(/^temp-/);

    const messages =
      useChatStore.getState().messagesByConversation['conv-1'] ?? [];
    expect(messages).toHaveLength(1);
    expect(messages[0].id).toBe(payload.tempId);
    expect(messages[0].sending).toBe(true);
  });

  it('inserts nothing and reports failure when there is no socket', () => {
    mockSendMessage.mockReturnValue(false);

    const sent = useChatStore
      .getState()
      .sendMessage('conv-1', { content: 'مرحبا', type: 'TEXT' });

    expect(sent).toBe(false);
    // No optimistic bubble was inserted (the conversation slice is never
    // even created for a failed send).
    expect(
      useChatStore.getState().messagesByConversation['conv-1'],
    ).toBeUndefined();
  });

  it('messageFailed rolls back exactly the temp bubble that failed', () => {
    mockSendMessage
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);

    const store = useChatStore.getState();
    store.sendMessage('conv-1', { content: 'أول رسالة', type: 'TEXT' });
    store.sendMessage('conv-1', { content: 'ثاني رسالة', type: 'TEXT' });

    const before =
      useChatStore.getState().messagesByConversation['conv-1'] ?? [];
    expect(before).toHaveLength(2);
    const failedTempId = before[0].id;

    useChatStore.getState().messageFailed('conv-1', failedTempId);

    const after =
      useChatStore.getState().messagesByConversation['conv-1'] ?? [];
    expect(after).toHaveLength(1);
    expect(after[0].id).toBe(before[1].id);
    expect(after[0].content).toBe('ثاني رسالة');
  });

  it('messageFailed falls back to the most recent sending bubble when no tempId is given', () => {
    mockSendMessage.mockReturnValue(true);

    const store = useChatStore.getState();
    store.sendMessage('conv-1', { content: 'قديمة', type: 'TEXT' });
    // Pretend the first one was confirmed already.
    useChatStore.setState((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        'conv-1': state.messagesByConversation['conv-1'].map((m, i) =>
          i === 0 ? { ...m, sending: false } : m,
        ),
      },
    }));
    store.sendMessage('conv-1', { content: 'أحدث', type: 'TEXT' });

    useChatStore.getState().messageFailed('conv-1', undefined);

    const after =
      useChatStore.getState().messagesByConversation['conv-1'] ?? [];
    expect(after).toHaveLength(1);
    expect(after[0].content).toBe('قديمة');
  });
});
