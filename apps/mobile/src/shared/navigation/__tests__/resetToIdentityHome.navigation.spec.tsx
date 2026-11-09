// With the real router: switching from the company to the personal profile
// from a screen pushed over the company's tabs («إضافة حساب» › فرد, the
// settings) must leave nothing of the company's layout (QA: its tabs stayed
// until the app was restarted)
import {
  router,
  Stack,
  Tabs,
  useNavigationContainerRef,
} from 'expo-router';
import { act, renderRouter } from 'expo-router/testing-library';
import { useEffect } from 'react';
import { Text } from 'react-native';

import { resetToIdentityHome } from '../getIdentityHomeRoute';
import { setRootNavigationRef } from '../rootNavigation';

jest.unmock('expo-router');
jest.unmock('react-native-safe-area-context');

const page = (label: string) =>
  function Page() {
    return <Text>{label}</Text>;
  };

// As app/_layout: the root stack, and it registers its navigation ref
function RootLayout({ register }: { register: boolean }) {
  const ref = useNavigationContainerRef();
  useEffect(() => {
    setRootNavigationRef(register ? ref : null);
    return () => setRootNavigationRef(null);
  }, [ref, register]);
  return <Stack screenOptions={{ headerShown: false }} />;
}

const routes = (register: boolean) => ({
  _layout: () => <RootLayout register={register} />,
  index: page('launch-screen'),
  '(individual)/_layout': () => (
    <Tabs backBehavior="history" screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
    </Tabs>
  ),
  '(individual)/home': page('individual-home-screen'),
  '(company)/_layout': () => (
    <Tabs backBehavior="history" screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
    </Tabs>
  ),
  '(company)/home': page('company-home-screen'),
  '(company)/company-more': page('company-more-screen'),
  '(auth)/_layout': () => <Stack screenOptions={{ headerShown: false }} />,
  '(auth)/add-identity-individual': page('add-individual-screen'),
});

async function switchFromAddAccount(register: boolean) {
  const screen = await renderRouter(routes(register), { initialUrl: '/' });
  await act(async () => router.replace('/(company)/home'));
  await act(async () => router.push('/(company)/company-more'));
  await act(async () => router.push('/(auth)/add-identity-individual'));
  expect(screen.getByText('add-individual-screen')).toBeTruthy();

  await act(async () => resetToIdentityHome('INDIVIDUAL'));
  return screen;
}

describe('resetToIdentityHome', () => {
  it('lands on the personal home with nothing of the company left', async () => {
    const screen = await switchFromAddAccount(true);

    expect(screen.getByText('individual-home-screen')).toBeTruthy();
    for (const label of [
      'company-home-screen',
      'company-more-screen',
      'add-individual-screen',
    ]) {
      expect(
        screen.queryByText(label, { includeHiddenElements: true }),
      ).toBeNull();
    }
    expect(router.canGoBack()).toBe(false);
  });

  it('switching to the company from the personal tabs works the same', async () => {
    const screen = await renderRouter(routes(true), { initialUrl: '/' });
    await act(async () => router.replace('/(individual)/home'));
    await act(async () => resetToIdentityHome('COMPANY'));

    expect(screen.getByText('company-home-screen')).toBeTruthy();
    expect(
      screen.queryByText('individual-home-screen', {
        includeHiddenElements: true,
      }),
    ).toBeNull();
  });
});
