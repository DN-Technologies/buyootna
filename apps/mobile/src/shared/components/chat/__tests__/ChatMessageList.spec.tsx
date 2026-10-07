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
    const listRef = { current: { scrollToEnd: jest.fn() } } as any;
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

    expect(getByText('00:53')).toBeTruthy();
    expect(queryByText('٠٠:٥٣')).toBeNull();
  });

  it('offers a retry when loading failed', async () => {
    const onRetry = jest.fn();
    const { getByTestId } = await setup({ loadFailed: true, onRetry });

    await fireEvent.press(getByTestId('chat-messages-retry'));

    expect(onRetry).toHaveBeenCalled();
  });
});
