// With the real router: deleting the whole account from «اعدادات الحساب»
// opened over a company's tabs left the company's layout beneath the login
// screen, signed out, until a restart (QA). Nothing of it may remain.
import {
  router,
  Stack,
  Tabs,
  useNavigationContainerRef,
} from 'expo-router';
import { act, renderRouter } from 'expo-router/testing-library';
import { useEffect } from 'react';
import { Text } from 'react-native';

import { resetToSignedOut } from '../getIdentityHomeRoute';
import { setRootNavigationRef } from '../rootNavigation';

jest.unmock('expo-router');
jest.unmock('react-native-safe-area-context');

const page = (label: string) =>
  function Page() {
    return <Text>{label}</Text>;
  };

// As app/_layout: the root stack, and it registers its navigation ref
function RootLayout() {
  const ref = useNavigationContainerRef();
  useEffect(() => {
    setRootNavigationRef(ref);
    return () => setRootNavigationRef(null);
  }, [ref]);
  return <Stack screenOptions={{ headerShown: false }} />;
}

const routes = {
  _layout: () => <RootLayout />,
  index: page('launch-screen'),
  '(individual)/_layout': () => (
    <Tabs backBehavior="history" screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
    </Tabs>
  ),
  '(individual)/home': page('guest-home-screen'),
  '(individual)/(more)/settings': page('settings-screen'),
  '(company)/_layout': () => (
    <Tabs backBehavior="history" screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
    </Tabs>
  ),
  '(company)/home': page('company-home-screen'),
  '(company)/company-more': page('company-more-screen'),
  '(auth)/_layout': () => <Stack screenOptions={{ headerShown: false }} />,
  '(auth)/individual-auth': page('login-screen'),
};

const companyScreens = ['company-home-screen', 'company-more-screen', 'settings-screen'];

describe('resetToSignedOut', () => {
  it('opens the login over the guest home, with nothing of the company left', async () => {
    const screen = await renderRouter(routes, { initialUrl: '/' });
    await act(async () => router.replace('/(company)/home'));
    await act(async () => router.push('/(company)/company-more'));
    await act(async () => router.push('/(individual)/(more)/settings'));
    expect(screen.getByText('settings-screen')).toBeTruthy();

    await act(async () => resetToSignedOut());

    expect(screen.getByText('login-screen')).toBeTruthy();
    for (const label of companyScreens) {
      expect(screen.queryByText(label, { includeHiddenElements: true })).toBeNull();
    }

    // Back (or closing the login) lands on the guest home, not the company
    await act(async () => router.back());
    expect(screen.getByText('guest-home-screen')).toBeTruthy();
    for (const label of companyScreens) {
      expect(screen.queryByText(label, { includeHiddenElements: true })).toBeNull();
    }
    expect(router.canGoBack()).toBe(false);
  });
});
