import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';

import { plansService } from '@/shared/api/plans.service';

import CreateListingScreen from '../index';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  })),
}));

jest.mock('@/shared/api/plans.service', () => ({
  plansService: {
    getWallet: jest.fn(),
  },
}));

jest.mock('@/shared/api/properties.service', () => ({
  propertiesService: {
    getFeaturesMetadata: jest.fn().mockResolvedValue(null),
  },
}));

// The banner logic lives in the screen itself; the heavy children (map
// picker chains, image pickers) are presentational for these assertions.
jest.mock('@/app/(individual)/add-listing/SharedPropertyInfo', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => <View testID="shared-property-info" />,
  };
});
jest.mock('@/app/(individual)/add-listing/tabs/SellPropertyTab', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: () => <View /> };
});
jest.mock('@/app/(individual)/add-listing/tabs/RentPropertyTab', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: () => <View /> };
});
jest.mock('@/app/(individual)/add-listing/tabs/ExchangePropertyTab', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: () => <View /> };
});
jest.mock('@/shared/components/add-listing/ImageUploadZone', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: () => <View /> };
});

const mockGetWallet = plansService.getWallet as jest.Mock;

async function renderScreen() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CreateListingScreen />
    </QueryClientProvider>,
  );
}

describe('CreateListingScreen — free ad banner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the banner with the real remaining count when the wallet has free ads', async () => {
    mockGetWallet.mockResolvedValue({ freeAdsRemaining: 3, slots: [] });

    const { getByText } = await renderScreen();

    expect(await getByText('لديك 3 إعلانات مجانية')).toBeTruthy();
  });

  it('uses the singular wording for exactly one free ad', async () => {
    mockGetWallet.mockResolvedValue({ freeAdsRemaining: 1, slots: [] });

    const { getByText } = await renderScreen();

    expect(await getByText('لديك إعلان مجاني واحد')).toBeTruthy();
  });

  it('hides the banner when the free ad quota is exhausted (QA: quota mismatch vs My Activity)', async () => {
    mockGetWallet.mockResolvedValue({ freeAdsRemaining: 0, slots: [] });

    const { queryByText } = await renderScreen();

    expect(queryByText('لديك إعلان مجاني واحد')).toBeNull();
    expect(queryByText('لديك 0 إعلانات مجانية')).toBeNull();
  });

  it('hides the banner while the wallet is still loading instead of flashing a claim', async () => {
    mockGetWallet.mockReturnValue(new Promise(() => {}));

    const { queryByText } = await renderScreen();

    expect(queryByText('لديك إعلان مجاني واحد')).toBeNull();
  });
});
