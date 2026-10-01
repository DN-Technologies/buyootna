import { cleanup, fireEvent, render } from '@testing-library/react-native';

import OfficeListCard from '../OfficeListCard';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const office = { id: 'office-1', name: 'مكتب بيوتنا العقاري' };

describe('OfficeListCard', () => {
  beforeEach(() => jest.clearAllMocks());
  afterEach(cleanup);

  it('the chat button starts a chat with the office, not its profile', async () => {
    const onPress = jest.fn();
    const { getByTestId } = await render(
      <OfficeListCard {...office} onPress={onPress} />,
    );

    await fireEvent.press(getByTestId('office-card-chat-office-1'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/chat/[id]',
      params: expect.objectContaining({ recipientId: 'office-1' }),
    });
    expect(onPress).not.toHaveBeenCalled();
  });

  it("uses the screen's own chat handler when given one", async () => {
    const onChatPress = jest.fn();
    const { getByTestId } = await render(
      <OfficeListCard {...office} onChatPress={onChatPress} />,
    );

    await fireEvent.press(getByTestId('office-card-chat-office-1'));

    expect(onChatPress).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
