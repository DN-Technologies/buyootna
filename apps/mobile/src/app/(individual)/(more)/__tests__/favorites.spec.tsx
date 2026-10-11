import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { favoritesService } from '@/shared/api/favorites.service';

import FavoritesScreen from '../favorites';

const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
    replace: jest.fn(),
  }),
}));

const mockToggleFavorite = jest.fn();
jest.mock('@/shared/hooks/properties/useFavorites', () => ({
  useFavorites: () => ({
    toggleFavorite: mockToggleFavorite,
    isFavorited: jest.fn(() => true),
    favoriteIds: new Set(['prop-1', 'prop-2']),
  }),
}));

const mockPresent = jest.fn();
const mockDismiss = jest.fn();

jest.mock('@gorhom/bottom-sheet', () => {
  const { View, ScrollView } = require('react-native');
  const React = require('react');
  return {
    __esModule: true,
    BottomSheetModal: React.forwardRef((props: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({
        present: mockPresent,
        dismiss: mockDismiss,
      }));
      return <View testID="bottom-sheet-modal">{props.children}</View>;
    }),
    BottomSheetBackdrop: () => null,
    BottomSheetView: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
    BottomSheetScrollView: ({ children }: { children: React.ReactNode }) => (
      <ScrollView>{children}</ScrollView>
    ),
  };
});

jest.mock('@shopify/flash-list', () => {
  const { View } = require('react-native');
  return {
    FlashList: ({ data, renderItem, ListEmptyComponent }: any) => {
      if (!data || data.length === 0) {
        return <View testID="flash-list-empty">{ListEmptyComponent}</View>;
      }
      return (
        <View testID="flash-list">
          {data.map((item: any, index: number) => (
            <View key={item.id || index}>{renderItem({ item, index })}</View>
          ))}
        </View>
      );
    },
  };
});

jest.mock('@/shared/api/favorites.service', () => ({
  favoritesService: {
    getFavorites: jest.fn(),
    toggleFavorite: jest.fn(),
    checkFavorite: jest.fn(),
    getFavoriteIds: jest.fn(),
    getProviderFavorites: jest.fn(),
    toggleProvider: jest.fn(),
    clearAll: jest.fn(),
    restore: jest.fn(),
  },
}));

// Signed in: the company/office favorites only load with a session
jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: jest.fn((selector) => selector({ token: 'token' })),
}));

// Saved companies/offices as the API returns them (directory card shape)
const mockCompany = {
  id: 'comp-1',
  userId: 'u-comp-1',
  name: 'مؤسسة النخبة للديكور',
  category: 'تشطيب • تصميم داخلي • تنفيذ',
  rating: 3.5,
  reviewsCount: 40,
  projectsCount: '85',
  isVerified: true,
  lastActivityAt: '2026-09-28T08:00:00Z',
};
const mockOffice = {
  id: 'off-1',
  userId: 'u-off-1',
  name: 'الوطن للعقارات',
  rating: 3.5,
  reviewsCount: 40,
  location: 'السالمية',
  isVerified: true,
  phone: '96590000001',
  isFavorite: true,
};
const providerPage = (item: object) => ({
  data: [item],
  meta: { total: 1, page: 1, limit: 10, hasNextPage: false },
});

const mockPropertiesData = [
  {
    id: 'prop-1',
    type: 'SALE',
    category: 'عمارة',
    isFeatured: true,
    price: 150000,
    area: 200,
    beds: 4,
    baths: 3,
    location: 'شمال غرب صليبيخات',
    description: 'عمارة للبيع',
    views: 120,
    images: ['https://example.com/img1.jpg'],
    createdAt: '2026-01-01T00:00:00Z',
    propertyIncome: 150000,
    host: {
      id: 'host-1',
      name: 'شركة العقار',
      avatarUrl: '',
      joinedDate: '2025-01-01',
      isVerified: true,
      rating: 4.5,
    },
  },
  {
    id: 'prop-2',
    type: 'RENT',
    category: 'شقة',
    isFeatured: true,
    price: 800,
    area: 120,
    beds: 2,
    baths: 2,
    location: 'السالمية',
    description: 'شقة للإيجار',
    views: 85,
    images: ['https://example.com/img2.jpg'],
    createdAt: '2026-02-01T00:00:00Z',
    propertyIncome: 0,
    host: {
      id: 'host-2',
      name: 'أحمد',
      avatarUrl: '',
      joinedDate: '2025-02-01',
      isVerified: false,
      rating: 4.0,
    },
  },
];

