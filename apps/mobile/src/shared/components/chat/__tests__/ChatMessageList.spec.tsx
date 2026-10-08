import 'react-native-gesture-handler/jestSetup';

import { fireEvent, render } from '@testing-library/react-native';

import ChatMessageList from '@/shared/components/chat/ChatMessageList';
import { DisplayMessage } from '@/shared/utils/chatDate';

// QA: a chat opened again showed nothing, even though the API returned its
// messages. The list used to be swapped out for a spinner while loading and
// mounted fresh once data arrived.
describe('ChatMessageList', () => {
  const message = (overrides: Partial<DisplayMessage> = {}) =>
    ({
      id: 'm1',
      type: 'TEXT',
      content: 'هاي',
      isMine: true,
      timestamp: '٠٠:٥٣',
      createdAt: new Date(2026, 9, 8, 0, 53).toISOString(),
      ...overrides,
    }) as DisplayMessage;

  const setup = async (props: Partial<Parameters<typeof ChatMessageList>[0]> = {}) => {
    const listRef = {
      current: { scrollToEnd: jest.fn(), scrollToIndex: jest.fn() },
    } as any;
    const utils = await render(
      <ChatMessageList
        listRef={listRef}
        messages={[]}
        onLoadMore={jest.fn()}
        onPressProperty={jest.fn()}
        onPressImage={jest.fn()}
        {...props}
      />,
    );
    return { ...utils, listRef };
  };

  beforeEach(() => {
    jest
      .spyOn(global, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      });
  });

  afterEach(() => jest.restoreAllMocks());

  it('shows messages that arrive after the loading state', async () => {
    const { rerender, getByTestId, queryByTestId, getByText, listRef } = await setup({
      isLoading: true,
    });
    expect(getByTestId('chat-messages-loading')).toBeTruthy();

    await rerender(
      <ChatMessageList
        listRef={listRef}
        messages={[message()]}
        onLoadMore={jest.fn()}
        onPressProperty={jest.fn()}
        onPressImage={jest.fn()}
        isLoading={false}
      />,
    );

    expect(queryByTestId('chat-messages-loading')).toBeNull();
    expect(getByText('هاي')).toBeTruthy();
    // Lands on the newest message once history first arrives
    expect(listRef.current.scrollToEnd).toHaveBeenCalledWith({
      animated: false,
    });
  });

  it("shows the time from createdAt with western digits, not the server's string", async () => {
    const { getByText, queryByText } = await setup({ messages: [message()] });

    expect(getByText('12:53 ص')).toBeTruthy();
    expect(queryByText('٠٠:٥٣')).toBeNull();
  });

  it('offers a retry when loading failed', async () => {
    const onRetry = jest.fn();
    const { getByTestId } = await setup({ loadFailed: true, onRetry });

    await fireEvent.press(getByTestId('chat-messages-retry'));

    expect(onRetry).toHaveBeenCalled();
  });

  describe('replies', () => {
    const original = message({ id: 'm1', content: 'هل العقار متاح؟', isMine: false });
    const reply = message({
      id: 'm2',
      content: 'نعم',
      isMine: true,
      replyTo: { id: 'm1', type: 'TEXT', content: 'هل العقار متاح؟', isMine: false },
    } as Partial<DisplayMessage>);

    it("shows the quoted message with the other person's name", async () => {
      const { getAllByTestId, getByText } = await setup({
        messages: [original, reply],
        otherUserName: 'Ebrahim',
        onReply: jest.fn(),
        onLongPressMessage: jest.fn(),
      });

      expect(getAllByTestId('reply-quote')).toHaveLength(1);
      expect(getByText('Ebrahim')).toBeTruthy();
    });

    it('jumps to the original when the quote is tapped', async () => {
      const { getByTestId, listRef } = await setup({
        messages: [original, reply],
        otherUserName: 'Ebrahim',
        onReply: jest.fn(),
      });

      await fireEvent.press(getByTestId('reply-quote'));

      expect(listRef.current.scrollToIndex).toHaveBeenCalledWith(
        expect.objectContaining({ index: 0 }),
      );
    });

    it('shows a deleted original as رسالة محذوفة', async () => {
      const { getByText } = await setup({
        messages: [
          message({ id: 'm3', replyTo: { id: 'gone', deleted: true } } as Partial<DisplayMessage>),
        ],
      });

      expect(getByText('رسالة محذوفة')).toBeTruthy();
    });
  });

  it('shows a sent photo + document message; tapping opens the viewer or the file', async () => {
    const onOpenPhotos = jest.fn();
    const onOpenFile = jest.fn();
    const attachments = [
      { id: 'a1', kind: 'IMAGE' as const, fileName: '1.jpg', mimeType: 'image/jpeg', size: 10, url: 'https://s/1' },
      { id: 'a2', kind: 'FILE' as const, fileName: 'عقد.pdf', mimeType: 'application/pdf', size: 2048, url: 'https://s/2' },
    ];
    const { getByTestId, getByText } = await setup({
      messages: [message({ type: 'FILE', content: 'التفاصيل', attachments })],
      onOpenPhotos,
      onOpenFile,
    });

    expect(getByText('عقد.pdf')).toBeTruthy();
    expect(getByText('التفاصيل')).toBeTruthy();
    await fireEvent.press(getByTestId('attachment-photo-0'));
    expect(onOpenPhotos).toHaveBeenCalledWith(['https://s/1'], 0);
    await fireEvent.press(getByTestId('attachment-file-0'));
    expect(onOpenFile).toHaveBeenCalledWith(attachments[1]);
  });

  it('a failed attachment send offers a retry', async () => {
    const onRetryAttachments = jest.fn();
    const { getByTestId } = await setup({
      messages: [
        message({
          id: 'temp-1',
          type: 'IMAGE',
          content: undefined,
          failed: true,
          localAttachments: [
            { uri: 'file:///1.jpg', name: '1.jpg', mimeType: 'image/jpeg', kind: 'IMAGE' },
          ],
        }),
      ],
      onRetryAttachments,
    });
    await fireEvent.press(getByTestId('attachment-retry'));
    expect(onRetryAttachments).toHaveBeenCalledWith('temp-1');
  });

  it('scrolls to the in-chat search match', async () => {
    const { listRef } = await setup({
      messages: [message({ id: 'm1' }), message({ id: 'm2', content: 'متاح' })],
      focusMessageId: 'm2',
    });
    expect(listRef.current.scrollToIndex).toHaveBeenCalledWith(
      expect.objectContaining({ index: 1 }),
    );
  });
});
