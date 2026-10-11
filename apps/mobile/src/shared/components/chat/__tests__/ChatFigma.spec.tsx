import { fireEvent, render } from '@testing-library/react-native';

import ChatHeader from '../ChatHeader';
import ChatListItem from '../ChatListItem';
import ChatPinnedPropertyBar from '../ChatPinnedPropertyBar';
import MessageBubble from '../MessageBubble';
import ReplyQuote from '../ReplyQuote';

jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return { Image: (props: object) => <View {...props} /> };
});

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}));

const item = (over: object = {}) => (
  <ChatListItem
    id="c1"
    user={{ name: 'أحمد', avatarUrl: 'https://x/a.jpg', isOnline: false }}
    propertyContext="طلب عرض سعر"
    lastMessage="مرحبا"
    timestamp="2:22 م"
    onPress={jest.fn()}
    {...over}
  />
);

describe('ChatListItem (Figma 4410:167994)', () => {
  it('shows the tag, the preview and the unread badge', async () => {
    const { getByText, getByTestId, queryByTestId } = await render(
      item({ unreadCount: 3 }),
    );

    expect(getByText('طلب عرض سعر')).toBeTruthy();
    expect(getByText('مرحبا')).toBeTruthy();
    expect(getByTestId('chat-unread-badge')).toBeTruthy();
    expect(queryByTestId('chat-online-dot')).toBeNull();
  });

  it('shows "يكتب الان..." instead of the preview while they type', async () => {
    const { getByTestId, queryByText } = await render(item({ isTyping: true }));

    expect(getByTestId('chat-list-typing').props.children).toBe('يكتب الان...');
    expect(queryByText('مرحبا')).toBeNull();
  });

  it('marks who is online, and falls back to an initial without a photo', async () => {
    const { getByTestId, getByText } = await render(
      item({
        user: {
          name: 'أحمد',
          avatarUrl: '@/assets/images/no-image.png',
          isOnline: true,
        },
      }),
    );

    expect(getByTestId('chat-online-dot')).toBeTruthy();
    expect(getByTestId('chat-avatar-initial')).toBeTruthy();
    expect(getByText('أ')).toBeTruthy();
  });
});

describe('ChatHeader status', () => {
  const header = (over: object = {}) => (
    <ChatHeader
      userName="دار العقار الحديث"
      avatarUrl="https://x/a.jpg"
      onReportUser={jest.fn()}
      showMoreMenu={false}
      setShowMoreMenu={jest.fn()}
      {...over}
    />
  );

  it('says nothing when they are offline', async () => {
    const { queryByTestId, getByTestId } = await render(header());

    expect(getByTestId('chat-header-name').props.children).toBe(
      'دار العقار الحديث',
    );
    expect(queryByTestId('chat-header-online')).toBeNull();
    expect(queryByTestId('chat-header-typing')).toBeNull();
  });

  it('shows "متصل" with the dot when they are online', async () => {
    const { getByTestId, getByText } = await render(header({ isOnline: true }));

    expect(getByTestId('chat-header-online')).toBeTruthy();
    expect(getByTestId('chat-header-online-dot')).toBeTruthy();
    expect(getByText('متصل')).toBeTruthy();
  });

  it('shows "يكتب الان..." over the status while they type', async () => {
    const { getByTestId, queryByTestId } = await render(
      header({ isOnline: true, isTyping: true }),
    );

    expect(getByTestId('chat-header-typing')).toBeTruthy();
    expect(queryByTestId('chat-header-online')).toBeNull();
  });
});

describe('MessageBubble colours', () => {
  it('mine is navy with white text, theirs light with dark text', async () => {
    const mine = await render(
      <MessageBubble text="لي" isMine timestamp="2:22 م" status="read" />,
    );
    expect(String(mine.getByText('لي').props.className)).toContain('text-white');
    expect(mine.getByTestId('message-bubble-mine')).toBeTruthy();
    expect(mine.getByTestId('ticks-read')).toBeTruthy();

    const theirs = await render(
      <MessageBubble text="له" isMine={false} timestamp="2:22 م" />,
    );
    expect(String(theirs.getByText('له').props.className)).toContain(
      'text-[#111111]',
    );
    expect(theirs.queryByTestId('ticks-read')).toBeNull();
  });

  it('shows the quoted message inside the bubble', async () => {
    const { getByTestId, getByText } = await render(
      <MessageBubble
        text="حسنا في انتظارك."
        isMine={false}
        timestamp="2:22 م"
        quote={
          <ReplyQuote
            reply={{
              id: 'm0',
              type: 'TEXT',
              content: 'أرغب في معاينة الشقة',
              isMine: true,
            }}
            otherName="محمد"
          />
        }
      />,
    );

    expect(getByTestId('reply-quote')).toBeTruthy();
    expect(getByText('أرغب في معاينة الشقة')).toBeTruthy();
    expect(getByTestId('reply-quote-name').props.children).toBe('أنت');
  });
});

describe('ChatPinnedPropertyBar', () => {
  const property = {
    id: 'prop-1',
    type: 'RENT',
    category: 'APARTMENT',
    imageUrl: '',
    price: 450,
    location: 'السالمية',
  };

  it('pins the request the chat is about, ahead of an ad', async () => {
    const onPressRequest = jest.fn();
    const { getByTestId, getByText, queryByTestId } = await render(
      <ChatPinnedPropertyBar
        visible
        onDismiss={jest.fn()}
        onPressProperty={jest.fn()}
        onPressRequest={onPressRequest}
        propertyContext={property}
        requestContext={{
          id: 'req-1',
          title: 'طلب تشطيب شقة',
          location: 'السالمية',
          priceRange: '450,000 د.ك',
          status: 'pending',
        }}
      />,
    );

    expect(getByText('طلب تشطيب شقة')).toBeTruthy();
    expect(getByText('السالمية • 450,000 د.ك')).toBeTruthy();
    expect(queryByTestId('chat-pinned-property')).toBeNull();
    await fireEvent.press(getByTestId('chat-pinned-request'));
    expect(onPressRequest).toHaveBeenCalledWith('req-1');
  });

  it('pins the ad when there is no request', async () => {
    const onPressProperty = jest.fn();
    const { getByTestId, getByText } = await render(
      <ChatPinnedPropertyBar
        visible
        onDismiss={jest.fn()}
        onPressProperty={onPressProperty}
        propertyContext={property}
      />,
    );

    expect(getByText('السالمية • 450 د.ك')).toBeTruthy();
    await fireEvent.press(getByTestId('chat-pinned-property'));
    expect(onPressProperty).toHaveBeenCalledWith('prop-1');
  });

  it('shows nothing without either', async () => {
    const { toJSON } = await render(
      <ChatPinnedPropertyBar
        visible
        onDismiss={jest.fn()}
        onPressProperty={jest.fn()}
      />,
    );

    expect(toJSON()).toBeNull();
  });
});
