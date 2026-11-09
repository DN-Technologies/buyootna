// With the real router. QA: applying the filter from «بحث» opened the results
// on top of the search screen, so leaving took one more back. The results
// now take the search screen's place: one back returns where search began.
import { router, Stack } from 'expo-router';
import { act, fireEvent, renderRouter } from 'expo-router/testing-library';
import { Text, TouchableOpacity } from 'react-native';

import SearchScreen from '../index';

jest.unmock('expo-router');
jest.unmock('react-native-safe-area-context');

jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: (selector: (s: { token: null }) => unknown) =>
    selector({ token: null }),
}));
jest.mock('@/shared/api/search.service', () => ({
  searchService: {
    getPopularSearches: jest.fn().mockResolvedValue([]),
    getRecentSearches: jest.fn().mockResolvedValue([]),
    liveSearch: jest.fn().mockResolvedValue([]),
  },
}));
jest.mock('@/shared/components/search/SearchHeader', () => () => null);
jest.mock('@/shared/components/search/LiveSearchSuggestions', () => () => null);
// The recent searches: one tap opens «شقق»
jest.mock('@/shared/components/search/SearchActiveOverlay', () => {
  const { Text: T, TouchableOpacity: Touch } = jest.requireActual('react-native');
  return function Overlay({
    onSelectSearch,
  }: {
    onSelectSearch: (term: string) => void;
  }) {
    return (
      <Touch onPress={() => onSelectSearch('شقق')}>
        <T>recent-شقق</T>
      </Touch>
    );
  };
});
// The filter's «عرض النتائج»
jest.mock('@/shared/components/filters/GlobalFilterSheet', () => {
  const { forwardRef } = jest.requireActual('react');
  const { Text: T, TouchableOpacity: Touch } = jest.requireActual('react-native');
  return forwardRef(function Sheet(
    {
      onApplyFilters,
    }: { onApplyFilters: (d: { tab: string; filters: object }) => void },
    _ref: unknown,
  ) {
    return (
      <Touch
        onPress={() => onApplyFilters({ tab: 'rent', filters: { beds: 2 } })}
      >
        <T>apply-filter</T>
      </Touch>
    );
  });
});

function Origin() {
  return (
    <TouchableOpacity onPress={() => router.push('/search')}>
      <Text>origin-screen</Text>
    </TouchableOpacity>
  );
}

const routes = {
  _layout: () => <Stack screenOptions={{ headerShown: false }} />,
  index: Origin,
  'search/index': SearchScreen,
  'search/results': () => <Text>results-screen</Text>,
};

async function openResultsBy(label: string) {
  const screen = await renderRouter(routes, { initialUrl: '/' });
  await act(async () => fireEvent.press(screen.getByText('origin-screen')));
  await act(async () => fireEvent.press(screen.getByText(label)));
  expect(screen.getByText('results-screen')).toBeTruthy();
  return screen;
}

describe('search → results', () => {
  it.each([
    ['applying the filter', 'apply-filter'],
    ['a recent search', 'recent-شقق'],
  ])('%s: the results replace the search screen; one back leaves', async (_, label) => {
    const screen = await openResultsBy(label);

    // The search screen isn't kept underneath
    expect(
      screen.queryByText('apply-filter', { includeHiddenElements: true }),
    ).toBeNull();
    await act(async () => router.back());
    expect(screen.getByText('origin-screen')).toBeTruthy();
  });
});
