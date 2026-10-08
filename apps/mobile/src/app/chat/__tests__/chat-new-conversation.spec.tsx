import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { chatService } from '@/shared/api/chat.service';
import { socketService } from '@/shared/services/socket.service';
import { useChatStore } from '@/shared/store/useChatStore';
import { showAlert } from '@/shared/utils/alert';

import ChatDetailScreen from '../[id]';

// Tapping مراسلة opens this screen at once as /chat/new?recipientId=...;
// the conversation is created here, behind a loading state, instead of the
// tap waiting on the network before navigating.

let mockSearchParams: Record<string, string> = {};

jest.mock('expo-router', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    setParams: jest.fn(),
  };
  return {
    router: mockRouter,
    useRouter: () => mockRouter,
    useLocalSearchParams: () => mockSearchParams,
  };
});

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
  },
}));

jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: { getState: jest.fn(() => ({ user: { id: 'individual-1' } })) },
}));

jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

jest.mock('@/shared/components/report/ReportReasonSheet', () => 'ReportReasonSheet');

const mockCreate = chatService.createConversation as jest.Mock;
const mockGetMessages = chatService.getMessages as jest.Mock;

const companyUser = {
  id: 'company-a',
  name: 'Company A',
  avatarUrl: 'https://example.com/a.png',
};

describe('ChatDetailScreen — opened before the conversation exists', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useChatStore.getState().clear();
    mockSearchParams = {
      id: 'new',
      recipientId: 'company-a',
      propertyId: 'prop-1',
    };
    mockGetMessages.mockResolvedValue({
      data: [],
      meta: { hasNextPage: false, otherUser: companyUser, propertyContext: null },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders at once with a loading state while the conversation is created', async () => {
    mockCreate.mockReturnValue(new Promise(() => {})); // still in flight

    const { getByTestId } = await render(<ChatDetailScreen />);

    expect(getByTestId('chat-messages-loading')).toBeTruthy();
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith('company-a', 'prop-1');
    // Nothing joined or loaded against a placeholder id
    expect(socketService.joinConversation).not.toHaveBeenCalled();
    expect(mockGetMessages).not.toHaveBeenCalled();
  });

  it("doesn't send anything before the conversation exists", async () => {
    mockCreate.mockReturnValue(new Promise(() => {}));

    const { getByPlaceholderText, getByTestId } = await render(
      <ChatDetailScreen />,
    );
    await fireEvent.changeText(getByPlaceholderText(/اكتب/), 'مرحبا');
    await fireEvent.press(getByTestId('chat-send-button'));

    expect(socketService.sendMessage).not.toHaveBeenCalled();
  });

  it('switches to the real conversation once it is created', async () => {
    mockCreate.mockResolvedValue({ id: 'conv-new' });

    const { findByText } = await render(<ChatDetailScreen />);

    await waitFor(() =>
      expect(router.setParams).toHaveBeenCalledWith({ id: 'conv-new' }),
    );
    await waitFor(() =>
      expect(socketService.joinConversation).toHaveBeenCalledWith('conv-new'),
    );
    expect(mockGetMessages).toHaveBeenCalledWith('conv-new', undefined, 20);
    // Header fills in from the messages response
    expect(await findByText('Company A')).toBeTruthy();
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('explains and goes back when the conversation cannot be created', async () => {
    mockCreate.mockRejectedValue({
      response: { data: { message: 'لا يمكنك مراسلة هذا الحساب' } },
    });

    await render(<ChatDetailScreen />);

    await waitFor(() =>
      expect(showAlert).toHaveBeenCalledWith(
        'تنبيه',
        'لا يمكنك مراسلة هذا الحساب',
      ),
    );
    expect(router.back).toHaveBeenCalled();
  });

  it('still opens an existing conversation by id without creating one', async () => {
    mockSearchParams = { id: 'conv-existing' };

    await render(<ChatDetailScreen />);

    expect(mockCreate).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(socketService.joinConversation).toHaveBeenCalledWith(
        'conv-existing',
      ),
    );
  });
});
