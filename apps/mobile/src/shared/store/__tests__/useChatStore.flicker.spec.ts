import { ChatMessage,chatService } from '@/shared/api/chat.service';

import { useChatStore } from '../useChatStore';

// QA (Android): a sent file's bubble appeared, vanished for a moment, then
// came back. Picking a file leaves the app; coming back reloads the chat,
// and when that reload landed after the send it dropped the new bubble
// until the server's copy arrived -- which then replaced it under a new
// row key, rebuilding the row.

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

const fromServer = (over: Partial<ChatMessage> = {}): ChatMessage =>
  ({
    id: 'm-old',
    type: 'TEXT',
    content: 'هلا',
    isMine: false,
    timestamp: '10:00 ص',
    createdAt: '2026-10-14T10:00:00.000Z',
    ...over,
  }) as ChatMessage;

const sending = (over: Partial<ChatMessage> = {}): ChatMessage =>
  ({
    id: 'temp-1',
    type: 'FILE',
    isMine: true,
    timestamp: '',
    createdAt: '2026-10-14T10:05:00.000Z',
    sending: true,
    localAttachments: [
      { uri: 'file:///c.pdf', name: 'عقد.pdf', mimeType: 'application/pdf', kind: 'FILE' },
    ],
    ...over,
  }) as ChatMessage;

const sentFile = fromServer({
  id: 'm-file',
  type: 'FILE',
  content: undefined,
  isMine: true,
  attachments: [{ id: 'a1', kind: 'FILE', fileName: 'عقد.pdf', mimeType: 'application/pdf', size: 1, url: 'https://s/1' }] as never,
});

const ids = () => useChatStore.getState().messagesByConversation.c1.map((m) => m.id);

describe('a sent file bubble never disappears', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useChatStore.getState().clear();
  });

  it('keeps a still-sending bubble through a reload of the chat', async () => {
    useChatStore.setState({ messagesByConversation: { c1: [fromServer(), sending()] } });
    mockGetMessages.mockResolvedValue({
      data: [fromServer()],
      meta: { hasNextPage: false },
    });

    await useChatStore.getState().loadMessages('c1', undefined, true);

    expect(ids()).toEqual(['m-old', 'temp-1']);
  });

  it('keeps a failed bubble (with its retry) through a reload', async () => {
    useChatStore.setState({
      messagesByConversation: { c1: [sending({ sending: false, failed: true })] },
    });
    mockGetMessages.mockResolvedValue({ data: [fromServer()], meta: { hasNextPage: false } });

    await useChatStore.getState().loadMessages('c1', undefined, true);

    expect(ids()).toEqual(['m-old', 'temp-1']);
  });

  it("replaces the bubble with the server's copy in place, under the bubble's key", () => {
    useChatStore.setState({
      messagesByConversation: { c1: [fromServer(), sending(), fromServer({ id: 'm-later' })] },
    });

    useChatStore.getState().receiveMessage('c1', sentFile);

    const list = useChatStore.getState().messagesByConversation.c1;
    expect(list.map((m) => m.id)).toEqual(['m-old', 'm-file', 'm-later']);
    expect(list[1].clientKey).toBe('temp-1');
    expect(list[1].sending).toBeUndefined();
  });

  it('keeps that key when the chat is reloaded afterwards', async () => {
    useChatStore.setState({ messagesByConversation: { c1: [sending()] } });
    useChatStore.getState().receiveMessage('c1', sentFile);
    mockGetMessages.mockResolvedValue({ data: [sentFile], meta: { hasNextPage: false } });

    await useChatStore.getState().loadMessages('c1', undefined, true);

    const list = useChatStore.getState().messagesByConversation.c1;
    expect(list.map((m) => m.id)).toEqual(['m-file']);
    expect(list[0].clientKey).toBe('temp-1');
  });

  it("only drops the bubble when a reload already brought the server's copy", () => {
    useChatStore.setState({ messagesByConversation: { c1: [sentFile, sending()] } });

    useChatStore.getState().receiveMessage('c1', sentFile);

    expect(ids()).toEqual(['m-file']);
  });

  it('adds a message from the other person at the end', () => {
    useChatStore.setState({ messagesByConversation: { c1: [fromServer()] } });

    useChatStore.getState().receiveMessage('c1', fromServer({ id: 'm-new', content: 'تمام' }));

    expect(ids()).toEqual(['m-old', 'm-new']);
  });
});
