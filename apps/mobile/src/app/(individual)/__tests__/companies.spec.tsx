import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { feedService } from '@/features/individual/services/feed.service';

import CompaniesScreen from '../companies';

jest.mock('@gorhom/bottom-sheet');
jest.mock('@shopify/flash-list');

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
}));

jest.mock('@react-navigation/native', () => ({
  useScrollToTop: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

jest.mock('@/features/individual/services/feed.service', () => ({
  feedService: { getCompanies: jest.fn() },
}));

jest.mock('@/shared/hooks/providers/useProviderFavorites', () => ({
  useProviderFavorites: () => ({
    isFavorited: () => false,
    toggleFavorite: jest.fn(),
  }),
}));

jest.mock('@/shared/hooks/auth/useAuthGuard', () => ({
  useAuthGuard: () => ({ guardAction: jest.fn(), authSheetRef: { current: null } }),
}));

// Heavy sheets aren't under test here
jest.mock('@/shared/components/company/QuoteRequestModal', () => () => null);
jest.mock('@/shared/components/auth/AuthGuardSheet', () => () => null);

async function renderScreen() {
  return await render(
    <QueryClientProvider client={new QueryClient()}>
      <CompaniesScreen />
    </QueryClientProvider>,
  );
}

describe('CompaniesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (feedService.getCompanies as jest.Mock).mockResolvedValue({
      data: [],
      meta: { hasNextPage: false, current: 1 },
    });
  });

  // QA: the keyboard closed after every letter because the list header was
  // a new component type on each render, remounting the search input
  it('keeps the same search input mounted while typing', async () => {
    const { getByPlaceholderText } = await render(
      <QueryClientProvider client={new QueryClient()}>
        <CompaniesScreen />
      </QueryClientProvider>,
    );

    const input = getByPlaceholderText('ابحث باسم الشركة...');
    await fireEvent.changeText(input, 'ب');
    const afterFirst = getByPlaceholderText('ابحث باسم الشركة...');
    await fireEvent.changeText(afterFirst, 'با');

    expect(getByPlaceholderText('ابحث باسم الشركة...')).toBe(input);
    expect(input.props.value).toBe('با');
  });

  // QA: the filter icon pushed the property /search screen with its
  // sale/rent filter instead of the company filter
  it('the filter icon opens the company تصفية البحث sheet, not /search', async () => {
    const { present } = require('@gorhom/bottom-sheet');
    const { getByLabelText } = await renderScreen();

    await fireEvent.press(getByLabelText('تصفية البحث'));

    expect(present).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('picking a الترتيب حسب option refetches companies with that sort', async () => {
    const { getByLabelText, findByText } = await renderScreen();

    await fireEvent.press(getByLabelText('الترتيب حسب'));
    await fireEvent.press(await findByText('الأعلى تقييماً'));

    await waitFor(() =>
      expect(feedService.getCompanies).toHaveBeenLastCalledWith(
        undefined,
        1,
        10,
        undefined,
        'RATING_DESC',
      ),
    );
  });
});