describe('FavoritesScreen', () => {
  let queryClient: QueryClient;

  afterEach(() => {
    queryClient.clear();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        // No garbage-collection timers left running after each test
        queries: { retry: false, gcTime: Infinity },
      },
    });

    (favoritesService.getProviderFavorites as jest.Mock).mockImplementation(
      (type: string) =>
        Promise.resolve(providerPage(type === 'COMPANY' ? mockCompany : mockOffice)),
    );
    (favoritesService.clearAll as jest.Mock).mockResolvedValue({
      ids: ['comp-1'],
    });
    (favoritesService.restore as jest.Mock).mockResolvedValue({
      ids: ['comp-1'],
    });
    (favoritesService.getFavorites as jest.Mock).mockResolvedValue({
      data: mockPropertiesData,
      meta: {
        total: 2,
        page: 1,
        limit: 10,
        hasNextPage: false,
      },
    });
  });

  const renderComponent = async () =>
    await render(
      <QueryClientProvider client={queryClient}>
        <FavoritesScreen />
      </QueryClientProvider>,
    );

  it('renders header, title, and tabs correctly', async () => {
    const { getByText } = await renderComponent();

    expect(getByText('المفضلة')).toBeTruthy();
    expect(getByText('عقارات')).toBeTruthy();
    expect(getByText('شركات')).toBeTruthy();
    expect(getByText('مكاتب')).toBeTruthy();
  });

  it('switches between tabs and displays relevant subheader and items', async () => {
    const { getByText, getAllByText } = await renderComponent();

    // In properties tab initially
    await waitFor(() => {
      expect(getAllByText('150,000').length).toBeGreaterThan(0);
    });

    // Switch to companies tab
    fireEvent.press(getByText('شركات'));
    await waitFor(() => {
      expect(getByText('مؤسسة النخبة للديكور')).toBeTruthy();
      expect(getAllByText('طلب عرض سعر').length).toBeGreaterThan(0);
    });

    // Switch to offices tab
    fireEvent.press(getByText('مكاتب'));
    await waitFor(() => {
      expect(getAllByText('الوطن للعقارات').length).toBeGreaterThan(0);
    });
  });

  it('opens sort sheet when pressing sort button', async () => {
    const { getAllByText } = await renderComponent();

    const sortButton = getAllByText('الترتيب حسب')[0];
    fireEvent.press(sortButton);

    expect(mockPresent).toHaveBeenCalled();
  });

  it('displays empty state when list has no items and triggers CTA', async () => {
    (favoritesService.getFavorites as jest.Mock).mockResolvedValue({
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        hasNextPage: false,
      },
    });

    const { getByText } = await renderComponent();

    await waitFor(() => {
      expect(getByText('قائمتك خالية!')).toBeTruthy();
      expect(getByText('استكشف الآن')).toBeTruthy();
    });

    fireEvent.press(getByText('استكشف الآن'));
    expect(mockPush).toHaveBeenCalledWith('/(individual)/home');
  });

  it('triggers undo toast when an item is removed from favorites and restores on undo', async () => {
    const { getByText } = await renderComponent();

    // Switch to companies
    fireEvent.press(getByText('شركات'));
    await waitFor(() => {
      expect(getByText('مؤسسة النخبة للديكور')).toBeTruthy();
    });

    // Click clear all via options sheet
    const clearAllText = getByText('مسح الكل');
    fireEvent.press(clearAllText);

    // Toast visible with undo
    await waitFor(() => {
      expect(getByText('تمت الإزالة من المفضلة')).toBeTruthy();
      expect(getByText('تراجع')).toBeTruthy();
    });

    // Cleared on the server, in one call
    expect(favoritesService.clearAll).toHaveBeenCalledWith('COMPANY');

    // Click undo
    fireEvent.press(getByText('تراجع'));

    // Restored on the server and back in the list
    await waitFor(() => {
      expect(favoritesService.restore).toHaveBeenCalledWith('COMPANY', ['comp-1']);
      expect(getByText('مؤسسة النخبة للديكور')).toBeTruthy();
    });
  });
});
