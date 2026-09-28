import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { useMyActivity } from '@/shared/hooks/useMyActivity';
import { usePropertyDetails } from '@/shared/hooks/usePropertyDetails';

import PropertyDetailsScreen from '../[id]';

jest.mock('@gorhom/bottom-sheet');
jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
  useLocalSearchParams: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 20, left: 0, right: 0 })),
}));

jest.mock('@/shared/hooks/usePropertyDetails', () => ({
  usePropertyDetails: jest.fn(),
}));

jest.mock('@/shared/hooks/useMyActivity', () => ({
  useMyActivity: jest.fn(),
  renewProperty: jest.fn(),
}));

jest.mock('@/shared/hooks/useAuthGuard', () => ({
  useAuthGuard: jest.fn(() => ({
    guardAction: jest.fn(),
    authSheetRef: { current: null },
  })),
}));

jest.mock('@/shared/hooks/useFavorites', () => ({
  useFavorites: jest.fn(() => ({
    isFavorited: jest.fn(() => false),
    toggleFavorite: jest.fn(),
  })),
}));

jest.mock('@/shared/hooks/usePropertyActions', () => ({
  usePropertyActions: jest.fn(() => ({
    handleWhatsapp: jest.fn(),
    handleCall: jest.fn(),
    handleChat: jest.fn(),
    handleShare: jest.fn(),
    handleFavoriteToggle: jest.fn(),
    handleHostPress: jest.fn(),
    handleBack: jest.fn(),
  })),
}));

jest.mock('@/shared/components/property/PropertyDetailsContent', () => {
  const { View, Text } = require('react-native');
  return function MockPropertyDetailsContent(props: any) {
    return (
      <View testID="property-details-content">
        <Text>{props.property?.category}</Text>
      </View>
    );
  };
});

const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
const mockUsePropertyDetails = usePropertyDetails as jest.Mock;
const mockUseMyActivity = useMyActivity as jest.Mock;

const mockProperty = {
  id: 'prop-123',
  type: 'SALE',
  category: 'APARTMENT',
  status: 'EXPIRED',
  price: 150000,
  images: ['https://example.com/1.jpg'],
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: Infinity } },
});

const renderWithClient = (ui: React.ReactElement) =>
  render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);

describe('PropertyDetailsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePropertyDetails.mockReturnValue({
      property: mockProperty,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockUseMyActivity.mockReturnValue({
      freeAdsRemaining: 1,
      subscription: undefined,
    });
  });

  it('renders ArchivedPropertyActionBar when archived is true', async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: 'prop-123', archived: 'true' });

    const { getByTestId, queryByTestId } = await renderWithClient(
      <PropertyDetailsScreen />,
    );

    expect(getByTestId('archived-delete-btn')).toBeTruthy();
    expect(getByTestId('archived-republish-btn')).toBeTruthy();
  });

  it('renders standard PropertyActionBar when active and not archived', async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: 'prop-123' });
    mockUsePropertyDetails.mockReturnValue({
      property: { ...mockProperty, status: 'ACTIVE' },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    const { queryByTestId } = await renderWithClient(<PropertyDetailsScreen />);

    expect(queryByTestId('archived-delete-btn')).toBeNull();
    expect(queryByTestId('archived-republish-btn')).toBeNull();
  });

  it('triggers delete and republish button presses without crashing', async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: 'prop-123', archived: 'true' });

    const { getByTestId } = await renderWithClient(<PropertyDetailsScreen />);

    await fireEvent.press(getByTestId('archived-delete-btn'));
    await fireEvent.press(getByTestId('archived-republish-btn'));

    expect(getByTestId('archived-delete-btn')).toBeTruthy();
  });
});
