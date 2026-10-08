import { fireEvent, render } from '@testing-library/react-native';

import { ChatMessage } from '@/shared/api/chat.service';
import MessageOptionsSheet from '@/shared/components/chat/MessageOptionsSheet';

const text: ChatMessage = {
  id: 'm1',
  type: 'TEXT',
  content: 'هاي',
  isMine: true,
  timestamp: '',
  createdAt: '2026-10-08T10:00:00.000Z',
};

const setup = async (message: ChatMessage | null) => {
  const handlers = {
    onClose: jest.fn(),
    onReply: jest.fn(),
    onCopy: jest.fn(),
    onHide: jest.fn(),
  };
  const utils = await render(
    <MessageOptionsSheet message={message} {...handlers} />,
  );
  return { ...handlers, ...utils };
};

describe('MessageOptionsSheet', () => {
  it('offers رد / نسخ / حذف لدي for a text message', async () => {
    const { findByText } = await setup(text);
    expect(await findByText('رد')).toBeTruthy();
    expect(await findByText('نسخ')).toBeTruthy();
    expect(await findByText('حذف لدي')).toBeTruthy();
  });

  it('runs the chosen option and closes', async () => {
    const { findByTestId, onReply, onHide, onClose } = await setup(text);

    await fireEvent.press(await findByTestId('message-option-reply'));
    expect(onReply).toHaveBeenCalledWith(text);
    expect(onClose).toHaveBeenCalled();

    await fireEvent.press(await findByTestId('message-option-hide'));
    expect(onHide).toHaveBeenCalledWith(text);
  });

  it('has no نسخ for an image', async () => {
    const { findByText, queryByText } = await setup({
      ...text,
      type: 'IMAGE',
      content: undefined,
      imageUrl: 'https://cdn/x.jpg',
    });
    expect(await findByText('رد')).toBeTruthy();
    expect(queryByText('نسخ')).toBeNull();
  });

  it('offers only نسخ while the message is still sending', async () => {
    const { findByText, queryByText } = await setup({
      ...text,
      id: 'temp-1',
      sending: true,
    });
    expect(await findByText('نسخ')).toBeTruthy();
    expect(queryByText('رد')).toBeNull();
    expect(queryByText('حذف لدي')).toBeNull();
  });

  it('renders nothing without a message', async () => {
    const { queryByTestId } = await setup(null);
    expect(queryByTestId('message-options-sheet')).toBeNull();
  });
});
