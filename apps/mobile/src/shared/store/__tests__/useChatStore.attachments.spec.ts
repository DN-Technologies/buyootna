import { chatService } from '@/shared/api/chat.service';
import { socketService } from '@/shared/services/socket.service';

import { useChatStore } from '../useChatStore';

jest.mock('@/shared/api/chat.service', () => ({
  chatService: {
    uploadAttachments: jest.fn(),
    markAsRead: jest.fn().mockResolvedValue({ success: true }),
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

const photo = (name: string) => ({
  uri: `file:///${name}`,
  name,
  mimeType: 'image/jpeg',
  size: 1000,
  kind: 'IMAGE' as const,
});
const pdf = {
  uri: 'file:///عقد.pdf',
  name: 'عقد.pdf',
  mimeType: 'application/pdf',
  size: 5000,
  kind: 'FILE' as const,
};
const messages = () => useChatStore.getState().messagesByConversation.c1 ?? [];

describe('useChatStore — attachments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useChatStore.getState().clear();
  });

  it('shows the photos at once, uploads them, then sends their ids with the caption', async () => {
    (chatService.uploadAttachments as jest.Mock).mockImplementation(
      async (_c, _files, onProgress) => {
        onProgress(0.5);
        return [{ id: 'a1' }, { id: 'a2' }];
      },
    );

    const sending = useChatStore.getState().sendAttachments('c1', {
      files: [photo('1.jpg'), photo('2.jpg')],
      caption: ' شقة الدور الثاني ',
    });
    // Pending bubble before the upload finishes
    expect(messages()[0]).toMatchObject({
      type: 'IMAGE',
      content: 'شقة الدور الثاني',
      sending: true,
    });
    expect(messages()[0].localAttachments).toHaveLength(2);
    await sending;

    expect(socketService.sendMessage).toHaveBeenCalledWith('c1', {
      content: 'شقة الدور الثاني',
      type: 'IMAGE',
      attachmentIds: ['a1', 'a2'],
      replyToId: undefined,
      tempId: messages()[0].id,
    });
  });

  it('a document makes it a FILE message', async () => {
    (chatService.uploadAttachments as jest.Mock).mockResolvedValue([{ id: 'a1' }]);
    await useChatStore.getState().sendAttachments('c1', { files: [photo('1.jpg'), pdf] });
    expect((socketService.sendMessage as jest.Mock).mock.calls[0][1].type).toBe('FILE');
  });

  it('a failed upload stays as a bubble to retry, and retrying sends it', async () => {
    (chatService.uploadAttachments as jest.Mock).mockRejectedValueOnce(new Error('offline'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await useChatStore.getState().sendAttachments('c1', { files: [pdf] });
    expect(messages()[0]).toMatchObject({ failed: true, sending: false });
    expect(socketService.sendMessage).not.toHaveBeenCalled();

    (chatService.uploadAttachments as jest.Mock).mockResolvedValueOnce([{ id: 'a9' }]);
    await useChatStore.getState().retryAttachments('c1', messages()[0].id);

    expect(messages()[0]).toMatchObject({ failed: false });
    expect((socketService.sendMessage as jest.Mock).mock.calls[0][1].attachmentIds).toEqual([
      'a9',
    ]);
  });

  it("the server's message replaces the pending photo bubble (no caption)", async () => {
    (chatService.uploadAttachments as jest.Mock).mockResolvedValue([{ id: 'a1' }]);
    await useChatStore.getState().sendAttachments('c1', { files: [photo('1.jpg')] });

    useChatStore.getState().receiveMessage('c1', {
      id: 'm1',
      type: 'IMAGE',
      senderIdentityId: 'ident-me',
      isMine: true,
      timestamp: '',
      createdAt: new Date().toISOString(),
      attachments: [
        {
          id: 'a1',
          kind: 'IMAGE',
          fileName: '1.jpg',
          mimeType: 'image/jpeg',
          size: 1000,
          url: 'https://signed/1',
        },
      ],
    } as never);

    expect(messages().map((m) => m.id)).toEqual(['m1']);
  });
});
