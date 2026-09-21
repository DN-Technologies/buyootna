import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';

import { chatService } from '@/shared/api/chat.service';
import { socketService } from '@/shared/services/socket.service';
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

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => mockSearchParams,
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
    connect: jest.fn(),
    disconnect: jest.fn(),
    getSocket: jest.fn(),
    joinConversation: jest.fn(),
    leaveConversation: jest.fn(),
    sendMessage: jest.fn(),
    onNewMessage: jest.fn(() => jest.fn()),
    onConversationUpdated: jest.fn(() => jest.fn()),
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

const conversationA = {
  id: 'conv-company-a',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  otherUser: { id: 'company-a', name: 'Company A', avatarUrl: 'https://example.com/a.png' },
  propertyContext: null,
  lastMessage: null,
  unreadCount: 0,
};

const conversationB = {
  id: 'conv-company-b',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  otherUser: { id: 'company-b', name: 'Company B', avatarUrl: 'https://example.com/b.png' },
  propertyContext: null,
  lastMessage: null,
  unreadCount: 0,
};

function mockEmptyHistoryFor(conversationId: string) {
  return Promise.resolve({
    data: [],
    meta: {
      hasNextPage: false,
      otherUser:
        conversationId === conversationB.id
          ? conversationB.otherUser
          : conversationA.otherUser,
      propertyContext: null,
    },
  });
}

describe('ChatDetailScreen — conversation isolation (integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useChatStore.getState().clear();
    useChatStore.setState({ conversations: [conversationA, conversationB] });
    mockGetMessages.mockImplementation((conversationId: string) =>
      mockEmptyHistoryFor(conversationId),
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("never shows a message sent in Company A's room inside Company B's room after navigating back and opening a different chat", async () => {
    // 1/2. Open Company A's chat.
    mockSearchParams = { id: conversationA.id };
    const screenA = await render(<ChatDetailScreen />);

    await waitFor(() => {
      expect(mockGetMessages).toHaveBeenCalledWith(conversationA.id, undefined, 20);
    });

    // 3. Type and send a distinct message.
    const input = screenA.getByPlaceholderText('اكتب رسالتك..');
    await fireEvent.changeText(input, 'Test message for Company A');
    await fireEvent.press(screenA.getByTestId('chat-send-button'));

    await waitFor(() => {
      expect(screenA.getByText('Test message for Company A')).toBeTruthy();
    });
    expect(socketService.sendMessage).toHaveBeenCalledWith(conversationA.id, {
      content: 'Test message for Company A',
      type: 'TEXT',
    });

    // 4. Navigate back to the main chat list — unmount Company A's screen.
    screenA.unmount();

    // 5. Open a different conversation, with Company B.
    mockSearchParams = { id: conversationB.id };
    const screenB = await render(<ChatDetailScreen />);

    await waitFor(() => {
      expect(mockGetMessages).toHaveBeenCalledWith(conversationB.id, undefined, 20);
    });

    // 6. Company B's chat history must never show Company A's message —
    // neither in the rendered screen nor in the underlying store.
    expect(screenB.queryByText('Test message for Company A')).toBeNull();
    expect(
      useChatStore
        .getState()
        .messagesByConversation[conversationB.id]?.some(
          (m) => m.content === 'Test message for Company A',
        ),
    ).toBeFalsy();
    // And Company A's own message is still intact in its own slice — this
    // is a fix for isolation, not a message-loss regression.
    expect(
      useChatStore
        .getState()
        .messagesByConversation[conversationA.id]?.some(
          (m) => m.content === 'Test message for Company A',
        ),
    ).toBe(true);

    screenB.unmount();
  });
});
