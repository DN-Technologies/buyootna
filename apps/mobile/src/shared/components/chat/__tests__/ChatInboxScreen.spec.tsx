import { fireEvent, render } from '@testing-library/react-native';

import { useChatLiveStore } from '@/shared/store/useChatLiveStore';

import ChatInboxScreen from '../ChatInboxScreen';

const mockPush = jest.fn();
let mockToken: string | null = 'token';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
}));

jest.mock('@react-navigation/native', () => ({ useFocusEffect: jest.fn() }));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return { Image: (props: object) => <View {...props} /> };
});

jest.mock('@shopify/flash-list', () => {
  const { View } = require('react-native');
  return {
    FlashList: ({ data, renderItem, ListEmptyComponent }: any) =>
      data?.length ? (
        <View>
          {data.map((item: { id: string }) => (
            <View key={item.id}>{renderItem({ item })}</View>
          ))}
        </View>
      ) : typeof ListEmptyComponent === 'function' ? (
        <ListEmptyComponent />
      ) : (
        (ListEmptyComponent ?? null)
      ),
  };
});

jest.mock('@/shared/components/auth/GuestEmptyState', () => 'GuestEmptyState');
jest.mock('@/shared/components/chat/EmptyChatState', () => 'EmptyChatState');
jest.mock('@/shared/components/skeletons/ChatSkeleton', () => 'ChatSkeleton');

jest.mock('@/shared/hooks/chat/useConversationSearch', () => ({
  useConversationSearch: () => ({ results: [], isSearching: false }),
}));
jest.mock('@/shared/hooks/device/usePullToRefresh', () => ({
  usePullToRefresh: () => ({ refreshing: false, onRefresh: jest.fn() }),
}));
jest.mock('@/shared/hooks/device/useReloadOnResume', () => ({
  useReloadOnResume: jest.fn(),
}));

jest.mock('@/shared/services/socket.service', () => ({
  socketService: {
    onConversationUpdated: jest.fn(() => jest.fn()),
    onConversationReceipt: jest.fn(() => jest.fn()),
    onNewMessage: jest.fn(() => jest.fn()),
    onTyping: jest.fn(() => jest.fn()),
    onPresenceChanged: jest.fn(() => jest.fn()),
  },
}));

jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ token: mockToken }),
}));

const conversation = (over: object) => ({
  createdAt: '2026-10-11T10:00:00Z',
  updatedAt: '2026-10-11T10:00:00Z',
  propertyContext: null,
  requestContext: null,
  lastMessage: {
    id: 'm',
    content: 'مرحبا',
    type: 'TEXT',
    createdAt: '2026-10-11T10:00:00Z',
    isMine: false,
  },
  unreadCount: 0,
  ...over,
});

const mockConversations = [
  conversation({
    id: 'c-request',
    otherUser: { id: 'p1', name: 'محمد العتيبي', avatarUrl: 'https://x/1.jpg' },
    requestContext: { id: 'req-1', title: 'طلب تشطيب شقة' },
    unreadCount: 3,
  }),
  conversation({
    id: 'c-property',
    otherUser: { id: 'p2', name: 'سالم', avatarUrl: 'https://x/2.jpg' },
    propertyContext: { id: 'prop-1', category: 'APARTMENT', location: 'السالمية' },
  }),
];

jest.mock('@/shared/store/useChatStore', () => ({
  useChatStore: Object.assign(
    (selector: (state: unknown) => unknown) =>
      selector({
        conversations: mockConversations,
        loadConversations: jest.fn(),
        receiveMessage: jest.fn(),
        isLoadingConversations: false,
      }),
    { getState: () => ({ applyReceipt: jest.fn() }) },
  ),
}));

describe('ChatInboxScreen (Figma 4410:167991)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToken = 'token';
    useChatLiveStore.getState().reset();
  });

  it('lists the chats with what each is about', async () => {
    const { getByText, getByTestId } = await render(<ChatInboxScreen />);

    expect(getByText('محادثاتي')).toBeTruthy();
    expect(getByText('محمد العتيبي')).toBeTruthy();
    expect(getByText('طلب عرض سعر')).toBeTruthy();
    expect(getByText(/السالمية$/)).toBeTruthy();
    expect(getByTestId('chat-inbox-back')).toBeTruthy();

    await fireEvent.press(getByTestId('chat-list-item-c-request'));
    expect(mockPush).toHaveBeenCalledWith('/chat/c-request');
  });

  it('غير المقروء keeps only chats with unread messages', async () => {
    const { getByTestId, queryByText, getByText } = await render(
      <ChatInboxScreen />,
    );

    await fireEvent.press(getByTestId('chat-inbox-tab-UNREAD'));
    expect(getByText('محمد العتيبي')).toBeTruthy();
    expect(queryByText('سالم')).toBeNull();

    await fireEvent.press(getByTestId('chat-inbox-tab-ALL'));
    expect(getByText('سالم')).toBeTruthy();
  });

  // QA (Galaxy A36): 'غير المقروء' wrapped onto two lines and was cut
  it.each([
    ['ALL', 'الكل'],
    ['UNREAD', 'غير المقروء'],
  ])('keeps the %s tab label on one full-height line', async (id, label) => {
    const { getByTestId } = await render(<ChatInboxScreen />);

    const text = getByTestId(`chat-inbox-tab-label-${id}`);
    expect(text.props.children).toBe(label);
    expect(text.props.numberOfLines).toBe(1);
    expect(text.props.style?.letterSpacing).toBeUndefined();
    expect(String(text.props.className)).toContain('leading-[22px]');
  });

  it('shows who is online and who is typing', async () => {
    useChatLiveStore.getState().setOnline('p2', true);
    useChatLiveStore.getState().setTyping('c-request', true);
    const { getAllByTestId, getByTestId } = await render(<ChatInboxScreen />);

    expect(getAllByTestId('chat-online-dot')).toHaveLength(1);
    expect(getByTestId('chat-list-typing')).toBeTruthy();
    useChatLiveStore.getState().reset();
  });

  it('as a tab it has no back arrow', async () => {
    const { queryByTestId, getByText } = await render(
      <ChatInboxScreen variant="tab" />,
    );

    expect(getByText('محادثاتي')).toBeTruthy();
    expect(queryByTestId('chat-inbox-back')).toBeNull();
  });

  it('asks a guest to sign in instead of listing chats', async () => {
    mockToken = null;
    const { queryByText, queryByTestId } = await render(<ChatInboxScreen />);

    expect(queryByText('محمد العتيبي')).toBeNull();
    // Neither the search nor the tabs: only the sign-in prompt
    expect(queryByTestId('chat-inbox-search')).toBeNull();
    expect(queryByTestId('chat-inbox-tab-ALL')).toBeNull();
  });
});
