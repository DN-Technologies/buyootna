import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { feedService } from '@/features/individual/services/feed.service';
import { propertiesService } from '@/shared/api/properties.service';
import { favoritesService } from '@/shared/api/favorites.service';

import HomeProperties from '../HomeProperties';

const mockPresent = jest.fn();
// PropertyDetailsSheet is stubbed: the component under test calls
// detailsSheetRef.current.present() — the stub must expose it via its ref.
const mockDetailsSheetPresent = jest.fn();

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useRouter: () => jest.requireMock('expo-router').router,
}));

jest.mock('@gorhom/bottom-sheet', () => {
  const { View } = require('react-native');
  const React = require('react');
  return {
    __esModule: true,
    BottomSheetModal: React.forwardRef(function MockSheet(props: any, ref: any) {
      React.useImperativeHandle(ref, () => ({
        present: mockPresent,
        dismiss: jest.fn(),
      }));
      return <View>{props.children}</View>;
    }),
    BottomSheetBackdrop: () => null,
    BottomSheetView: ({ children }: any) => <View>{children}</View>,
    BottomSheetModalProvider: ({ children }: any) => <View>{children}</View>,
  };
});

jest.mock('@/features/individual/components/PropertyDetailsSheet', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef(function MockDetailsSheet(_props: any, ref: any) {
      React.useImperativeHandle(ref, () => ({
        present: mockDetailsSheetPresent,
        dismiss: jest.fn(),
      }));
      return null;
    }),
  };
});

jest.mock('@/features/individual/services/feed.service', () => ({
  feedService: {
    getProperties: jest.fn(),
  },
}));

jest.mock('@/shared/api/properties.service', () => ({
  propertiesService: {
    getPropertyById: jest.fn(),
  },
}));

jest.mock('@/shared/api/favorites.service', () => ({
  favoritesService: {
    getFavoriteIds: jest.fn().mockResolvedValue({ ids: [] }),
    toggleFavorite: jest.fn(),
  },
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn().mockResolvedValue({
    isConnected: true,
    isInternetReachable: true,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
  SafeAreaView: ({ children }: any) => children,
}));

const feedItem = {
  id: 'prop-1',
  images: ['https://example.com/1.jpg'],
  price: 500,
  type: 'سكني',
  categoryLabel: 'شقة',
  area: 210,
  beds: 3,
  baths: 2,
  location: 'السالمية',
  isFeatured: true,
  propertyIncome: null,
  publishedAt: '2026-10-01T00:00:00.000Z',
};

async function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  // render() is async in @testing-library/react-native v14 — it must be
  // awaited or the helper returns a Promise instead of the query screen.
  return await render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe('HomeProperties card view (with-image cards)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (feedService.getProperties as jest.Mock).mockResolvedValue({
      data: [feedItem],
      meta: { hasNextPage: false, current: 1 },
    });
    (propertiesService.getPropertyById as jest.Mock).mockResolvedValue({
      ...feedItem,
      description: 'تفاصيل كاملة',
    });
  });

  it('opens the details sheet — not the full property page — when a card with images is tapped (QA)', async () => {
    const screen = await renderWithClient(
      <HomeProperties activeFilter="all" viewMode="card" />,
    );

    const card = await waitFor(() =>
      screen.getByTestId('property-card-prop-1'),
    );
    // testID on a Touchable lands on its inner View (no onPress), so press
    // a child element — RNTL walks up to the Touchable's onPress handler.
    fireEvent.press(screen.getByText('500'));

    // The sheet presents and the full details are fetched for it...
    await waitFor(() => {
      expect(mockDetailsSheetPresent).toHaveBeenCalled();
      expect(propertiesService.getPropertyById).toHaveBeenCalledWith('prop-1');
    });
    // ...instead of navigating straight to the full property page.
    expect(router.push).not.toHaveBeenCalledWith('/property/prop-1');
  });
});
