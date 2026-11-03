import { act, renderHook } from '@testing-library/react-native';

import { ChatMessage, StoryReplyTarget } from '@/shared/api/chat.service';
import { useChatStore } from '@/shared/store/useChatStore';

import { useChatConversation } from '../useChatConversation';

jest.mock('@/shared/services/socket.service', () => ({
  socketService: {
    sendMessage: jest.fn(() => true),
    joinConversation: jest.fn(),
    leaveConversation: jest.fn(),
    onReconnect: jest.fn(() => () => undefined),
    onNewMessage: jest.fn(() => () => undefined),
    onConversationReceipt: jest.fn(() => () => undefined),
    onMessageUpdated: jest.fn(() => () => undefined),
    onMessageError: jest.fn(() => () => undefined),
    onMessagesHidden: jest.fn(() => () => undefined),
  },
}));
jest.mock('expo-clipboard', () => ({}));

const target: StoryReplyTarget = {
  storyId: 's1',
  preview: {
    mediaType: 'IMAGE',
    thumbnailUrl: 'https://x/t.jpg',
    isLive: true,
    authorIdentityId: 'author',
    unavailable: false,
  },
};

describe('useChatConversation replying to a story', () => {
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const sendMessage = jest.fn(() => true);

  // Sending scrolls the list on the next frame: flushed here, so that timer
  // never fires after the test (it broke later suites in CI)
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    useChatStore.setState({
      sendMessage,
      loadMessages: jest.fn(),
      markConversationAsRead: jest.fn(),
      setActiveConversation: jest.fn(),
    } as never);
  });

  const setup = () =>
    renderHook(() =>
      useChatConversation({ conversationId: 'c1', initialStoryTarget: target }),
    );

  it('starts with the story from the viewer', async () => {
    const { result } = await setup();
    expect(result.current.storyTarget).toEqual(target);
  });

  it('only the next message carries it', async () => {
    const { result } = await setup();
    await act(async () => result.current.setInputText('كم السعر؟'));
    await act(async () => result.current.handleSendMessage());
    expect(sendMessage).toHaveBeenLastCalledWith(
      'c1',
      expect.objectContaining({ storyReply: target }),
    );
    expect(result.current.storyTarget).toBeNull();

    await act(async () => result.current.setInputText('وأيضاً'));
    await act(async () => result.current.handleSendMessage());
    expect(sendMessage).toHaveBeenLastCalledWith(
      'c1',
      expect.objectContaining({ storyReply: undefined }),
    );
  });

  it('✕ sends a plain message instead', async () => {
    const { result } = await setup();
    await act(async () => result.current.setStoryTarget(null));
    await act(async () => result.current.setInputText('مرحبا'));
    await act(async () => result.current.handleSendMessage());
    expect(sendMessage).toHaveBeenLastCalledWith(
      'c1',
      expect.objectContaining({ storyReply: undefined }),
    );
  });

  it('replying to a message replaces the story: never both', async () => {
    const { result } = await setup();
    await act(async () =>
      result.current.setReplyTarget({ id: 'm1' } as ChatMessage),
    );
    expect(result.current.storyTarget).toBeNull();
    expect(result.current.replyTarget).toEqual({ id: 'm1' });
  });
});
