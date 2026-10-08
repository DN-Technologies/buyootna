import { chatService } from '@/shared/api/chat.service';
import { socketService } from '@/shared/services/socket.service';

import { useChatStore } from '../useChatStore';

jest.mock('@/shared/api/chat.service', () => ({
  chatService: {
    getMessages: jest.fn(),
    markAsRead: jest.fn().mockResolvedValue({ success: true }),
    hideMessage: jest.fn(),
  },
}));

jest.mock('@/shared/services/socket.service', () => ({
  socketService: {
    sendMessage: jest.fn(() => true),
    onReconnect: jest.fn(() => jest.fn()),
  },
}));

jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      user: { id: 'user-me' },
      activeIdentity: { id: 'ident-me' },
    })),
  },
}));

const original = {
  id: 'm1',
  type: 'TEXT' as const,
  content: 'هل العقار متاح؟',
  isMine: false,
  timestamp: '',
  createdAt: '2026-10-08T10:00:00.000Z',
};

describe('useChatStore — replies and حذف لدي', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useChatStore.getState().clear();
  });

  it('sends the replied-to id and shows the quote on the pending bubble', () => {
    useChatStore.getState().sendMessage('c1', {
      content: 'نعم متاح',
      type: 'TEXT',
      replyTo: original,
    });

    expect(socketService.sendMessage).toHaveBeenCalledWith(
      'c1',
      expect.objectContaining({ content: 'نعم متاح', replyToId: 'm1' }),
    );
    const [pending] = useChatStore.getState().messagesByConversation.c1;
    expect(pending.replyTo).toMatchObject({
      id: 'm1',
      content: 'هل العقار متاح؟',
      isMine: false,
    });
  });

  it('works out "you" on a live reply from the quoted sender persona', () => {
    useChatStore.getState().receiveMessage('c1', {
      id: 'm2',
      type: 'TEXT',
      content: 'تمام',
      senderId: 'user-them',
      isMine: undefined as unknown as boolean,
      timestamp: '',
      createdAt: '2026-10-08T10:01:00.000Z',
      replyTo: { id: 'm0', type: 'TEXT', content: 'سؤالي', senderIdentityId: 'ident-me' },
    });

    const [received] = useChatStore.getState().messagesByConversation.c1;
    expect(received.replyTo?.isMine).toBe(true);
  });

  it('hides a message at once, and restores it if the server refuses', async () => {
    useChatStore.setState({ messagesByConversation: { c1: [original] } });
    (chatService.hideMessage as jest.Mock).mockRejectedValueOnce(new Error('x'));

    const attempt = useChatStore.getState().hideMessage('c1', 'm1');
    expect(useChatStore.getState().messagesByConversation.c1).toHaveLength(0);

    await expect(attempt).rejects.toThrow('x');
    expect(useChatStore.getState().messagesByConversation.c1).toEqual([original]);
  });

  it('keeps a message hidden when the server accepts', async () => {
    useChatStore.setState({ messagesByConversation: { c1: [original] } });
    (chatService.hideMessage as jest.Mock).mockResolvedValueOnce(undefined);

    await useChatStore.getState().hideMessage('c1', 'm1');

    expect(chatService.hideMessage).toHaveBeenCalledWith('m1');
    expect(useChatStore.getState().messagesByConversation.c1).toHaveLength(0);
  });

  it('an offer shows as pending at once, and an answer patches it in place', () => {
    useChatStore.getState().sendMessage('c1', {
      type: 'OFFER',
      proposal: { amount: 240000, period: 'TOTAL', counterOfId: 'o1' },
    });
    const [pending] = useChatStore.getState().messagesByConversation.c1;
    expect(pending.proposal).toMatchObject({ kind: 'OFFER', status: 'PENDING', amount: 240000 });
    expect(socketService.sendMessage).toHaveBeenCalledWith(
      'c1',
      expect.objectContaining({
        type: 'OFFER',
        proposal: { amount: 240000, period: 'TOTAL', counterOfId: 'o1' },
      }),
    );

    useChatStore.getState().updateMessage('c1', pending.id, {
      proposal: { ...pending.proposal!, status: 'ACCEPTED' },
    });
    expect(useChatStore.getState().messagesByConversation.c1[0].proposal?.status).toBe(
      'ACCEPTED',
    );
  });

  it('a pin is sent with its coordinates and shown at once', () => {
    useChatStore.getState().sendMessage('c1', {
      type: 'LOCATION',
      latitude: 29.33,
      longitude: 48.07,
      locationLabel: 'السالمية',
    });
    expect(useChatStore.getState().messagesByConversation.c1[0].location).toEqual({
      latitude: 29.33,
      longitude: 48.07,
      label: 'السالمية',
    });
  });

  it("keeps the other person's receipt, ignoring my own reads and stale ones", () => {
    const store = useChatStore.getState();
    store.applyReceipt({
      conversationId: 'c1',
      identityId: 'ident-other',
      lastDeliveredAt: '2026-10-09T10:05:00.000Z',
      lastReadAt: '2026-10-09T10:05:00.000Z',
    });
    // My own persona reading the chat is not my ticks
    store.applyReceipt({
      conversationId: 'c1',
      identityId: 'ident-me',
      lastDeliveredAt: '2026-10-09T11:00:00.000Z',
      lastReadAt: '2026-10-09T11:00:00.000Z',
    });
    // An older receipt arriving late doesn't take the ticks back
    store.applyReceipt({
      conversationId: 'c1',
      identityId: 'ident-other',
      lastDeliveredAt: '2026-10-09T10:01:00.000Z',
      lastReadAt: null,
    });
    expect(useChatStore.getState().receiptByConversation.c1).toEqual({
      lastDeliveredAt: '2026-10-09T10:05:00.000Z',
      lastReadAt: '2026-10-09T10:05:00.000Z',
    });
  });
});
