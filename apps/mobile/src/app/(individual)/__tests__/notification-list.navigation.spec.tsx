// With the real router (the shared mock hides where a route lands): the
// empty state's «استكشف الان» must return to the profile's home, never to
// the launch screen at '/'
import { router, Stack, Tabs } from 'expo-router';
import { act, fireEvent, renderRouter } from 'expo-router/testing-library';
import { Text } from 'react-native';

import { useNotificationList } from '@/features/individual/hooks/useNotificationList';
import { useAuthStore } from '@/shared/store/useAuthStore';

import NotificationListScreen from '../notification-list';

// Hoisted above the imports by babel-jest
jest.unmock('expo-router');
jest.unmock('react-native-safe-area-context');

jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/features/individual/hooks/useNotificationList', () => ({
  useNotificationList: jest.fn(),
}));

const page = (label: string) =>
  function Page() {
    return <Text>{label}</Text>;
  };

// The app's shape: profile groups side by side on the root stack, the
// notification list a tab of the individual group
const routes = {
  _layout: () => <Stack screenOptions={{ headerShown: false }} />,
  index: page('launch-screen'),
  '(individual)/_layout': () => <Tabs />,
  '(individual)/home': page('individual-home'),
  '(individual)/notification-list': NotificationListScreen,
  '(company)/_layout': () => <Tabs />,
  '(company)/home': page('company-home'),
};

function signedInAs(type: 'INDIVIDUAL' | 'COMPANY') {
  const state = { token: 'token', activeIdentity: { type } };
  (useAuthStore as unknown as jest.Mock).mockImplementation(
    (selector: (s: typeof state) => unknown) => selector(state),
  );
}

describe('notification list → explore', () => {
  beforeEach(() => {
    (useNotificationList as unknown as jest.Mock).mockReturnValue({
      notifications: [],
      filteredNotifications: [],
      isLoading: false,
      isRefreshing: false,
      handleRefresh: jest.fn(),
      activeTab: 'ALL',
      setActiveTab: jest.fn(),
      hasUnread: false,
    });
  });

  it('a company goes back to its home, with nothing left on top', async () => {
    signedInAs('COMPANY');
    const screen = await renderRouter(routes, { initialUrl: '/' });
    await act(async () => router.replace('/(company)/home'));
    await act(async () => router.push('/notification-list'));

    await act(async () => fireEvent.press(screen.getByText('استكشف الان')));

    expect(screen.getByText('company-home')).toBeTruthy();
    expect(screen.queryByText('launch-screen')).toBeNull();
    expect(router.canGoBack()).toBe(false);
  });

  it('an individual goes to the home tab', async () => {
    signedInAs('INDIVIDUAL');
    const screen = await renderRouter(routes, { initialUrl: '/' });
    await act(async () => router.replace('/(individual)/home'));
    await act(async () => router.push('/notification-list'));

    await act(async () => fireEvent.press(screen.getByText('استكشف الان')));

    expect(screen.getByText('individual-home')).toBeTruthy();
    expect(screen.queryByText('launch-screen')).toBeNull();
  });
});
