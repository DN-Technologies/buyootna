import { ChatMessage, ConversationSummary } from '@/shared/api/chat.service';

import {
  isUnsent,
  optimisticMessage,
  pendingAttachmentsMessage,
  withConversationMeta,
  withLastMessage,
  withoutRefusedSend,
} from '../messageLists';

const msg = (over: Partial<ChatMessage>): ChatMessage =>
  ({
    id: 'm1',
    type: 'TEXT',
    isMine: false,
    timestamp: '',
    createdAt: '2026-10-14T10:00:00.000Z',
    ...over,
  }) as ChatMessage;

const conv = (id: string, unreadCount = 0): ConversationSummary =>
  ({
    id,
    createdAt: '',
    updatedAt: '',
    otherUser: { id: `u-${id}`, name: id, avatarUrl: '' },
    propertyContext: null,
    lastMessage: null,
    unreadCount,
  }) as ConversationSummary;

describe('chat message lists', () => {
  it('builds a pending bubble for an offer, a location and a reply', () => {
    const bubble = optimisticMessage('temp-9', {
      type: 'OFFER',
      proposal: { amount: 500, period: 'MONTHLY' } as never,
      latitude: 29.3,
      longitude: 48,
      locationLabel: 'السالمية',
      replyTo: msg({ id: 'm-q', content: 'كم السعر؟' }),
    });

    expect(bubble).toMatchObject({
      id: 'temp-9',
      type: 'OFFER',
      sending: true,
      isMine: true,
      location: { latitude: 29.3, longitude: 48, label: 'السالمية' },
      proposal: { id: 'temp-9', kind: 'OFFER', status: 'PENDING', amount: 500 },
      replyTo: { id: 'm-q', content: 'كم السعر؟' },
    });
    expect(isUnsent(bubble)).toBe(true);
    expect(isUnsent(msg({ id: 'm-server' }))).toBe(false);
  });

  it('types an attachments bubble from its files and trims the caption', () => {
    const bubble = pendingAttachmentsMessage(
      'temp-1',
      [{ uri: 'file:///a.jpg', name: 'a.jpg', mimeType: 'image/jpeg', kind: 'IMAGE' }],
      '  المطبخ  ',
    );
    expect(bubble).toMatchObject({ type: 'IMAGE', content: 'المطبخ', uploadProgress: 0 });
    expect(
      pendingAttachmentsMessage('temp-2', [{ uri: 'f', name: 'v', mimeType: 'audio/m4a', kind: 'AUDIO' }])
        .type,
    ).toBe('VOICE');
  });

  it('removes the refused send, or the latest sending bubble without an id', () => {
    const list = [
      msg({ id: 'temp-a', sending: true }),
      msg({ id: 'm-b' }),
      msg({ id: 'temp-c', sending: true }),
    ];
    expect(withoutRefusedSend(list, 'temp-a').map((m) => m.id)).toEqual(['m-b', 'temp-c']);
    expect(withoutRefusedSend(list).map((m) => m.id)).toEqual(['temp-a', 'm-b']);
  });

  it('keeps the header data of a conversation, or adds one it lacked', () => {
    const otherUser = { id: 'u-x', name: 'سالم', avatarUrl: '' };
    const listed = withConversationMeta([conv('c1')], 'c1', { otherUser });
    expect(listed[0].otherUser).toEqual(otherUser);

    const added = withConversationMeta([conv('c1')], 'c2', { otherUser });
    expect(added.map((c) => c.id)).toEqual(['c2', 'c1']);

    const untouched = [conv('c1')];
    expect(withConversationMeta(untouched, 'c1', {})).toBe(untouched);
  });

  it('moves the conversation up and counts unread only when it is not mine or open', () => {
    const list = [conv('c1'), conv('c2', 2)];
    const incoming = msg({ id: 'm-new', content: 'هلا' });

    const unread = withLastMessage(list, 'c2', incoming, { isMine: false, isOpen: false });
    expect(unread.map((c) => c.id)).toEqual(['c2', 'c1']);
    expect(unread[0].unreadCount).toBe(3);
    expect(unread[0].lastMessage).toMatchObject({ id: 'm-new', content: 'هلا', isMine: false });

    expect(withLastMessage(list, 'c2', incoming, { isMine: true, isOpen: false })[0].unreadCount).toBe(2);
    expect(withLastMessage(list, 'c2', incoming, { isMine: false, isOpen: true })[0].unreadCount).toBe(2);
  });
});
