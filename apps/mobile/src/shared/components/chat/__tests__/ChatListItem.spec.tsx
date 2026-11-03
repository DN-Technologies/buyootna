import { render } from '@testing-library/react-native';

import ChatListItem from '../ChatListItem';

jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return { Image: (props: any) => <View {...props} /> };
});

const setup = (over: object = {}) =>
  render(
    <ChatListItem
      id="c1"
      user={{ name: 'Ebrahim', avatarUrl: 'https://x/a.jpg', isOnline: false }}
      propertyContext="عمارة"
      lastMessage="هندسه"
      timestamp="12:05 ص"
      onPress={jest.fn()}
      {...over}
    />,
  );

// QA: the last-message preview sat on the left; it belongs on the right,
// under the name. In this forced-RTL app `text-right` flips it to the left,
// so the preview must use the default (start) alignment like the name.
describe('ChatListItem', () => {
  it('aligns the preview like the name, not with text-right', async () => {
    const { getByText } = await setup();

    expect(String(getByText('هندسه').props.className)).not.toContain('text-right');
    expect(String(getByText('Ebrahim').props.className)).not.toContain('text-right');
  });

  it('shows the name, tag, preview and time', async () => {
    const { getByText } = await setup();
    for (const t of ['Ebrahim', 'عمارة', 'هندسه', '12:05 ص']) {
      expect(getByText(t)).toBeTruthy();
    }
  });

  // QA (iOS): the unread number sat high in its circle, half cut off: the
  // Cairo digit had a 14px line inside a 20px badge
  it('centres the unread number on a line as tall as its badge', async () => {
    const { getByTestId } = await setup({ unreadCount: 2 });

    expect(String(getByTestId('chat-unread-badge').props.className)).toContain('h-5');
    const count = getByTestId('chat-unread-count');
    expect(count.props.children).toBe(2);
    expect(String(count.props.className)).toContain('leading-[20px]');
    expect(String(count.props.className)).not.toContain('leading-[14px]');
  });

  it('caps the unread number at 9+ and keeps a long name on one line', async () => {
    const { getByTestId, getByText } = await setup({
      unreadCount: 27,
      user: { name: 'أحمد محمد عبدالله العبدالله الكويتي', avatarUrl: '', isOnline: false },
    });

    expect(getByTestId('chat-unread-count').props.children).toBe('9+');
    const name = getByText('أحمد محمد عبدالله العبدالله الكويتي');
    expect(name.props.numberOfLines).toBe(1);
    expect(String(name.props.className)).toContain('shrink');
  });

  describe('Figma 9191:26630', () => {
    const row = (unreadCount: number, isOnline = false) =>
      render(
        <ChatListItem
          id="c1"
          user={{ name: 'محمد العتيبي', avatarUrl: '', isOnline }}
          propertyContext="شقة السالمية"
          lastMessage="ارغب في التفاوض"
          timestamp="15 دقيقة"
          unreadCount={unreadCount}
          onPress={jest.fn()}
        />,
      );

    it('an unread chat is a tinted card with a green count', async () => {
      const { getByTestId } = await row(3);
      expect(String(getByTestId('chat-list-card-c1').props.className)).toContain(
        'bg-[#F3F5FB]',
      );
      expect(String(getByTestId('chat-unread-badge').props.className)).toContain(
        'bg-[#15A72B]',
      );
    });

    it('a read chat is plain white, with no count', async () => {
      const { getByTestId, queryByTestId } = await row(0);
      expect(String(getByTestId('chat-list-card-c1').props.className)).toContain(
        'bg-white',
      );
      expect(queryByTestId('chat-unread-badge')).toBeNull();
    });

    it('shows the online dot only while they are online', async () => {
      const offline = await row(0);
      expect(offline.queryByTestId('chat-online-dot')).toBeNull();
      offline.unmount();
      const online = await row(0, true);
      expect(online.getByTestId('chat-online-dot')).toBeTruthy();
    });
  });
});
