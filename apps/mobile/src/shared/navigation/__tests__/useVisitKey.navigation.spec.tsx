// With the real router: a screen of the individual «المزيد» group is a
// screen of the tabs, kept mounted between visits, so it reopened as it was
// left (QA: تعديل الحساب). useVisitKey gives each visit a fresh copy.
import { router, Stack, Tabs } from 'expo-router';
import { act, fireEvent, renderRouter } from 'expo-router/testing-library';
import { useState } from 'react';
import { Text, TextInput } from 'react-native';

import { useVisitKey } from '../useVisitKey';

jest.unmock('expo-router');
jest.unmock('react-native-safe-area-context');

function Draft() {
  const [value, setValue] = useState('');
  return <TextInput testID="draft" value={value} onChangeText={setValue} />;
}

function KeyedScreen() {
  const visit = useVisitKey();
  return <Draft key={visit} />;
}

const routes = (screen: () => React.JSX.Element) => ({
  _layout: () => <Stack screenOptions={{ headerShown: false }} />,
  '(individual)/_layout': () => (
    <Tabs backBehavior="history" screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
    </Tabs>
  ),
  '(individual)/home': () => <Text>home-screen</Text>,
  '(individual)/(more)/edit-profile': screen,
});

async function editLeaveAndReturn(screen: () => React.JSX.Element) {
  const view = await renderRouter(routes(screen), {
    initialUrl: '/(individual)/home',
  });
  await act(async () => router.push('/edit-profile'));
  await act(async () =>
    fireEvent.changeText(view.getByTestId('draft'), 'half-typed'),
  );
  await act(async () => router.back());
  expect(view.getByText('home-screen')).toBeTruthy();
  await act(async () => router.push('/edit-profile'));
  return view.getByTestId('draft').props.value;
}

describe('useVisitKey', () => {
  it('without it, the screen reopens as it was left (the bug)', async () => {
    expect(await editLeaveAndReturn(Draft)).toBe('half-typed');
  });

  it('with it, every visit starts fresh', async () => {
    expect(await editLeaveAndReturn(KeyedScreen)).toBe('');
  });
});
