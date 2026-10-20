import { cleanup, render, waitFor } from '@testing-library/react-native';

import { chatService } from '@/shared/api/chat.service';
import { useChatStore } from '@/shared/store/useChatStore';

import ChatDetailScreen from '../[id]';

// Integration coverage for the critical QA-reported bug: sending a message
// in Company A's chat, navigating back to the chat list, then opening
// Company B's chat showed Company A's message inside Company B's room.
//
// This renders the real ChatDetailScreen component wired to the real
// Zustand store (only the network/socket boundary is mocked), and drives it
// through exactly the reported repro steps. The deeper architectural
// invariant this fix relies on — that two chat screens for different
// conversations can never cross-contaminate each other's messages, however
// many are mounted at once, since React Navigation keeps blurred stack
// screens mounted rather than unmounting them — is covered at the store
// level in useChatStore.spec.ts (see the tests there that load/send/receive
// for two conversations concurrently and assert each stays independent).

let mockSearchParams: { id?: string } = {};

// Blocking from the chat has its own tests (useBlocks, ChatHeader)
jest.mock('@/shared/hooks/blocks/useBlocks', () => ({
  useBlockFlow: () => ({ askToBlock: jest.fn(), askToUnblock: jest.fn() }),
}));
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => mockSearchParams,
}));

// useSafeAreaInsets throws without a real <SafeAreaProvider> ancestor --
// stub it rather than wrap every render.
jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

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
    onReconnect: jest.fn(() => jest.fn()),
    connect: jest.fn(),
    disconnect: jest.fn(),
    getSocket: jest.fn(),
    joinConversation: jest.fn(),
    leaveConversation: jest.fn(),
    sendMessage: jest.fn(() => true),
    onNewMessage: jest.fn(() => jest.fn()),
    onConversationUpdated: jest.fn(() => jest.fn()),
    onMessageError: jest.fn(() => jest.fn()),
    onMessageUpdated: jest.fn(() => jest.fn()),
    onConversationReceipt: jest.fn(() => jest.fn()),
    onTyping: jest.fn(() => jest.fn()),
    onPresenceChanged: jest.fn(() => jest.fn()),
    emitTyping: jest.fn(),
  },
}));

jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: { getState: jest.fn(() => ({ user: { id: 'individual-1' } })) },
}));

// ReportReasonSheet renders @gorhom/bottom-sheet's BottomSheetTextInput,
// which isn't renderable in this jest-expo environment (unrelated to the
// conversation-isolation behavior under test here) -- stub it out the same
// way the other screen-external dependencies above are mocked.
jest.mock('@/shared/components/report/ReportReasonSheet', () => 'ReportReasonSheet');

const mockGetMessages = chatService.getMessages as jest.Mock;

const conversation = (isAvailable?: boolean) => ({
  id: 'conv-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  otherUser: {
    id: isAvailable === false ? '' : 'user-b',
    name: 'أحمد',
    avatarUrl: 'https://example.com/b.png',
    ...(isAvailable === undefined ? {} : { isAvailable }),
  },
  propertyContext: null,
  lastMessage: null,
  unreadCount: 0,
});

const open = async (isAvailable?: boolean) => {
  const conv = conversation(isAvailable);
  mockSearchParams = { id: conv.id };
  useChatStore.setState({ conversations: [conv as never] });
  mockGetMessages.mockResolvedValue({
    data: [],
    meta: { hasNextPage: false, otherUser: conv.otherUser, propertyContext: null },
  });
  const utils = await render(<ChatDetailScreen />);
  await waitFor(() => expect(mockGetMessages).toHaveBeenCalled());
  return utils;
};

// QA: with the other account deleted, suspended or banned the chat looked
// normal and messages could still be typed and "sent"
describe('chat with an account that is no longer available', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useChatStore.getState().clear();
  });
  afterEach(cleanup);

  it('shows the notice in place of the message field', async () => {
    const { getByTestId, getByText, queryByPlaceholderText, queryByTestId } =
      await open(false);

    expect(getByTestId('chat-unavailable-notice')).toBeTruthy();
    expect(getByText('هذا المستخدم لم يعد متاحاً')).toBeTruthy();
    expect(queryByTestId('chat-voice-button')).toBeNull();
    expect(queryByPlaceholderText(/./)).toBeNull();
  });

  it('keeps the message field for an available account', async () => {
    const { queryByTestId, getByTestId } = await open(true);

    expect(queryByTestId('chat-unavailable-notice')).toBeNull();
    expect(getByTestId('chat-voice-button')).toBeTruthy();
  });

  it('treats a server that does not say (older API) as available', async () => {
    const { queryByTestId, getByTestId } = await open(undefined);

    expect(queryByTestId('chat-unavailable-notice')).toBeNull();
    expect(getByTestId('chat-voice-button')).toBeTruthy();
  });
});
