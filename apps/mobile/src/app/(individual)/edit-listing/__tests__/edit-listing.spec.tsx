import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react-native';

import { propertiesService } from '@/shared/api/properties.service';
import { useListingStore } from '@/shared/store/useListingStore';

import EditListingScreen from '../[id]';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'prop-1' }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useNavigation: () => ({
    addListener: jest.fn(() => jest.fn()),
    dispatch: jest.fn(),
  }),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    ...jest.requireActual('react-native-safe-area-context'),
    SafeAreaView: View,
    useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
  };
});

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const Passthrough = React.forwardRef(function Passthrough(
    { children }: { children?: React.ReactNode },
    _ref: any,
  ) {
    return <>{children}</>;
  });
  return {
    BottomSheetModal: Passthrough,
    BottomSheetView: Passthrough,
    BottomSheetScrollView: Passthrough,
    BottomSheetBackdrop: () => null,
  };
});

jest.mock('@/shared/api/properties.service', () => ({
  propertiesService: {
    getPropertyById: jest.fn(),
    getFeaturesMetadata: jest.fn().mockResolvedValue(null),
    updateProperty: jest.fn(),
    uploadImages: jest.fn(),
  },
}));

// Pickers/map and the per-type tabs aren't what these assertions are about
function mockStub() {
  const { View } = require('react-native');
  return { __esModule: true, default: () => <View /> };
}
jest.mock('@/shared/components/map/MapPickerModal', () => mockStub());
jest.mock('@/shared/components/filters/SelectionDrawer', () => mockStub());
jest.mock('@/shared/components/add-listing/ImageUploadZone', () => mockStub());
jest.mock('@/app/(individual)/add-listing/tabs/SellPropertyTab', () =>
  mockStub(),
);
jest.mock('@/app/(individual)/add-listing/tabs/RentPropertyTab', () =>
  mockStub(),
);
jest.mock('@/app/(individual)/add-listing/tabs/ExchangePropertyTab', () =>
  mockStub(),
);

const activeApartmentForSale = {
  id: 'prop-1',
  type: 'SALE',
  category: 'APARTMENT',
  isFeatured: false,
  price: 120000,
  area: 150,
  beds: 3,
  baths: 2,
  floors: 1,
  location: 'مدينة جابر الأحمد، العاصمة',
  governorateId: 'capital',
  areaId: 'capital_1',
  areaSize: 150,
  description: 'شقة واسعة قريبة من الخدمات',
  phoneNumber: '99998888',
  views: 0,
  images: ['https://bucket.s3.amazonaws.com/properties/a.jpg'],
  features: [],
  createdAt: '2026-09-20T10:00:00.000Z',
  host: {
    id: 'u1',
    name: 'Ali',
    avatarUrl: '',
    joinedDate: '',
    isVerified: false,
    rating: 0,
  },
};

async function renderScreen() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const utils = await render(
    <QueryClientProvider client={queryClient}>
      <EditListingScreen />
    </QueryClientProvider>,
  );
  // Wait for the ad to load and pre-fill the form
  await utils.findByText('نوع الإعلان');
  return utils;
}

describe('EditListingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useListingStore.getState().resetForm();
    (propertiesService.getPropertyById as jest.Mock).mockResolvedValue(
      activeApartmentForSale,
    );
  });

  it('is the Edit Ad screen, loaded with the ad being edited', async () => {
    const { getAllByText, queryByText } = await renderScreen();

    expect(propertiesService.getPropertyById).toHaveBeenCalledWith('prop-1');
    // Header title and the save button
    expect(getAllByText('تعديل الاعلان').length).toBeGreaterThan(0);
    expect(queryByText('إضافة إعلان جديد')).toBeNull();
  });

  it('pre-fills the form with the ad’s current data', async () => {
    const { getByText, getByDisplayValue } = await renderScreen();

    expect(getByText('العاصمة')).toBeTruthy();
    expect(getByText('مدينة جابر الأحمد')).toBeTruthy();
    expect(getByText('شقة')).toBeTruthy();
    expect(getByDisplayValue('150')).toBeTruthy();
    expect(useListingStore.getState()).toMatchObject({
      isEdit: true,
      listingType: 'sell',
      adDetails: activeApartmentForSale.description,
      phoneNumber: activeApartmentForSale.phoneNumber,
    });
  });

  it('locks the fields that cannot change after publishing', async () => {
    const { getByText, getByDisplayValue } = await renderScreen();

    // Category, governorate and area are disabled pickers
    for (const value of ['شقة', 'العاصمة', 'مدينة جابر الأحمد']) {
      expect(getByText(value)).toBeDisabled();
    }
    // Area size is read-only
    expect(getByDisplayValue('150').props.editable).toBe(false);
  });

  it('keeps Save inactive until something changes', async () => {
    const { getAllByText } = await renderScreen();
    const saveButtonLabel = getAllByText('تعديل الاعلان').at(-1)!;

    expect(saveButtonLabel).toBeDisabled();
    fireEvent.press(saveButtonLabel);
    expect(propertiesService.updateProperty).not.toHaveBeenCalled();
  });
});
