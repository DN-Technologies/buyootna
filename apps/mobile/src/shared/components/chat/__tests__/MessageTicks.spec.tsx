import 'react-native-gesture-handler/jestSetup';

import { render, screen } from '@testing-library/react-native';

import ChatMessageList from '@/shared/components/chat/ChatMessageList';
import MessageTicks, { READ_COLOR } from '@/shared/components/chat/MessageTicks';
import { DisplayMessage } from '@/shared/utils/chatDate';

const at = (minute: number) => new Date(2026, 9, 9, 10, minute).toISOString();

describe('MessageTicks', () => {
  it('renders each state, read in Buyootna gold', async () => {
    const { rerender } = await render(<MessageTicks status="sending" />);
    expect(screen.getByTestId('ticks-sending')).toBeTruthy();
    await rerender(<MessageTicks status="sent" />);
    expect(screen.getByTestId('ticks-sent')).toBeTruthy();
    await rerender(<MessageTicks status="delivered" />);
    expect(screen.getByTestId('ticks-delivered').props.accessibilityLabel).toBe('تم التسليم');
    await rerender(<MessageTicks status="read" />);
    const read = screen.getByTestId('ticks-read');
    expect(read.props.accessibilityLabel).toBe('تمت القراءة');
    expect((read.props.children as { props: { color: string } }).props.color).toBe(
      READ_COLOR,
    );
    await rerender(<MessageTicks status={null} />);
    expect(screen.queryByTestId('ticks-read')).toBeNull();
  });
});

describe('ChatMessageList ticks', () => {
  const msg = (over: Partial<DisplayMessage> = {}) =>
    ({
      id: 'm1',
      type: 'TEXT',
      content: 'مرحبا',
      isMine: true,
      timestamp: '',
      createdAt: at(10),
      ...over,
    }) as DisplayMessage;
  const list = (messages: DisplayMessage[], otherReceipt?: object | null) => (
    <ChatMessageList
      listRef={{ current: { scrollToEnd: jest.fn(), scrollToIndex: jest.fn() } } as never}
      messages={messages}
      onLoadMore={jest.fn()}
      onPressProperty={jest.fn()}
      onPressImage={jest.fn()}
      otherReceipt={otherReceipt}
    />
  );

  it('goes from one tick to two to gold as receipts arrive, without reloading', async () => {
    const messages = [msg()];
    const { rerender } = await render(list(messages, null));
    expect(screen.getByTestId('ticks-sent')).toBeTruthy();

    await rerender(list(messages, { lastDeliveredAt: at(11), lastReadAt: null }));
    expect(screen.getByTestId('ticks-delivered')).toBeTruthy();

    await rerender(list(messages, { lastDeliveredAt: at(11), lastReadAt: at(12) }));
    expect(screen.getByTestId('ticks-read')).toBeTruthy();
  });

  it('shows ticks on every kind of my messages, none on theirs', async () => {
    const receipt = { lastDeliveredAt: at(30), lastReadAt: at(30) };
    await render(
      list(
        [
          msg({ id: 'a', type: 'LOCATION', content: undefined, location: { latitude: 29, longitude: 48 } }),
          msg({
            id: 'b',
            type: 'OFFER',
            content: undefined,
            proposal: { id: 'o', kind: 'OFFER', status: 'PENDING', amount: 1000 },
          }),
          msg({
            id: 'c',
            type: 'VOICE',
            content: undefined,
            attachments: [
              { id: 'v', kind: 'AUDIO', fileName: 'v.m4a', mimeType: 'audio/m4a', size: 1, url: 'https://s/v' },
            ],
          }),
          msg({
            id: 'd',
            type: 'IMAGE',
            content: undefined,
            attachments: [
              { id: 'p', kind: 'IMAGE', fileName: 'p.jpg', mimeType: 'image/jpeg', size: 1, url: 'https://s/p' },
            ],
          }),
          msg({ id: 'e', isMine: false, content: 'أهلاً' }),
        ],
        receipt,
      ),
    );
    // Four of mine are read; theirs has no ticks
    expect(screen.getAllByTestId('ticks-read')).toHaveLength(4);
  });
});
