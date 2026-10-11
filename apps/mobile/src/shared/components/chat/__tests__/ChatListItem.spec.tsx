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
});
