import 'react-native-gesture-handler/jestSetup';

import { fireEvent, render } from '@testing-library/react-native';

import type { ChatMessage } from '@/shared/api/chat.service';

import ChatMessageBubble from '../ChatMessageBubble';

const base = (over: Partial<ChatMessage> = {}) =>
  ({
    id: 'm1',
    type: 'TEXT',
    content: 'مرحبا',
    isMine: false,
    timestamp: '٠٠:٥٣',
    createdAt: new Date(2026, 9, 8, 0, 53).toISOString(),
    ...over,
  }) as ChatMessage;

const props = (message: ChatMessage) => ({
  message,
  otherUserName: 'الطرف الآخر',
  onJumpTo: jest.fn(),
  onPressProperty: jest.fn(),
  onPressImage: jest.fn(),
});

describe('ChatMessageBubble', () => {
  it('shows a text message', async () => {
    const { getByText } = await render(<ChatMessageBubble {...props(base())} />);
    expect(getByText('مرحبا')).toBeTruthy();
  });

  it('renders nothing for a location or property message that has no data', async () => {
    const location = await render(
      <ChatMessageBubble {...props(base({ type: 'LOCATION' }))} />,
    );
    expect(location.toJSON()).toBeNull();

    const property = await render(
      <ChatMessageBubble {...props(base({ type: 'PROPERTY' }))} />,
    );
    expect(property.toJSON()).toBeNull();
  });

  it('a quoted reply jumps to the original when its quote is tapped', async () => {
    const p = props(
      base({
        replyTo: { id: 'orig', content: 'الأصل', isMine: true, type: 'TEXT' } as any,
      }),
    );
    const { getByText } = await render(<ChatMessageBubble {...p} />);

    await fireEvent.press(getByText('الأصل'));
    expect(p.onJumpTo).toHaveBeenCalledWith('orig');
  });
});
