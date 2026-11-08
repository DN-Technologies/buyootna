// With the real router: the request details live in the (requests) stack,
// a hidden tab of the company tabs. Back from a public request opened from
// «الطلبات» must return to that list, never to a private request opened
// earlier from the home (QA)
import { router, Stack, Tabs, useLocalSearchParams } from 'expo-router';
import { act, renderRouter } from 'expo-router/testing-library';
import { Text } from 'react-native';

import CompanyRequestsGroupLayout from '../_layout';

jest.unmock('expo-router');
jest.unmock('react-native-safe-area-context');

const page = (label: string) =>
  function Page() {
    return <Text>{label}</Text>;
  };

function RequestPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Text>{`request-${id}`}</Text>;
}

// As the app's company tabs: back through the tab history
const routes = {
  _layout: () => <Stack screenOptions={{ headerShown: false }} />,
  index: page('launch-screen'),
  '(company)/_layout': () => (
    <Tabs backBehavior="history" screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="company-requests" />
    </Tabs>
  ),
  '(company)/home': page('company-home'),
  '(company)/company-requests': page('requests-list'),
  '(company)/(requests)/_layout': CompanyRequestsGroupLayout,
  '(company)/(requests)/[id]': RequestPage,
  '(company)/(requests)/end/[id]': page('end-request'),
};

describe('company request details › back', () => {
  it('returns to the public list, not to a private request opened before', async () => {
    const screen = await renderRouter(routes, { initialUrl: '/' });
    await act(async () => router.replace('/(company)/home'));

    // A private request opened from the home, then back to the home
    await act(async () => router.push('/(company)/(requests)/private-1'));
    await act(async () => router.back());
    expect(screen.getByText('company-home')).toBeTruthy();

    // «الطلبات» › a public request › back
    await act(async () => router.navigate('/(company)/company-requests'));
    await act(async () => router.push('/(company)/(requests)/public-2'));
    expect(screen.getByText('request-public-2')).toBeTruthy();
    await act(async () => router.back());

    expect(screen.getByText('requests-list')).toBeTruthy();
    expect(screen.queryByText('request-private-1')).toBeNull();
  });

  it('inside a request, «انهاء الطلب» › back still returns to that request', async () => {
    const screen = await renderRouter(routes, { initialUrl: '/' });
    await act(async () => router.replace('/(company)/company-requests'));
    await act(async () => router.push('/(company)/(requests)/public-2'));
    await act(async () => router.push('/(company)/(requests)/end/public-2'));
    expect(screen.getByText('end-request')).toBeTruthy();

    await act(async () => router.back());
    expect(screen.getByText('request-public-2')).toBeTruthy();
  });
});
