// With the real router (a mocked one can't keep a tab's stack): after
// «حفظ كمسودة» took the user to نشاطي, «+» then Back opened an empty
// «معاينة الإعلان» left in the add-ad tab's stack (QA). The app's shape:
// the form and its preview are a stack inside a hidden (individual) tab.
import { router, Stack, Tabs } from 'expo-router';
import { act, renderRouter } from 'expo-router/testing-library';
import { Text } from 'react-native';

import { individualTabOptions } from '@/features/individual/navigation/individualTabOptions';

// Hoisted above the imports by babel-jest
jest.unmock('expo-router');
jest.unmock('react-native-safe-area-context');

const page = (label: string) =>
  function Page() {
    return <Text>{label}</Text>;
  };

const routes = {
  _layout: () => <Stack screenOptions={{ headerShown: false }} />,
  index: page('launch'),
  '(individual)/_layout': () => (
    <Tabs backBehavior="history" screenOptions={individualTabOptions} />
  ),
  '(individual)/home': page('home'),
  '(individual)/activity': page('activity'),
  '(individual)/add-listing/_layout': () => <Stack />,
  '(individual)/add-listing/index': page('add-form'),
  '(individual)/add-listing/preview': page('preview'),
};

async function start() {
  const view = renderRouter(routes, { initialUrl: '/activity' });
  await view;
  // Not the result itself: it is a thenable, which an async return unwraps
  return { getPathname: () => view.getPathname() };
}

const go = (f: () => void) => act(async () => f());

// What «حفظ كمسودة» does for an individual (useSubmitListing)
const saveDraftFromPreview = async () => {
  await go(() => router.push('/add-listing'));
  await go(() => router.push('/add-listing/preview'));
  await go(() =>
    router.replace({ pathname: '/activity', params: { draftSaved: 'true' } }),
  );
};

describe('«إضافة إعلان» after a saved draft', () => {
  it('Back from a new form returns to نشاطي, not the old preview', async () => {
    const view = await start();
    await saveDraftFromPreview();
    expect(view.getPathname()).toBe('/activity');

    await go(() => router.push('/add-listing'));
    expect(view.getPathname()).toBe('/add-listing');
    await go(() => router.back());
    expect(view.getPathname()).toBe('/activity');
  });

  it('stays that way on later visits', async () => {
    const view = await start();
    await saveDraftFromPreview();

    for (let i = 0; i < 2; i++) {
      await go(() => router.push('/add-listing'));
      await go(() => router.back());
      expect(view.getPathname()).toBe('/activity');
    }
  });

  it('the form still goes to its preview and back', async () => {
    const view = await start();
    await go(() => router.push('/add-listing'));
    await go(() => router.push('/add-listing/preview'));
    await go(() => router.back());
    expect(view.getPathname()).toBe('/add-listing');
  });
});

it('only the add-ad tab is reset on leaving', () => {
  expect(individualTabOptions({ route: { name: 'add-listing' } })).toEqual({
    headerShown: false,
    popToTopOnBlur: true,
  });
  expect(individualTabOptions({ route: { name: 'activity' } }).popToTopOnBlur).toBe(
    false,
  );
});
