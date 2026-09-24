import { fireEvent, render } from '@testing-library/react-native';

import { useAlertMatches } from '@/features/individual/hooks/useAlertMatches';
import { useMyAlerts } from '@/features/individual/hooks/useMyAlerts';

import AlertMatchesScreen from '../[id]';

const mockPush = jest.fn();

jest.mock('@shopify/flash-list');

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
  useLocalSearchParams: () => ({ id: 'alert-1' }),
}));

jest.mock('@/features/individual/hooks/useAlertMatches', () => ({
  useAlertMatches: jest.fn(),
}));

jest.mock('@/features/individual/hooks/useMyAlerts', () => ({
  useMyAlerts: jest.fn(),
}));

jest.mock('@/shared/hooks/useFavorites', () => ({
  useFavorites: () => ({
    isFavorited: () => false,
    toggleFavorite: jest.fn(),
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

const mockUseAlertMatches = useAlertMatches as jest.Mock;
const mockUseMyAlerts = useMyAlerts as jest.Mock;

const matchesResult = (overrides = {}) => ({
  data: [],
  isLoading: false,
  isRefetching: false,
  error: null,
  refetch: jest.fn(),
  ...overrides,
});

describe('AlertMatchesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMyAlerts.mockReturnValue({
      data: [
        {
          id: 'alert-1',
          type: 'PROPERTIES',
          operationType: 'RENT',
          governorateId: 'hawally',
          areaId: 'hawally_1',
          categoryId: 'apartment',
        },
      ],
    });
  });

  it('uses the alert title in the header', async () => {
    mockUseAlertMatches.mockReturnValue(matchesResult());

    const { getByText } = await render(<AlertMatchesScreen />);

    expect(getByText('شقة للإيجار - السلام')).toBeTruthy();
    expect(mockUseAlertMatches).toHaveBeenCalledWith('alert-1');
  });

  it('shows the empty state when nothing matches yet', async () => {
    mockUseAlertMatches.mockReturnValue(matchesResult());

    const { getByText } = await render(<AlertMatchesScreen />);

    expect(getByText('لا توجد عقارات مطابقة حالياً')).toBeTruthy();
  });

  it('lists matching listings and opens one on press', async () => {
    mockUseAlertMatches.mockReturnValue(
      matchesResult({
        data: [
          {
            id: 'prop-1',
            price: 450,
            companyName: 'مستخدم',
            isFeatured: false,
            categoryLabel: 'شقة',
            beds: 3,
            area: 120,
            location: 'السلام',
            createdAt: '2026-09-24T00:00:00.000Z',
            images: [],
            type: 'سكني',
            baths: 2,
          },
        ],
      }),
    );

    const { getByText, queryByText } = await render(<AlertMatchesScreen />);

    expect(queryByText('لا توجد عقارات مطابقة حالياً')).toBeNull();
    await fireEvent.press(getByText('شقة'));
    expect(mockPush).toHaveBeenCalledWith('/property/prop-1');
  });

  it('shows the error message when loading fails', async () => {
    mockUseAlertMatches.mockReturnValue(
      matchesResult({ error: 'فشل في تحميل العقارات المطابقة' }),
    );

    const { getByText } = await render(<AlertMatchesScreen />);

    expect(getByText('فشل في تحميل العقارات المطابقة')).toBeTruthy();
  });
});
